import { PrismaClient } from '@prisma/client'
import type { Task } from 'graphile-worker'

import { ListingPayloadSchema } from './types'
import ServiceFactory from 'server/services/serviceFactory'
import { captureException } from '@sentry/node'
import { DateTime } from 'luxon'

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

  const priceLabsService = new ServiceFactory(
    prisma,
    listing.organizationId
  ).getPriceLabsService()

  const fromDate = DateTime.now().startOf('day')
  const toDate = DateTime.now().plus({ year: 3 }).endOf('day')

  const result = await priceLabsService.syncCalendar(
    listing.id,
    fromDate,
    toDate
  )
  if (result.failure.length > 0) {
    logger.error(
      `Failed to sync calendar for listing: ${listingId}. ${result.failure[0].error}`
    )
    captureException(result.failure[0].error)
  }
}

module.exports = task
