/* eslint-disable @typescript-eslint/no-unused-vars */
import type { NextApiRequest, NextApiResponse } from 'next'

interface HookMessage {
  error_code?: string[]
}

type VerifyPayload = {
  verify: 'true'
}

type Payload = HookMessage | VerifyPayload

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST' || !req.body) {
    res.status(404).send({ message: 'bad request' })
    return
  }

  const payload = req.body as Payload

  if ('verify' in payload) {
    res.status(200).json({ message: 'endpoint verified' })
  } else {
    console.log(JSON.stringify({ payload }))
  }

  res.status(200).json({ message: 'success' })
}
