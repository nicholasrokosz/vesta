import { PrismaClient } from '@prisma/client'
import type { NextApiRequest, NextApiResponse } from 'next'
import ServiceFactory from 'server/services/serviceFactory'
import type { PostmarkInboundMessage } from 'server/integrations/postmark/types'
import { parseMailboxHash } from 'server/services/email/parser'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ message: string }>
) {
  if (req.method !== 'POST' || !req.body) {
    res.status(404).send({ message: 'bad request' })
    return
  }
  const data = req.body as PostmarkInboundMessage
  console.log(JSON.stringify({ postmarkWebhook: `Incoming email`, data }))

  const { organizationId } = parseMailboxHash(data.MailboxHash)
  const factory = new ServiceFactory(new PrismaClient(), organizationId)
  await factory.getEmailService().processInbound(data)

  res.status(200).json({ message: `success!` })
}
