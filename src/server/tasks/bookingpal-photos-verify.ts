import { prisma } from 'server/db'
import type { Task } from 'graphile-worker'
import { ListingPayloadSchema } from './types'
import ServiceFactory from 'server/services/serviceFactory'
import * as Sentry from '@sentry/node'

const task: Task = async (payload, { logger, job }) => {
  const { listingId } = ListingPayloadSchema.parse(payload)
  logger.info(`Verifying photos for listing ${listingId}...`)

  const factory = await ServiceFactory.fromListingId(prisma, listingId)
  const listing = await factory.getListingService().getOne(listingId)

  if (!listing) {
    logger.error(`No listing found for [${listingId}]`)
    return
  } else if (!listing.content) {
    logger.error(`No content found for ${listing.name} [${listingId}]`)
    return
  } else if (!listing.bpProductId) {
    logger.error(
      `No BookingPal product ID found for ${listing.name} [${listingId}]`
    )
    return
  }

  try {
    const bpPhotos = await factory.getBookingPalService().getPhotos(listingId)
    const photos = listing.content.photos.join(',')

    if (bpPhotos.join(',') != photos) {
      if (job.attempts === job.max_attempts) {
        Sentry.captureMessage(
          `Photos for listing [${listingId}] not found in BookingPal after ${job.max_attempts} attempts.`
        )
      }

      throw new Error()
    }
  } catch (error: unknown) {
    throw new Error(
      `Photos for listing [${listingId}] not found in BookingPal] after ${job.attempts}. Retrying...`
    )
  }
}
module.exports = task
