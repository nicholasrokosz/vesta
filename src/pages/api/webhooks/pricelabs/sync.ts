import type { NextApiRequest, NextApiResponse } from 'next'
import * as Sentry from '@sentry/node'
import { quickAddJob } from 'graphile-worker'
import type { ListingPayload } from 'server/tasks/types'

interface LosDiscount {
  los: {
    los_night: string
    max_price: string
    min_price: string
    los_adjustment: string
  }
}

export interface SyncData {
  price: number
  date: string
  min_stay: number
  check_in: boolean
  check_out: boolean
  weekly_discount: number
  monthly_discount: number
  extra_person_fee: number
  extra_person_fee_trigger: number
  los_discount_v2: LosDiscount
}

export interface SyncPayload {
  listing_id: string
  last_refreshed: string
  data: SyncData[]
}

type VerifyPayload = {
  verify: 'true'
}

type Payload = SyncPayload | VerifyPayload

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST' || !req.body) {
    res.status(404).send({ message: 'bad request' })
    return
  }

  try {
    const prices = req.body as Payload

    if ('verify' in prices) {
      res.status(200).json({ message: 'endpoint verified' })
      return
    } else {
      await quickAddJob({}, 'pricelabs-sync-prices', {
        listingId: prices.listing_id,
      } as ListingPayload)

      res.status(200).json({ message: 'success' })
    }
  } catch (e) {
    let errorMessage = 'Error processing sync data'
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
