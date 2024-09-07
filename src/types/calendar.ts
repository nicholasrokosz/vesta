import { RequestToBookDeclineReasonType } from 'server/integrations/bookingpal/types'
import { z } from 'zod'
import type { CalendarEventTypeType } from '../../prisma/generated/zod'
import { ChannelSchema } from '../../prisma/generated/zod'
import { ReservationStatusSchema } from '../../prisma/generated/zod'
import { CalendarEventTypeSchema } from '../../prisma/generated/zod'
import DateString from './dateString'
import { RevenueFeeCreateSchema } from './revenue'
import type { Prisma } from '@prisma/client'
import { Channel } from '@prisma/client'

const stringToDateString = z
  .string()
  .regex(DateString.FORMAT)
  .transform((val) => new DateString(val))

export type ReservationWithCalendarEvent = Prisma.ReservationGetPayload<{
  include: {
    guest: true
    calendarEvent: { include: { listing: { include: { organization: true } } } }
  }
}>

export const ReservationSchema = z
  .object({
    id: z.string(),
    listingId: z.string(),
    bpReservationId: z.string().optional(),
    fromDate: stringToDateString,
    toDate: stringToDateString,
    channel: ChannelSchema,
    adults: z.number(),
    children: z.number(),
    pets: z.number().optional(),
    name: z.string(),
    email: z.string().optional(),
    phone: z.string().optional(),
    status: ReservationStatusSchema.optional(),
    confirmationCode: z.string().optional(),
    fees: RevenueFeeCreateSchema.array().optional(),
    discount: z.number().optional(),
    bookedOn: z.date().optional(),
  })
  .strict()

export const ReservationCreateSchema = ReservationSchema.omit({
  id: true,
})

export const ReservationCreateBookingPalSchema = ReservationCreateSchema.and(
  z.object({
    bpReservationId: z.string(),
  })
)

export const ReservationCreateManualDirectSchema = ReservationCreateSchema.and(
  z.object({
    channel: z.literal(Channel.Direct),
  })
)
export const ReservationCreateManualAirbnbSchema = ReservationCreateSchema.and(
  z.object({
    channel: z.literal(Channel.Airbnb),
  })
)

export const ReservationDirectCreateSchema = ReservationCreateSchema.omit({
  listingId: true,
}).extend({
  listingKey: z.string(),
  channel: z.literal(Channel.Direct),
})

export const ReservationBulkCreateSchema = z.array(
  z.object({
    listingName: z.string(),
    channel: ChannelSchema,
    fromDate: z.string(),
    toDate: z.string(),
    bookedOn: z.string().optional(),
    guestName: z.string(),
    email: z.string().optional(),
    phone: z.string().optional(),
    confirmationCode: z.string(),
  })
)

export type Reservation = z.infer<typeof ReservationSchema>
export type ReservationCreate = z.infer<typeof ReservationCreateSchema>
export type ReservationCreateBookingPal = z.infer<
  typeof ReservationCreateBookingPalSchema
>
export type ReservationCreateManualDirect = z.infer<
  typeof ReservationCreateManualDirectSchema
>

export type ReservationCreateManualAirbnb = z.infer<
  typeof ReservationCreateManualAirbnbSchema
>

export type ReservationBulkCreate = z.infer<typeof ReservationBulkCreateSchema>
export type ReservationDirectCreate = z.infer<
  typeof ReservationDirectCreateSchema
>

export const CalendarEventSchema = z
  .object({
    id: z.string().optional(),
    listingId: z.string(),
    type: CalendarEventTypeSchema,
    fromDate: stringToDateString,
    toDate: stringToDateString,
    notes: z.string().optional(),
  })
  .strict()
export type CalendarEvent = z.infer<typeof CalendarEventSchema>

export interface ICalendarEvent {
  id: string
  listingId: string
  type: CalendarEventTypeType
  fromDate: Date
  toDate: Date
  notes?: string

  listingName: string
  listingOwner: string
  listingPhoto: string
  listingAddress?: string
  listingUnitType?: string
  listingTimeZone: string
  listingWifiName?: string
  listingWifiPassword?: string
  listingDoorCode?: string
  listingNotes?: string
  listingGuests?: number
  listingBeds?: number
  listingBaths?: number

  reservation?: {
    id: string
    name: string
    email: string
    adults: number
    children: number
    channel: string
    guests: string
    nights: string
    scheduledMessages?: {
      scheduledAt: Date
      status: string
      title: string
    }[]
    status:
      | 'CANCELLED'
      | 'CONFIRMED'
      | 'FULLY_PAID'
      | 'PROVISIONAL'
      | 'RESERVED'
      | 'EXCEPTION'
      | 'FAILED'
    confirmationCode?: string
    hasRevenue?: boolean
    messageThreadId?: string
  }
}

export const RequestToBookResponseSchema = z
  .object({
    reservationId: z.string(),
    approve: z.boolean(),
    denyReason: z.nativeEnum(RequestToBookDeclineReasonType).optional(),
    denyMessage: z.string().optional(),
  })
  .strict()
export type RequestToBookResponse = z.infer<typeof RequestToBookResponseSchema>

export type BookedDates = {
  blockedCheckIn: string[]
  blockedCheckOut: string[]
}
