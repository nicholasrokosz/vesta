import {
  getEventDate,
  getNightsText,
  getGuests,
  getBlockedDates,
  getAvailabilititesForNextThreeYears,
  getNights,
} from './dates'
import { DateTime, IANAZone } from 'luxon'
import type { BookedDates } from 'types/calendar'
import DateString from 'types/dateString'
import Time from 'types/time'
import type { Price } from '../rates/types'

describe('Calendar dates', () => {
  describe('getEventDate', () => {
    it('gets the correct date and time', () => {
      const dateString = new DateString('2023-03-17')

      const timeZone: IANAZone = IANAZone.create('US/Eastern')
      const date = getEventDate(dateString, new Time(15, 30), timeZone)

      expect(date.toUTCString()).toBe('Fri, 17 Mar 2023 19:30:00 GMT')
    })
  })

  describe('getNights', () => {
    it('parses 1 night correctly', () => {
      const checkin = new Date(2023, 3, 22, 15) // April 22, 3 p.m.
      const checkout = new Date(2023, 3, 23, 11, 30) // April 23, 11:30 a.m.

      const nights = getNights(checkin, checkout)

      expect(nights).toBe(1)
    })
  })

  describe('getNightsText', () => {
    it('parses 1 night correctly', () => {
      const checkin = new Date(2023, 3, 22, 15) // April 22, 3 p.m.
      const checkout = new Date(2023, 3, 23, 11, 30) // April 23, 11:30 a.m.

      const nights = getNightsText(checkin, checkout)

      expect(nights).toBe('1 night')
    })

    it('parses 2 nights correctly', () => {
      const checkin = new Date(2023, 3, 22, 15) // April 22, 3 p.m.
      const checkout = new Date(2023, 3, 24, 11, 30) // April 24, 11:30 a.m.

      const nights = getNightsText(checkin, checkout)

      expect(nights).toBe('2 nights')
    })

    it('parses 5 nights correctly', () => {
      const checkin = new Date(2023, 3, 22, 15) // April 22, 3 p.m.
      const checkout = new Date(2023, 3, 27, 11, 30) // April 24, 11:30 a.m.

      const nights = getNightsText(checkin, checkout)

      expect(nights).toBe('5 nights')
    })
  })

  describe('getGuests', () => {
    it('parses 1 guest correctly', () => {
      const adults = 1
      const childen = 0

      const guests = getGuests(adults, childen)

      expect(guests).toBe('1 guest')
    })
    it('parses 2 adults, 1 child correctly', () => {
      const adults = 2
      const childen = 1

      const nights = getGuests(adults, childen)

      expect(nights).toBe('3 guests')
    })
  })

  type Event = [startDate: Date, endDate: Date]
  describe('getBlockedDates', () => {
    it('should handle no events', () => {
      const events: Event[] = []
      const result = getBlockedDates(events, [])
      expect(result.blockedCheckIn).toEqual([])
      expect(result.blockedCheckOut).toEqual([])
    })

    it('should handle a single event', () => {
      const events: Event[] = [
        [
          DateTime.fromISO('2023-06-14').toJSDate(),
          DateTime.fromISO('2023-06-17').toJSDate(),
        ],
      ]
      const result = getBlockedDates(events, [])

      expect(result.blockedCheckIn).toEqual([
        '2023-06-14',
        '2023-06-15',
        '2023-06-16',
      ])
      expect(result.blockedCheckOut).toEqual([
        '2023-06-15',
        '2023-06-16',
        '2023-06-17',
      ])
    })

    it('should handle multiple overlapping events', () => {
      const events: Event[] = [
        [
          DateTime.fromISO('2023-06-14').toJSDate(),
          DateTime.fromISO('2023-06-17').toJSDate(),
        ],
        [
          DateTime.fromISO('2023-06-17').toJSDate(),
          DateTime.fromISO('2023-06-20').toJSDate(),
        ],
      ]
      const result = getBlockedDates(events, [])

      expect(result.blockedCheckIn).toEqual([
        '2023-06-14',
        '2023-06-15',
        '2023-06-16',
        '2023-06-17',
        '2023-06-18',
        '2023-06-19',
      ])
      expect(result.blockedCheckOut).toEqual([
        '2023-06-15',
        '2023-06-16',
        '2023-06-17',
        '2023-06-18',
        '2023-06-19',
        '2023-06-20',
      ])
    })

    it('should handle multiple non-overlapping events', () => {
      const events: Event[] = [
        [
          DateTime.fromISO('2023-06-14').toJSDate(),
          DateTime.fromISO('2023-06-17').toJSDate(),
        ],
        [
          DateTime.fromISO('2023-06-18').toJSDate(),
          DateTime.fromISO('2023-06-20').toJSDate(),
        ],
      ]
      const result = getBlockedDates(events, [])

      expect(result.blockedCheckIn).toEqual([
        '2023-06-14',
        '2023-06-15',
        '2023-06-16',
        '2023-06-18',
        '2023-06-19',
      ])
      expect(result.blockedCheckOut).toEqual([
        '2023-06-15',
        '2023-06-16',
        '2023-06-17',
        '2023-06-19',
        '2023-06-20',
      ])
    })

    it('should handle a single event with minStay of 1', () => {
      const events: Event[] = [
        [
          DateTime.fromISO('2023-06-14').toJSDate(),
          DateTime.fromISO('2023-06-17').toJSDate(),
        ],
      ]
      const prices: Price[] = [
        {
          date: DateString.fromString('2023-06-12'),
          price: 0,
          minStay: 1,
        },
        {
          date: DateString.fromString('2023-06-13'),
          price: 0,
          minStay: 1,
        },
        {
          date: DateString.fromString('2023-06-14'),
          price: 0,
          minStay: 1,
        },
        {
          date: DateString.fromString('2023-06-15'),
          price: 0,
          minStay: 1,
        },
      ]

      const result = getBlockedDates(events, prices)

      console.log(result)
      expect(result.blockedCheckIn).toEqual([
        '2023-06-14',
        '2023-06-15',
        '2023-06-16',
      ])
      expect(result.blockedCheckOut).toEqual([
        '2023-06-15',
        '2023-06-16',
        '2023-06-17',
      ])
    })
    it('should handle a single event with minStays', () => {
      const events: Event[] = [
        [
          DateTime.fromISO('2023-06-14').toJSDate(),
          DateTime.fromISO('2023-06-17').toJSDate(),
        ],
      ]
      const prices: Price[] = [
        {
          date: DateString.fromString('2023-06-11'),
          price: 0,
          minStay: 3,
        },
        {
          date: DateString.fromString('2023-06-12'),
          price: 0,
          minStay: 3,
        },
        {
          date: DateString.fromString('2023-06-13'),
          price: 0,
          minStay: 3,
        },
        {
          date: DateString.fromString('2023-06-13'),
          price: 0,
          minStay: 3,
        },
        {
          date: DateString.fromString('2023-06-15'),
          price: 0,
          minStay: 3,
        },
      ]

      const result = getBlockedDates(events, prices)

      console.log(result)
      expect(result.blockedCheckIn).toEqual([
        '2023-06-14',
        '2023-06-15',
        '2023-06-16',
        '2023-06-12',
        '2023-06-13',
      ])
      expect(result.blockedCheckOut).toEqual([
        '2023-06-15',
        '2023-06-16',
        '2023-06-17',
      ])
    })
  })

  describe('getAvailabilititesForNextThreeYears', () => {
    it('should return the correct number of days', () => {
      const bookedDates: BookedDates = {
        blockedCheckIn: [],
        blockedCheckOut: [],
      }

      const result = getAvailabilititesForNextThreeYears(bookedDates)
      expect(result.length).toBe(1097)
    })

    it('should return the blocked dates correctly', () => {
      const today = DateTime.local()
      const bookedDates: BookedDates = {
        blockedCheckIn: [
          today.plus({ days: 1 }).toISODate(),
          today.plus({ days: 3 }).toISODate(),
        ],
        blockedCheckOut: [],
      }

      const result = getAvailabilititesForNextThreeYears(bookedDates)
      expect(result[1].availability).toBe(false)
      expect(result[2].availability).toBe(true)
      expect(result[3].availability).toBe(false)
    })
  })
})
