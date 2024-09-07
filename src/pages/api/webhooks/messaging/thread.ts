import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from 'server/db'
import type { BpMessageThread } from 'server/services/messages/types'
import ServiceFactory from 'server/services/serviceFactory'

interface MessageWebhookRequest {
  organizationId: string
  request: BpMessageThread
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ message: string }>
) {
  if (req.method !== 'POST' || !req.body) {
    res.status(404).send({ message: 'bad request' })
    return
  }
  const data = req.body as MessageWebhookRequest
  console.log('MessageWebhookRequest', data)

  const factory = new ServiceFactory(prisma, data.organizationId)
  await factory.getBpMessageThreadService().processThread(data.request)

  res.status(200).json({ message: `success!` })
}
