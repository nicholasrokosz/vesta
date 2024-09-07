import { prisma } from 'server/db'
import type { AddJobFunction, Logger, Task } from 'graphile-worker'
import type { ListingPayload } from './types'
import ServiceFactory from 'server/services/serviceFactory'
import OrganizationsService from 'server/services/organizations'
import type { Organization } from '@prisma/client'
import * as Sentry from '@sentry/node'

const task: Task = async (_payload, { logger, addJob }) => {
  logger.info(`Scheduling organization availability jobs...`)
  const orgs = await new OrganizationsService().getAll()

  try {
    await Promise.all(
      orgs.map(async (org) => {
        await processOrg(org, logger, addJob)
      })
    )
  } catch (error: unknown) {
    Sentry.captureException(error)
  }
}

async function processOrg(
  org: Organization,
  logger: Logger,
  addJob: AddJobFunction
) {
  logger.info(`Processing org: ${org.name}`)

  const factory = new ServiceFactory(prisma, org.id)

  const listings = (
    await factory.getListingService().getAllByOrganization(org.id)
  ).filter((listing) => !!listing.bpProductId)

  await Promise.all(
    listings.map(async (listing) => {
      await addJob('bookingpal-sync-listing-availabilities', {
        listingId: listing.id,
      } as ListingPayload)
    })
  )
}

module.exports = task
