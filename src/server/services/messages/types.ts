import type { IMessage } from 'types/messages'
import { z } from 'zod'
import {
  ChannelSchema,
  MessageUserSchema,
} from '../../../../prisma/generated/zod'
import type { Channel } from '@prisma/client'

export const BpMessageThreadSchema = z
  .object({
    bpThreadId: z.string(),
    productId: z.string(),
    guestName: z.string(),
    channel: ChannelSchema,
    lastMessageSentAt: z.string(),
    channelThreadId: z.string(),
    dateFrom: z.string(),
    dateTo: z.string(),
    bpReservationId: z.string().optional().nullable(),
  })
  .strict()
export type BpMessageThread = z.infer<typeof BpMessageThreadSchema>

export const BpMessageSchema = z
  .object({
    messageThreadId: z.string(),
    message: z.string(),
    user: MessageUserSchema,
    timestamp: z.date(),
    bpMessageId: z.string(),
    channelMessageId: z.string(),
  })
  .strict()
export type BpMessage = z.infer<typeof BpMessageSchema>

export type MessageThread = {
  id: string
  createdAt: Date
  guest: {
    id: string
    name: string
    email: string | null
    phone: string | null
  }
  listingId: string
  listing: {
    id: string
    name: string
    timeZone: string
  }

  channel: Channel
  messages: IMessage[]
  archived: boolean
  enableReminder: boolean
}
