import { ReservationStatus } from '@prisma/client'
import {
  getQuery,
  cleanPhone,
  cleanEmail,
  cleanName,
  getNextReservation,
} from './utils'
import { DateTime } from 'luxon'

describe('Guest utils', () => {
  describe('getQuery', () => {
    it('includes params', () => {
      const query = getQuery('orgId', {
        name: 'John Doe',
        email: 'joe@joe.com',
        phone: '1234567890',
      })

      expect(query.email).toBe('joe@joe.com')
      expect(query.phone).toBe('1234567890')
    })

    it('leaves out params if they are missing', () => {
      const query = getQuery('orgId', {
        name: 'John Doe',
      })

      expect(query.email).toBeFalsy()
      expect(query.phone).toBeFalsy()
    })
  })

  describe('cleanPhone', () => {
    it('cleans phone with no country code', () => {
      const cleanedPhone = cleanPhone(' 123-456-7890 ')

      expect(cleanedPhone).toBe('+11234567890')
    })

    it('cleans phone with country code', () => {
      const cleanedPhone = cleanPhone('1 123-456-7890')

      expect(cleanedPhone).toBe('+11234567890')
    })

    it('cleans phone with country code and plus', () => {
      const cleanedPhone = cleanPhone('+1 123-456-7890')

      expect(cleanedPhone).toBe('+11234567890')
    })

    it('cleans Airbnb number', () => {
      const cleanedPhone = cleanPhone('+1 (123) 456-7890')

      expect(cleanedPhone).toBe('+11234567890')
    })

    it('cleans Vrbo number', () => {
      const cleanedPhone = cleanPhone('11234567890')

      expect(cleanedPhone).toBe('+11234567890')
    })

    it('does nothing to clean number', () => {
      const cleanedPhone = cleanPhone('+11234567890')

      expect(cleanedPhone).toBe('+11234567890')
    })
  })

  describe('cleanEmail', () => {
    it('cleans email', () => {
      const cleanedEmail = cleanEmail(' joe@JOE.com ')

      expect(cleanedEmail).toBe('joe@joe.com')
    })
  })

  describe('cleanName', () => {
    it('cleans commas', () => {
      const cleanedName = cleanName('Joe, Smith')

      expect(cleanedName).toBe('Joe Smith')
    })
  })

  describe('getNextReservation', () => {
    it('gets the next reservation with a checkOut in the future', () => {
      const reservations = [
        {
          id: 'newest',
          status: ReservationStatus.CONFIRMED,
          calendarEvent: {
            id: '',
            toDate: DateTime.now().plus({ days: 9 }).toJSDate(),
            fromDate: DateTime.now().toJSDate(),
          },
        },
        {
          id: 'newer',
          status: ReservationStatus.CONFIRMED,
          calendarEvent: {
            id: '',
            toDate: DateTime.now().plus({ days: 4 }).toJSDate(),
            fromDate: DateTime.now().toJSDate(),
          },
        },
        {
          id: 'next',
          status: ReservationStatus.CONFIRMED,
          calendarEvent: {
            id: '',
            toDate: DateTime.now().plus({ days: 2 }).toJSDate(),
            fromDate: DateTime.now().toJSDate(),
          },
        },

        {
          id: 'oldest',
          status: ReservationStatus.CONFIRMED,
          calendarEvent: {
            id: '',
            toDate: DateTime.now().minus({ days: 2 }).toJSDate(),
            fromDate: DateTime.now().toJSDate(),
          },
        },
      ]

      const result = getNextReservation(reservations)

      expect(result.id).toBe('next')
    })

    it('gets the most recent reservation when they are no upcoming', () => {
      const reservations = [
        {
          id: 'old',
          status: ReservationStatus.CONFIRMED,
          calendarEvent: {
            id: '',
            toDate: DateTime.now().minus({ days: 2 }).toJSDate(),
            fromDate: DateTime.now().toJSDate(),
          },
        },
        {
          id: 'older',
          status: ReservationStatus.CONFIRMED,
          calendarEvent: {
            id: '',
            toDate: DateTime.now().minus({ days: 5 }).toJSDate(),
            fromDate: DateTime.now().toJSDate(),
          },
        },
        {
          id: 'oldest',
          status: ReservationStatus.CONFIRMED,
          calendarEvent: {
            id: '',
            toDate: DateTime.now().minus({ days: 10 }).toJSDate(),
            fromDate: DateTime.now().toJSDate(),
          },
        },
      ]

      const result = getNextReservation(reservations)

      expect(result.id).toBe('old')
    })
  })
})
