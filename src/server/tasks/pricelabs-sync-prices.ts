import { prisma } from 'server/db'
import { DynamicPricing } from '@prisma/client'
import type { Task } from 'graphile-worker'
import PriceLabsApi from 'server/integrations/pricelabs/api'
import type { ListingPayload } from './types'
import { ListingPayloadSchema } from './types'
import ServiceFactory from 'server/services/serviceFactory'
import DateString from 'types/dateString'

const task: Task = async (payload, { addJob, logger }) => {
  const { listingId } = ListingPayloadSchema.parse(payload)
  const factory = await ServiceFactory.fromListingId(prisma, listingId)

  const listing = await factory.getListingService().getOne(listingId)
  if (!listing) {
    logger.error(`No listing found with id: ${listingId}`)
    return
  }

  const pricing = await factory.getRatesService().getPricing(listingId)
  if (pricing?.dynamicPricing !== DynamicPricing.PriceLabs) {
    logger.error(`PriceLabs is not enabled for ${listing.name} [${listingId}]`)
    return
  }

  const priceLabsApi = new PriceLabsApi()
  const response = await priceLabsApi.getPrices(listing.id)

  if (response.error) {
    logger.error(
      `Error getting prices for ${listing.name} [${listingId}]: ${response.error}`
    )
    return
  }

  if (response.data.length === 0) {
    logger.error(
      `No PriceLabs price data returned for ${listing.name} [${listingId}]`
    )
    return
  }

  const newPrices = response.data.map((price) => {
    return {
      date: DateString.fromString(price.date),
      price: price.price,
      minStay: price.min_stay,
    }
  })

  await factory
    .getRatesService()
    .savePrices(listingId, newPrices)
    .then(async () => {
      await addJob('pricelabs-sync-calendar', {
        listingId: listing.id,
      } as ListingPayload)
    })
}

module.exports = task
