import { z } from 'zod'
import type {
  TriggerType,
  TriggerRangeType,
  TriggerUnitType,
} from '../../prisma/generated/zod'
import {
  TriggerSchema,
  TriggerRangeSchema,
  TriggerUnitSchema,
} from '../../prisma/generated/zod'

export const MessageTemplateCreateSchema = z
  .object({
    id: z.string().optional(),
    title: z.string(),
    body: z.string(),
    bodyHtml: z.string(),
    enabled: z.boolean().optional(),
    trigger: TriggerSchema.nullable().optional(),
    triggerRange: TriggerRangeSchema.nullable().optional(),
    triggerUnit: TriggerUnitSchema.nullable().optional(),
    triggerValue: z.number().nullable().optional(),
    allListings: z.boolean(),
    listingIds: z.string().array().optional(),
  })
  .strict()
export type MessageTemplateCreate = z.infer<typeof MessageTemplateCreateSchema>

export interface ICannedMessage {
  id: string
  title: string
  body: string
}

export type Trigger = {
  label: string
  value: TriggerType
}
export const Triggers: Trigger[] = [
  { label: 'Check-in', value: 'CheckIn' },
  { label: 'Checkout', value: 'CheckOut' },
  { label: 'Reservation confirmed', value: 'ReservationConfirmed' },
]

export type TriggerRange = {
  label: string
  value: TriggerRangeType
}
export const TriggerRanges: TriggerRange[] = [
  { label: 'Immediately', value: 'Immediately' },
  { label: 'Before', value: 'Before' },
  { label: 'After', value: 'After' },
]

export type TriggerUnit = {
  label: string
  value: TriggerUnitType
}
export const TriggerUnits: TriggerUnit[] = [
  { label: 'Day(s)', value: 'Days' },
  { label: 'Hour(s)', value: 'Hours' },
  { label: 'Minute(s)', value: 'Minutes' },
]

export interface IMessageTemplate {
  id: string
  title: string
  body: string
  enabled: boolean
  triggerName?: string
  allListings: boolean
  listings: { name: string; photo: string }[]
}

export interface ITriggerImmediately {
  type: TriggerType
  range: 'Immediately'
}
export interface ITriggerAfterBefore {
  type: TriggerType
  range: 'After' | 'Before'
  unit: TriggerUnitType
  value: number
}
export type ITrigger = ITriggerImmediately | ITriggerAfterBefore
