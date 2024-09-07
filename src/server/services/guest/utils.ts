import { DateTime } from 'luxon'
import type { GuestCreate } from './types'
import type { ReservationStatus } from '@prisma/client'

type GuestQuery = {
  organizationId: string
  email?: string
  phone?: string
}

export const getQuery = (
  organizationId: string,
  { email, phone }: GuestCreate
) => {
  const query: GuestQuery = {
    organizationId,
  }

  if (phone) query.phone = phone
  if (email) query.email = email

  return query
}

export const cleanEmail = (email?: string | null) => {
  if (!email) return null

  const cleaned = email.trim().toLowerCase()
  if (cleaned === 'support@airbnb.com') return null

  return cleaned
}

export const cleanPhone = (phone?: string | null) => {
  if (!phone) return null
  if (phone === '555-555-5555') return null // Airbnb default phone number

  const cleaned = phone.trim().replace(/\D/g, '')

  // add country code, assuming US for now
  if (cleaned.length === 10) {
    return `+1${cleaned}`
  }

  return `+${cleaned}`
}

export const cleanName = (name: string) => {
  const cleaned = name.replace(',', '')

  return cleaned
}

// Get the next uncompleted reservation for a guest.
// If none exist, get the most recent reservation in the past.
// Relies on the reservations being sorted desc by toDate.
export const getNextReservation = (
  reservations: {
    id: string
    status: ReservationStatus
    calendarEvent: { id: string; fromDate: Date; toDate: Date }
  }[]
) => {
  const futureReservations = reservations.filter(
    (reservation) =>
      DateTime.fromJSDate(reservation.calendarEvent.toDate) > DateTime.now()
  )
  if (futureReservations.length > 0)
    return futureReservations[futureReservations.length - 1]

  return reservations[0]
}
