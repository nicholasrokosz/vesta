import { PrismaClient } from '@prisma/client'
import type { Task } from 'graphile-worker'
import ServiceFactory from 'server/services/serviceFactory'
import * as Sentry from '@sentry/node'
import { ListingPayloadSchema } from './types'

const task: Task = async (payload, { logger }) => {
  const { listingId } = ListingPayloadSchema.parse(payload)
  const prisma = new PrismaClient()

  const listing = await prisma.listing.findUnique({
    where: {
      id: listingId,
    },
  })

  if (!listing) {
    logger.error(`No listing found with id: ${listingId}`)
    return
  }

  if (!!listing.bpProductId) {
    try {
      await new ServiceFactory(prisma, listing.organizationId)
        .getListingService()
        .publishPricing(listing.id)
    } catch (error: unknown) {
      Sentry.captureException(error)
    }
  } else {
    logger.error(
      `No BookingPal product ID found for ${listing.name} [${listingId}]`
    )
  }
}

module.exports = task
