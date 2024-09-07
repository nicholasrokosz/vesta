import { ReservationStatus } from '@prisma/client'
import { DateTime } from 'luxon'
import { ReservationStatus as FriendlyStatus } from 'types/reservation'

export const mapReservationStatusToFriendlyName = (
  status: ReservationStatus | '',
  checkIn: Date,
  checkOut: Date
) => {
  const now = DateTime.local()
  const checkInDate = DateTime.fromJSDate(checkIn)
  const checkOutDate = DateTime.fromJSDate(checkOut)

  if (status === ReservationStatus.PROVISIONAL) {
    return FriendlyStatus.INQUIRY
  } else if (status === ReservationStatus.CANCELLED) {
    return FriendlyStatus.CANCELLED
  } else if (status === ReservationStatus.RESERVED) {
    return FriendlyStatus.RESERVED
  } else if (
    (status === ReservationStatus.CONFIRMED ||
      status === ReservationStatus.FULLY_PAID) &&
    checkInDate >= now
  ) {
    return FriendlyStatus.UPCOMING
  } else if (
    (status === ReservationStatus.CONFIRMED ||
      status === ReservationStatus.FULLY_PAID) &&
    checkInDate <= now &&
    checkOutDate >= now
  ) {
    return FriendlyStatus.CHECKED_IN
  } else if (
    (status === ReservationStatus.CONFIRMED ||
      status === ReservationStatus.FULLY_PAID) &&
    checkOutDate <= now
  ) {
    return FriendlyStatus.CHECKED_OUT
  } else {
    return ''
  }
}
