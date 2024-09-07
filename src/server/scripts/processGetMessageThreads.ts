import type { Organization } from '@prisma/client'
import { prisma } from 'server/db'
import OrganizationsService from 'server/services/organizations'
import ServiceFactory from 'server/services/serviceFactory'
import { captureErrorsInSentry } from 'utils/sentry'

async function processOrgs() {
  console.log(`Getting BP message threads...`)

  const orgs = await new OrganizationsService().getAll()
  const orgsToProcess = orgs.filter((org) => org.bookingPalConnection)

  await Promise.all(
    orgsToProcess.map(async (org) => {
      await processOrg(org)
    })
  )
}

async function processOrg(org: Organization) {
  console.log(`Processing org: ${org.name}`)
  const factory = new ServiceFactory(prisma, org.id)

  return captureErrorsInSentry(
    factory.getBpMessageThreadService().processThreads()
  )
    .catch((e) => {
      const error = e as Error
      console.log(`Error processing org: ${org.name}: ${error.message}`)
    })
    .finally(() => {
      console.log(`Finished processing org: ${org.name}`)
    })
}

captureErrorsInSentry(processOrgs()).catch((e) => {
  const error = e as Error
  console.log(`Error processing BP message threads ${error.message}`)
})

export { processOrgs }
