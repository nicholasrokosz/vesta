import type { NextApiRequest, NextApiResponse } from 'next'

interface webhookBody {
  message: string
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ message: string }>
) {
  if (req.method !== 'POST' || !req.body) {
    res.status(404).send({ message: 'bad request' })
    return
  }

  const body: webhookBody = req.body as webhookBody
  console.log('webhookBody', body)

  res.status(200).json({ message: 'success' })
}
