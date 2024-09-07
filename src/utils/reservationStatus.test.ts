import { DateTime } from 'luxon'
import { mapReservationStatusToFriendlyName } from './reservationStatus'
import { ReservationStatus as FriendlyStatus } from 'types/reservation'
import { ReservationStatus } from '@prisma/client'

describe('mapReservationStatusToUserFriendlyName', () => {
  const today = DateTime.local()

  it('gets the Inquiry status for Provisional', () => {
    const status = mapReservationStatusToFriendlyName(
      ReservationStatus.PROVISIONAL,
      today
        .plus({ days: 1 })
        .set({ hour: 14, minute: 0, second: 0 })
        .toJSDate(),
      today.plus({ days: 3 }).set({ hour: 11, minute: 0, second: 0 }).toJSDate()
    )

    expect(status).toBe(FriendlyStatus.INQUIRY)
  })

  it('gets the Inquiry status for Reserved', () => {
    const status = mapReservationStatusToFriendlyName(
      ReservationStatus.RESERVED,
      today
        .plus({ days: 1 })
        .set({ hour: 14, minute: 0, second: 0 })
        .toJSDate(),
      today.plus({ days: 3 }).set({ hour: 11, minute: 0, second: 0 }).toJSDate()
    )

    expect(status).toBe(FriendlyStatus.RESERVED)
  })

  it('gets the Upcoming status for Confirmed and not Checked-in', () => {
    const status = mapReservationStatusToFriendlyName(
      ReservationStatus.CONFIRMED,
      today
        .plus({ days: 1 })
        .set({ hour: 14, minute: 0, second: 0 })
        .toJSDate(),
      today.plus({ days: 3 }).set({ hour: 11, minute: 0, second: 0 }).toJSDate()
    )

    expect(status).toBe(FriendlyStatus.UPCOMING)
  })

  it('gets the Upcoming status for Fully Paid and not Checked-in', () => {
    const status = mapReservationStatusToFriendlyName(
      ReservationStatus.FULLY_PAID,
      today
        .plus({ days: 1 })
        .set({ hour: 14, minute: 0, second: 0 })
        .toJSDate(),
      today.plus({ days: 3 }).set({ hour: 11, minute: 0, second: 0 }).toJSDate()
    )

    expect(status).toBe(FriendlyStatus.UPCOMING)
  })

  it('gets the Upcoming status for Confirmed and Checked-in', () => {
    const status = mapReservationStatusToFriendlyName(
      ReservationStatus.CONFIRMED,
      today
        .minus({ days: 1 })
        .set({ hour: 14, minute: 0, second: 0 })
        .toJSDate(),
      today.plus({ days: 3 }).set({ hour: 11, minute: 0, second: 0 }).toJSDate()
    )

    expect(status).toBe(FriendlyStatus.CHECKED_IN)
  })

  it('gets the Upcoming status for Fully Paid and Checked-in', () => {
    const status = mapReservationStatusToFriendlyName(
      ReservationStatus.FULLY_PAID,
      today
        .minus({ days: 1 })
        .set({ hour: 14, minute: 0, second: 0 })
        .toJSDate(),
      today.plus({ days: 3 }).set({ hour: 11, minute: 0, second: 0 }).toJSDate()
    )

    expect(status).toBe(FriendlyStatus.CHECKED_IN)
  })

  it('gets the Upcoming status for Confirmed and Checked-out', () => {
    const status = mapReservationStatusToFriendlyName(
      ReservationStatus.CONFIRMED,
      today
        .minus({ days: 5 })
        .set({ hour: 14, minute: 0, second: 0 })
        .toJSDate(),
      today
        .minus({ days: 3 })
        .set({ hour: 11, minute: 0, second: 0 })
        .toJSDate()
    )

    expect(status).toBe(FriendlyStatus.CHECKED_OUT)
  })

  it('gets the Upcoming status for Fully Paid and Checked-out', () => {
    const status = mapReservationStatusToFriendlyName(
      ReservationStatus.FULLY_PAID,
      today
        .minus({ days: 5 })
        .set({ hour: 14, minute: 0, second: 0 })
        .toJSDate(),
      today
        .minus({ days: 3 })
        .set({ hour: 11, minute: 0, second: 0 })
        .toJSDate()
    )

    expect(status).toBe(FriendlyStatus.CHECKED_OUT)
  })
})
