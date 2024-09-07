import { prisma } from 'server/db'
import type { Task } from 'graphile-worker'
import type { ListingPayload } from './types'
import { ListingPayloadSchema } from './types'
import ServiceFactory from 'server/services/serviceFactory'
import * as Sentry from '@sentry/node'

const task: Task = async (payload, { logger, job, addJob }) => {
  const { listingId } = ListingPayloadSchema.parse(payload)
  logger.info(`Publishing photos for listing ${listingId}...`)

  const factory = await ServiceFactory.fromListingId(prisma, listingId)
  const listing = await factory.getListingService().getOne(listingId)

  if (!listing) {
    logger.error(`No listing found for [${listingId}]`)
    return
  } else if (!listing.bpProductId) {
    logger.error(
      `No BookingPal product ID found for ${listing.name} [${listingId}]`
    )
    return
  }

  try {
    await factory.getListingService().publishPhotos(listingId)
    await addJob(
      'bookingpal-photos-verify',
      {
        listingId: listingId,
      } as ListingPayload,
      {
        runAt: new Date(Date.now() + 1000 * 60 * 10), // 10 minutes from now
        maxAttempts: 8, // About 78 minutes
      }
    )
  } catch (error: unknown) {
    if (job.attempts === job.max_attempts) {
      Sentry.captureMessage(
        `Failed to publish photos for listing [${listingId}] after ${job.max_attempts} attempts.`
      )
    }

    Sentry.captureException(error, {})
    throw error
  }
}
module.exports = task
