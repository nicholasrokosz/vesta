import { DynamicPricing, PrismaClient } from '@prisma/client'
import { type Task } from 'graphile-worker'
import type { ListingPayload } from './types'

const task: Task = async (_payload, { logger, addJob }) => {
  const prisma = new PrismaClient()

  const listingsWitPriceLabs = await prisma.pricing.findMany({
    where: {
      dynamicPricing: DynamicPricing.PriceLabs,
    },
  })
  await Promise.all(
    listingsWitPriceLabs.map(async (pricing) => {
      const listingId = pricing.listingId
      logger.info(`Syncing reservations for listing: ${listingId}`)
      await addJob('pricelabs-sync-reservations', {
        listingId: listingId,
      } as ListingPayload)
    })
  )
}

module.exports = task
