import type { MessageUser } from '@prisma/client'
import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from 'server/db'
import ServiceFactory from 'server/services/serviceFactory'

interface MessageWebhookRequest {
  organizationId: string
  request: {
    messageThreadId: string
    message: string
    user: MessageUser
    timestamp: string
    bpMessageId: string
    channelMessageId: string
  }
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

  const message = {
    ...data.request,
    timestamp: new Date(data.request.timestamp),
  }

  const factory = new ServiceFactory(prisma, data.organizationId)
  await factory.getBpMessageThreadService().processMessage(message)

  res.status(200).json({ message: `success!` })
}
