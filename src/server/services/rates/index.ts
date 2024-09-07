import { DynamicPricing, type PrismaClient } from '@prisma/client'
import { DateTime } from 'luxon'
import { getDateRange } from './utils'
import type { PricingCreate } from 'types/pricing'
import type BookingPalService from '../channels/bookingpal'
import type ListingService from '../listing'
import { quickAddJob } from 'graphile-worker'
import type { ListingPayload } from 'server/tasks/types'
import DateString from 'types/dateString'
import type { Price } from './types'

class RateService {
  constructor(
    private readonly bpService: BookingPalService,
    private readonly listingService: ListingService,
    private readonly prismaPricing: PrismaClient['pricing'],
    private readonly prismaRates: PrismaClient['dailyRate'],
    private readonly organizationId: string
  ) {}

  async getPrices(
    listingId: string,
    startDate: DateString,
    endDate: DateString
  ) {
    const rates = await this.prismaRates.findMany({
      where: {
        listingId,
        date: { gte: startDate.toDate(), lte: endDate.toDate() },
      },
    })

    const prices = rates.map((rate) => {
      return {
        date: DateString.fromDate(rate.date),
        price: rate.rate,
        minStay: rate.minStay,
        listingId,
      }
    })

    return prices
  }

  async getFuturePrices(listingId: string) {
    const rates = await this.prismaRates.findMany({
      where: { listingId, date: { gte: new Date() } },
    })

    const prices = rates.map((rate) => {
      return {
        date: DateString.fromDate(rate.date),
        price: rate.rate,
        minStay: rate.minStay,
      }
    })

    return prices
  }

  async savePrices(listingId: string, prices: Price[]) {
    await this.prismaRates.deleteMany({ where: { listingId } })

    await this.prismaRates.createMany({
      data: prices.map((price) => {
        return {
          listingId,
          date: price.date.toDate(),
          rate: price.price,
          minStay: price.minStay,
        }
      }),
    })

    const bpProductId = await this.bpService.getProductId(listingId)
    if (bpProductId) {
      await quickAddJob({}, 'bookingpal-publish-pricing', {
        listingId,
      } as ListingPayload)
    }
  }

  private async calculatePrices(
    listingId: string,
    startDate: DateString,
    endDate: DateString
  ) {
    const pricing = await this.prismaPricing.findUnique({
      where: {
        listingId,
      },
      include: {
        discounts: true,
        dates: true,
      },
    })

    if (!pricing) return []

    const prices = getDateRange(startDate, endDate, pricing)
    return prices
  }

  private async calculateRatesForNextThreeYears(listingId: string) {
    const today = DateTime.local() // Today's date
    const threeYearsFromNow = today.plus({ years: 3 }) // Date two years from now

    const rates = await this.calculatePrices(
      listingId,
      DateString.fromString(today.toISODate()),
      DateString.fromString(threeYearsFromNow.toISODate())
    )
    return rates
  }

  async getPricing(listingId: string) {
    const pricing = await this.prismaPricing.findUnique({
      where: {
        listingId,
      },
      include: {
        dates: { select: { startDate: true, endDate: true, percent: true } },
        discounts: { select: { days: true, percent: true } },
      },
    })

    return pricing
  }

  async upsertPricing(pricing: PricingCreate) {
    if (pricing.id) {
      await this.prismaPricing.update({
        where: {
          id: pricing.id,
        },
        data: {
          discounts: {
            deleteMany: {},
          },
          dates: {
            deleteMany: {},
          },
        },
      })
    }

    const pricingInput = {
      ...pricing,
      dates: { createMany: { data: pricing.dates } },
      discounts: { createMany: { data: pricing.discounts } },
    }

    const listingId = pricing.listingId
    await this.prismaPricing.upsert({
      where: {
        listingId,
      },
      update: pricingInput,
      create: pricingInput,
    })

    const bpProductId = await this.bpService.getProductId(listingId)
    if (bpProductId && pricing.discounts?.length > 0) {
      await this.listingService.publishLengthOfStayDiscounts(listingId)
    }

    // If there's no dynamic pricing, calculate rates and save them to db.
    if (pricing.dynamicPricing === DynamicPricing.None) {
      const rates = await this.calculateRatesForNextThreeYears(listingId)
      await this.savePrices(listingId, rates)
    }
  }
}

export default RateService
