import type { NextApiRequest, NextApiResponse } from 'next'
import { DateTime } from 'luxon'
import * as Sentry from '@sentry/node'
import ServiceFactory from 'server/services/serviceFactory'
import { prisma } from 'server/db'

export type CalendarTrigger = {
  listing_id: string
  start_date: string
  end_date: string
}

type VerifyPayload = {
  verify: 'true'
}

type Payload = CalendarTrigger | VerifyPayload

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST' || !req.body) {
    res.status(404).send({ message: 'bad request' })
    return
  }

  try {
    const payload = req.body as Payload

    if ('verify' in payload) {
      res.status(200).json({ message: 'endpoint verified' })
      return
    } else {
      const listingId = payload.listing_id
      const fromDate = DateTime.fromJSDate(new Date(payload.start_date))
      const toDate = DateTime.fromJSDate(new Date(payload.end_date))

      const priceLabsService = (
        await ServiceFactory.fromListingId(prisma, listingId)
      ).getPriceLabsService()

      const result = await priceLabsService.syncCalendar(
        listingId,
        fromDate,
        toDate
      )
      if (result.failure.length > 0) {
        console.error(
          `Failed to sync reservations for listing: ${listingId}. ${result.failure[0].error}`
        )
        Sentry.captureException(result.failure[0].error)
      }

      res.status(200).send({ message: 'success' })
    }
  } catch (e) {
    let errorMessage = 'Error processing calendar trigger data'
    if (e instanceof Error) {
      errorMessage = `${errorMessage}: ${e.message}`
      Sentry.captureException(e.cause ? e.cause : e)
    } else if (typeof e === 'string') {
      errorMessage = `${errorMessage}: ${e}`
    }

    console.error(errorMessage)
    res.status(500).json({
      error: errorMessage,
    })
  }
}
