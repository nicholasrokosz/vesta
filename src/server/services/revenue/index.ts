import { getTaxes, getGuestFees, feeIsApplicaable } from './reservationRevenue'
import { getGuests, getNights, getNightsText } from '../calendar/dates'
import type {
  Revenue,
  RevenueCreate,
  RevenueFeeCreate,
  RevenueFilters,
  RevenueWithFeesAndTaxes,
} from 'types/revenue'
import type { Listing, Prisma } from '@prisma/client'
import { Channel, RevenueDeductionType, RevenueEntryType } from '@prisma/client'
import { RevenueSummaryBuilder } from 'server/services/revenue/revenueSummary'
import type RateService from '../rates'
import ListingService from '../listing'
import type { BpRevenuePayload } from './bpRevenue'
import { processAirbnbRevenue, processVrboRevenue } from './bpRevenue'
import { mapReservationStatusToFriendlyName } from 'utils/reservationStatus'
import DateString from 'types/dateString'
import { formatAddress } from 'utils/vesta'

class RevenueService {
  private readonly listingService: ListingService

  constructor(
    private readonly prisma: Prisma.TransactionClient,
    private readonly organizationId: string,
    private readonly rateService: RateService
  ) {
    this.listingService = new ListingService()
  }

  async calculateRevenue(
    listingId: string,
    startDate: Date,
    endDate: Date,
    guests: number,
    fees: RevenueFeeCreate[],
    discount: number,
    adjustFeeValue: boolean
  ) {
    const listing = await this.listingService.getOne(listingId)
    const nights = getNights(startDate, endDate)

    const businessModel = await this.listingService.getBusinessModelForRevenue(
      listingId
    )
    if (!listing || !businessModel || !businessModel.deductions)
      throw new Error('Listing not found')

    const ratesByDay = await this.rateService.getPrices(
      listingId,
      DateString.fromDate(startDate),
      DateString.fromDate(endDate)
    )

    const accommodationRevenue = ratesByDay.reduce((acc, curr) => {
      return acc + curr.price
    }, 0)

    const discountAmount = discount
      ? accommodationRevenue * (discount / 100)
      : 0
    const discountedAccommodationRevenue = accommodationRevenue - discountAmount

    const taxRates = businessModel.taxRates || {
      municipal: 0,
      county: 0,
      state: 0,
    }

    const accommodationTaxes = getTaxes(
      discountedAccommodationRevenue,
      businessModel.deductions.pmcShare ?? 50,
      taxRates
    )

    const guestFees = getGuestFees(
      fees,
      guests,
      getNights(startDate, endDate),
      listing.guests,
      taxRates,
      adjustFeeValue
    )

    // Guest fees calculates taxes already, but keeping this in place to prevent a larger refactor of this code
    const feeTaxes = guestFees.fees
      .filter(({ taxable }) => taxable)
      .map((fee) => ({
        ...getTaxes(fee.value, fee.pmcShare, taxRates),
      }))

    const bothArr: {
      taxes: { text: string; total: number; manager: number; owner: number }[]
      total: number
    }[] = [accommodationTaxes, ...feeTaxes]

    const taxesTotal = bothArr.reduce((a, b) => a + b.total, 0)

    const grossRevenue = accommodationRevenue + guestFees.total + taxesTotal

    const totalAfterDiscount = grossRevenue - discountAmount

    return {
      grossRevenue,
      accommodationRevenue,
      pmcShare: businessModel.deductions.pmcShare || 0,
      rates: ratesByDay.map((day) => {
        return {
          date: day.date,
          value: day.price,
          description: 'Nightly Rate',
        }
      }),
      taxes: accommodationTaxes.taxes.map((tax) => {
        return {
          description: tax.text,
          value: tax.total,
        }
      }),
      fees: guestFees,
      taxesTotal,
      discount: discountAmount,
      totalAfterDiscount,
      nights,
    }
  }

  async getReservationRevenue(reservationId: string) {
    const revenue = await this.prisma.revenue.findUnique({
      where: { reservationId: reservationId },
      include: {
        fees: { include: { deductions: true } },
        reservation: {
          include: {
            calendarEvent: {
              include: {
                listing: {
                  include: { fees: true },
                },
              },
            },
            guest: true,
          },
        },
      },
    })

    // TODO: Handle this better
    if (!revenue) return

    const { reservation } = revenue
    const { calendarEvent } = reservation
    const { listing } = calendarEvent
    const numberOfNights = getNights(
      calendarEvent.fromDate,
      calendarEvent.toDate
    )

    const summary = new RevenueSummaryBuilder(revenue, numberOfNights).build()

    return {
      revenue: summary.getSummary(),
      reservation: {
        id: reservation.id,
        address: formatAddress(listing),
        unitType: listing.unitType,
        listingName: listing.name,
        timeZone: listing.timeZone,
        adults: reservation.adults ?? 0,
        children: reservation.children ?? 0,
        name: reservation.guest.name ?? '',
        email: reservation.guest.email ?? '',
        channel: reservation.channel ?? '',
        guests: getGuests(reservation.adults, reservation.children),
        checkin: calendarEvent.fromDate,
        checkout: calendarEvent.toDate,
        nights: getNightsText(calendarEvent.fromDate, calendarEvent.toDate),
        status: reservation.status,
        confirmationCode: reservation.confirmationCode || '',
      },
    }
  }

  async createRevenue(
    input: RevenueCreate
  ): Promise<RevenueWithFeesAndTaxes | null> {
    const revenue = await this.prisma.revenue.create({
      data: {
        reservationId: input.reservationId,
        pmcShare: input.pmcShare,
        channelCommission: input.channelCommission,
        discount: ((input.discount ?? 0) / input.accommodationRevenue) * 100, // Discount is a percentage
        fees: {
          create: {
            name: 'Accommodation revenue',
            value: input.accommodationRevenue,
            pmcShare: input.pmcShare,
            unit: 'PerStay',
            type: RevenueEntryType.ACCOMMODATION,
            taxable: true,
            deductions: {
              createMany: {
                data: input.taxes.map((tax) => ({
                  description: tax.description,
                  value: tax.value,
                  type: RevenueDeductionType.TAX,
                })),
              },
            },
          },
        },
      },
    })

    for (const guestFee of input.fees) {
      await this.prisma.revenueFee.create({
        data: {
          name: guestFee.name,
          value: guestFee.value,
          unit: guestFee.unit,
          taxable: guestFee.taxable,
          pmcShare: guestFee.pmcShare,
          revenueId: revenue.id,
          type: RevenueEntryType.GUEST_FEE,
          deductions: {
            createMany: {
              data: guestFee.taxes.map((tax) => ({
                description: tax.description,
                value: tax.value,
                type: RevenueDeductionType.TAX,
                revenueId: revenue.id,
              })),
            },
          },
        },
      })
    }

    return await this.prisma.revenue.findUnique({
      where: { id: revenue.id },
      include: {
        fees: { include: { deductions: true } },
        reservation: { select: { channel: true } },
      },
    })
  }

  async getAllReservationRevenue(filter: RevenueFilters) {
    const dateFilter = filter.fromDate
      ? { fromDate: { lte: new Date(filter.fromDate) } }
      : undefined

    const revenueWithReservation = await this.prisma.revenue.findMany({
      where: {
        reservation: {
          calendarEvent: {
            listing: { organizationId: this.organizationId },
            ...dateFilter,
          },
        },
      },
      include: {
        reservation: {
          include: {
            calendarEvent: {
              include: {
                listing: {
                  include: { propertyOwner: true, fees: true, content: true },
                },
              },
            },
            guest: true,
          },
        },
        fees: { include: { deductions: true } },
      },
    })

    return revenueWithReservation.map((revenue) => {
      const reservation = revenue.reservation
      const calendarEvent = reservation.calendarEvent
      const numberOfNights = getNights(
        calendarEvent.fromDate,
        calendarEvent.toDate
      )

      const summary = new RevenueSummaryBuilder(revenue, numberOfNights).build()

      return {
        id: reservation.id,
        listingId: calendarEvent.listingId,
        listingName: calendarEvent.listing.name ?? '',
        listingPhoto: calendarEvent.listing.content?.photos[0] ?? '',
        channel: reservation.channel ?? '',
        name: reservation.guest.name ?? '',
        email: reservation.guest.email ?? '',
        status: mapReservationStatusToFriendlyName(
          reservation.status || '',
          calendarEvent.fromDate,
          calendarEvent.toDate
        ),
        fromDate: DateString.fromDate(calendarEvent.fromDate).toString(),
        toDate: DateString.fromDate(calendarEvent.toDate).toString(),
        confirmationCode: reservation.confirmationCode || '',
        numberOfNights: getNights(calendarEvent.fromDate, calendarEvent.toDate),
        revenue: summary.getSummary(),
        bookedOn: calendarEvent.bookedOn
          ? DateString.fromDate(calendarEvent.bookedOn).toString()
          : undefined,
        payoutStatus: revenue.payoutStatus,
        propertyOwner: revenue.reservation.calendarEvent.listing.propertyOwner,
      }
    })
  }

  async getFeesForDirectBooking(
    listingId: string,
    guests: number,
    pets: boolean
  ) {
    const businessModel = await this.listingService.getBusinessModelForRevenue(
      listingId
    )

    const listing = await this.listingService.getOne(listingId)

    if (!businessModel || !listing) return []

    const fees = businessModel.fees.map((fee) => {
      return {
        ...fee,
        applicable: feeIsApplicaable(fee, guests, listing?.guests, pets),
      }
    })

    return fees
  }

  async processBpRevenue(
    channel: Channel,
    listing: Listing,
    reservationId: string,
    payload: BpRevenuePayload
  ) {
    const businessModel = await this.listingService.getBusinessModelForRevenue(
      listing.id
    )

    if (
      !businessModel ||
      !businessModel.deductions?.pmcShare ||
      !businessModel.taxRates
    ) {
      throw new Error('Business model not found for listing')
    }

    let revenue: Revenue

    switch (channel) {
      case Channel.Airbnb:
        revenue = processAirbnbRevenue(reservationId, businessModel, payload)
        break
      case Channel.VRBO:
        revenue = processVrboRevenue(reservationId, businessModel, payload)
        break
      default:
        throw new Error('Channel not supported')
    }

    return await this.createRevenue(revenue)
  }

  async createDirectBookingRevenue(
    listingId: string,
    reservationId: string,
    fromDate: Date,
    toDate: Date,
    numberOfGuests: number,
    fees: RevenueFeeCreate[],
    discount: number,
    adjustFeeValue: boolean
  ): Promise<RevenueWithFeesAndTaxes | null> {
    const revenue = await this.calculateRevenue(
      listingId,
      fromDate,
      toDate,
      numberOfGuests,
      fees,
      discount,
      adjustFeeValue
    )

    return await this.createRevenue({
      ...revenue,
      fees: revenue.fees.fees,
      taxes: revenue.taxes,
      discount: revenue.discount,
      reservationId: reservationId,
    })
  }
}

export default RevenueService
