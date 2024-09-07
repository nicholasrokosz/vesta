import type { IANAZone } from 'luxon'
import { DateTime, Interval } from 'luxon'
import type { BookedDates } from 'types/calendar'
import type DateString from 'types/dateString'
import type Time from 'types/time'
import type { Price } from '../rates/types'

export const getEventDate = (
  date: DateString,
  time: Time,
  timeZone: IANAZone
) => {
  const result = DateTime.fromObject(
    {
      year: date.getYear(),
      month: date.getMonth(),
      day: date.getDay(),
      hour: time.getHours(),
      minute: time.getMinutes(),
    },
    { zone: timeZone }
  )

  return result.toJSDate()
}

export const getDate = (date: DateString) => {
  const result = DateTime.fromObject({
    year: date.getYear(),
    month: date.getMonth(),
    day: date.getDay(),
  })

  return result.toJSDate()
}

export const getNights = (startDate: Date, endDate: Date) => {
  const interval = Interval.fromDateTimes(
    DateTime.fromJSDate(startDate),
    DateTime.fromJSDate(endDate)
  )

  const nights = Math.ceil(interval.length('days'))

  return nights
}

export const getNightsText = (startDate: Date, endDate: Date): string => {
  const nights = getNights(startDate, endDate)
  return nights > 1 ? `${nights} nights` : `${nights} night`
}

export const getGuests = (adults: number, childen: number) => {
  const guests = adults + childen
  return guests > 1 ? `${guests} guests` : `${guests} guest`
}

export const getBlockedDates = (
  events: [startDate: Date, endDate: Date][],
  prices: Price[]
): BookedDates => {
  const blockedCheckIn: Set<string> = new Set()
  const blockedCheckOut: Set<string> = new Set()

  events.forEach((event) => {
    const start = DateTime.fromJSDate(event[0])
      .minus({ days: 1 })
      .startOf('day')
    const end = DateTime.fromJSDate(event[1]).startOf('day')
    const interval = Interval.fromDateTimes(start, end)

    for (
      let dt = start.plus({ days: 1 });
      dt < end;
      dt = dt.plus({ days: 1 })
    ) {
      if (interval.contains(dt)) {
        blockedCheckIn.add(dt.toISODate())
        blockedCheckOut.add(dt.plus({ days: 1 }).toISODate())
      }
    }
  })

  // A date is blocked from checkin if there are any invalid checkout dates within the minStay
  prices.forEach((price) => {
    if (blockedCheckIn.has(price.date.toString())) return

    for (let i = 1; i <= price.minStay; i++) {
      const dateToCheck = price.date.toDateTime().plus({ days: i }).toISODate()

      // You can't stay the night if the checkin date is blocked
      if (i < price.minStay && blockedCheckIn.has(dateToCheck)) {
        blockedCheckIn.add(price.date.toString())

        // You can't checkout if the checkout date is blocked
      } else if (i === price.minStay && blockedCheckOut.has(dateToCheck)) {
        blockedCheckIn.add(price.date.toString())
      }
    }
  })

  return {
    blockedCheckIn: Array.from(blockedCheckIn),
    blockedCheckOut: Array.from(blockedCheckOut),
  }
}

export const getBlockedDatesWithPrice = (
  events: [startDate: Date, endDate: Date][]
): BookedDates => {
  const blockedCheckIn: Set<string> = new Set()
  const blockedCheckOut: Set<string> = new Set()

  events.forEach((event) => {
    const start = DateTime.fromJSDate(event[0])
      .minus({ days: 1 })
      .startOf('day')
    const end = DateTime.fromJSDate(event[1]).startOf('day')
    const interval = Interval.fromDateTimes(start, end)

    for (
      let dt = start.plus({ days: 1 });
      dt < end;
      dt = dt.plus({ days: 1 })
    ) {
      if (interval.contains(dt)) {
        blockedCheckIn.add(dt.toISODate())
        blockedCheckOut.add(dt.plus({ days: 1 }).toISODate())
      }
    }
  })

  return {
    blockedCheckIn: Array.from(blockedCheckIn),
    blockedCheckOut: Array.from(blockedCheckOut),
  }
}

export const getPrismaBetweenDatesOrClause = (
  startDate: Date,
  endDate: Date
) => {
  const result = [
    {
      // Events that start between the start and end date
      fromDate: {
        gte: startDate,
        lte: endDate,
      },
    },

    // Events that end between the start and end date
    {
      toDate: {
        gte: startDate,
        lte: endDate,
      },
    },

    // Events that start before the start date and end after the end date
    {
      fromDate: {
        lte: startDate,
      },
      toDate: {
        gte: endDate,
      },
    },
  ]
  return result
}

export const getAvailabilititesForNextThreeYears = (
  bookedDates: BookedDates
) => {
  const today = DateTime.local()
  const end = today.plus({ years: 3 })
  const availabilities: {
    beginDate: string
    endDate: string
    availability: boolean
  }[] = []

  for (let i = 0; i <= end.diff(today, 'days').days; i++) {
    const day = today.plus({ days: i }).toISODate()
    const availability = !bookedDates.blockedCheckIn.includes(day)

    availabilities.push({ beginDate: day, endDate: day, availability })
  }

  return availabilities
}
