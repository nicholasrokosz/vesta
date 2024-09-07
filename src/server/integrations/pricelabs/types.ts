import { ReservationStatus as DbStatus } from '@prisma/client'
import type { SyncData } from 'pages/api/webhooks/pricelabs/sync'

export type IntegrationFeatures = {
  min_stay: boolean
  check_in: boolean
  check_out: boolean
  monthly_weekly_discounts: boolean
  enforce_weekly_pms: boolean
  extra_person_fee: boolean
  los_pricing: boolean
}

export type IntegrationParams = {
  sync_url: string
  calendar_trigger_url: string
  hook_url: string
  regenerate_token: boolean
  features: IntegrationFeatures
}

export type Listing = {
  listing_id: string
  user_token: string
  location: {
    latitude: number | null
    longitude: number | null
    city: string
    country: string | null
  }
  name: string
  status: 'available' | 'unavailable'
  number_of_bedrooms?: number
  amenities?: string[]
}

export type ReservationStatus =
  | 'booked'
  | 'canceled'
  | 'blocked'
  | 'unconfirmed'

export type ReservationData = {
  reservation_id: string
  cancel_time?: string
  start_date: string
  end_date: string
  booked_time: string
  total_days: number
  total_cost: number
  total_fees: number
  total_taxes: number
  currency: string
  status: ReservationStatus
}

export type ReservationSyncRequest = {
  listing_id: string
  data: ReservationData[]
}

export type CalendarSettings = {
  min_stay: number
  check_in?: boolean
  check_out?: boolean
  weekly_discount?: number
  monthly_discount?: number
  extra_person_fee?: number
  extra_person_fee_trigger?: number
}

export type CalendarData = {
  date: string
  end_date?: string
  price: number
  available_units: number
  booked_units?: number
  blocked_units?: number
  settings?: CalendarSettings
}

export type CalendarSyncRequest = {
  listing_id: string
  currency: string
  data: CalendarData[]
}

export type ListingFailure = {
  details: Listing
  error: string
}

export type ListingResponse = {
  success: string[]
  failure: ListingFailure[]
}

export type CalendarFailure = {
  details: CalendarSyncRequest
  error: string
}

export type CalendarResponse = {
  success: string[]
  failure: CalendarFailure[]
}

export type ReservationFailure = {
  details: ReservationSyncRequest
  error: string
}

export type ReservationResponse = {
  success: string[]
  failure: ReservationFailure[]
}

export type GetPricesResponse = {
  id: string
  last_refreshed_at: string
  data: SyncData[]
  error?: string
}

export const convertStatus = (status: DbStatus): ReservationStatus => {
  switch (status) {
    case DbStatus.RESERVED:
      return 'booked'
    case DbStatus.CANCELLED:
      return 'canceled'
    case DbStatus.FAILED:
      return 'unconfirmed'
    case DbStatus.CONFIRMED:
      return 'booked'
    case DbStatus.EXCEPTION:
      return 'unconfirmed'
    case DbStatus.FULLY_PAID:
      return 'booked'
    case DbStatus.PROVISIONAL:
      return 'unconfirmed'
    default:
      return 'blocked'
  }
}
