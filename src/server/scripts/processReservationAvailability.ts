import { prisma } from 'server/db'
import ServiceFactory from 'server/services/serviceFactory'
import { captureErrorsInSentry } from 'utils/sentry'

async function processQueue() {
  console.log(`Processing BP availability queue...`)
  return await prisma.reservationBpRequest
    .findMany({
      where: { status: 'PENDING' },
    })
    .then(async (requests) => {
      for (const request of requests) {
        await processRequest(request)
      }

      return requests.length
    })
}

interface Props {
  id: string
  organizationId: string
  listingId: string
  fromDate: Date
  toDate: Date
  available: boolean
}

async function processRequest({
  id,
  organizationId,
  listingId,
  fromDate,
  toDate,
  available,
}: Props) {
  try {
    const factory = new ServiceFactory(prisma, organizationId)

    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
    })

    await factory
      .getBookingPalService()
      .sendAvailability(
        listingId,
        [fromDate, toDate],
        available,
        listing?.propertyOwnerId || null
      )

    await prisma.reservationBpRequest.update({
      where: { id },
      data: { status: 'SENT' },
    })
  } catch (e) {
    await prisma.reservationBpRequest.update({
      where: { id },
      data: { status: 'FAILED' },
    })
  }
}

captureErrorsInSentry(processQueue())
  .then((number) => {
    console.log(`Processed ${number} BP availability requests.`)
  })
  .catch((e) => {
    const error = e as Error
    console.log(
      `Error processing BP availability request queue ${error.message}`
    )
  })

export { processQueue }
