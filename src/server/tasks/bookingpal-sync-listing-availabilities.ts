import { prisma } from 'server/db'
import type { Task } from 'graphile-worker'
import { ListingPayloadSchema } from './types'
import ServiceFactory from 'server/services/serviceFactory'
import * as Sentry from '@sentry/node'

const task: Task = async (payload, { logger }) => {
  const { listingId } = ListingPayloadSchema.parse(payload)
  logger.info(`Sending availabilities for listing ${listingId}...`)

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
    const availabilities = await factory
      .getCalendarService()
      .getAvailabilitiesByListing(listingId)

    await factory
      .getBookingPalService()
      .sendAvailabilities(
        Number(listing.bpProductId),
        availabilities,
        listing.propertyOwnerId
      )
  } catch (error: unknown) {
    Sentry.captureException(error)
  }
}
module.exports = task
