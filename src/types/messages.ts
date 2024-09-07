import { z } from 'zod'
import type { MessageUserType } from '../../prisma/generated/zod'
import { MessageUserSchema } from '../../prisma/generated/zod'
import type { ReservationStatus } from './reservation'

export const MessageCreateSchema = z
  .object({
    messageThreadId: z.string(),
    message: z.string(),
    user: MessageUserSchema,
  })
  .strict()
export type MessageCreate = z.infer<typeof MessageCreateSchema>

export const MessageThreadUpdateReadSchema = z
  .object({
    id: z.string(),
    read: z.boolean(),
  })
  .strict()
export type MessageThreadRead = z.infer<typeof MessageThreadUpdateReadSchema>

export const MessageThreadUpdateArchivedSchema = z
  .object({
    id: z.string(),
    archived: z.boolean(),
  })
  .strict()
export type MessageThreadArchived = z.infer<
  typeof MessageThreadUpdateArchivedSchema
>

export interface IMessage {
  id: string
  message: string
  user: MessageUserType
  timestamp: Date
  read?: boolean
}

export const OpenAIChatSchema = z.object({
  listingId: z.string(),
  prompts: z
    .object({
      role: z.enum(['system', 'user', 'assistant']),
      content: z.string(),
      name: z.string().optional(),
    })
    .array(),
  messageThreadId: z.string(),
})

export interface IMessageThread {
  id: string
  guestName: string
  guestEmail: string | null
  guestPhone: string | null
  lastMessageSentAt: Date
  lastMessageText: string
  listing: { name: string; id: string; timeZone: string }
  messages: IMessage[]
  status: ReservationStatus | string
  calendarEventId?: string
  channel: string
  unreadMessageCount: number
  isOverdue: boolean
  disableSending: boolean
  archived: boolean
  enableReminder: boolean
}
