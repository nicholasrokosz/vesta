import { DateTime } from 'luxon'
import type { CheckExcludeProps } from './dates'
import {
  checkIfExcluded,
  getNextDate,
  getYearBounds,
  isDateStringLessThanOrEqual,
  monthEqualsFilterMonth,
} from './dates'
import DateString from 'types/dateString'

describe('Date utilities', () => {
  describe('getYearBounds', () => {
    it('should return the correct start and end of a non-current year', () => {
      const [start, end] = getYearBounds(2030)

      expect(start.toISOString().substring(0, 10)).toEqual('2030-01-01')
      expect(end.toISOString().substring(0, 10)).toEqual('2030-12-31')
    })

    it('should return the current date as the end if the current year is specified', () => {
      const now = DateTime.utc()
      const [start, end] = getYearBounds(now.year)

      expect(start.toISOString().substring(0, 10)).toEqual(
        now.toISODate().substring(0, 10)
      )

      expect(end.toISOString().substring(0, 10)).toEqual(`${now.year}-12-31`)
    })
  })

  describe('isDateStringLessThanOrEqual', () => {
    test('date string is less than Date', () => {
      expect(
        isDateStringLessThanOrEqual('2023-06-15', new Date('2023-06-16T00:00'))
      ).toBe(true)
    })

    test('date string is equal to Date', () => {
      expect(
        isDateStringLessThanOrEqual('2023-06-15', new Date('2023-06-15T00:00'))
      ).toBe(true)
    })

    test('date string is greater than Date', () => {
      expect(
        isDateStringLessThanOrEqual('2023-06-16', new Date('2023-06-15T00:00'))
      ).toBe(false)
    })
  })

  describe('getNextDate', () => {
    test('Finds the first date after the selected date and returns the day before it', () => {
      const dates = ['2023-06-15', '2023-06-16', '2023-06-18']

      const selectedDate = DateTime.fromISO('2023-06-15', {
        zone: 'local',
      }).toJSDate()

      expect(getNextDate(dates, selectedDate)!.toISOString().slice(0, 10)).toBe(
        '2023-06-15'
      )
    })

    test('Returns null when there is no date greater than the selected date', () => {
      const dates = ['2023-06-15', '2023-06-16', '2023-06-18']
      const selectedDate = DateTime.fromISO('2023-06-19', {
        zone: 'local',
      }).toJSDate()

      expect(getNextDate(dates, selectedDate)).toBeNull()
    })

    test('Handles the case where the array contains the selected date', () => {
      const dates = ['2023-06-15', '2023-06-16', '2023-06-18']
      const selectedDate = DateTime.fromISO('2023-06-16', {
        zone: 'local',
      }).toJSDate()

      expect(getNextDate(dates, selectedDate)!.toISOString().slice(0, 10)).toBe(
        '2023-06-17'
      )
    })
  })

  describe('checkIfExcluded', () => {
    it('blocks no checkins when there are no events', () => {
      const dates = ['2023-06-15', '2023-06-16', '2023-06-18']
      const results = dates.map((date) => {
        const props: CheckExcludeProps = {
          date: DateString.fromString(date),
          selectedDate: null,
          prices: [],
          blockedStartDates: [],
          disableMinStay: false,
        }
        return checkIfExcluded(props)
      })

      expect(results).toEqual([false, false, false])
    })

    it('blocks checkins when date is in blockedStartDates', () => {
      const dates = ['2023-06-15', '2023-06-16', '2023-06-18', '2023-06-25']
      const results = dates.map((date) => {
        const props: CheckExcludeProps = {
          date: DateString.fromString(date),
          selectedDate: null,
          prices: [],
          blockedStartDates: ['2023-06-16', '2023-06-25'],
          disableMinStay: false,
        }
        return checkIfExcluded(props)
      })

      expect(results).toEqual([false, true, false, true])
    })
  })

  describe('monthEqualsFilterMonth', () => {
    it('matches current month when selected', () => {
      const dateString = DateString.fromDate(new Date())

      const result = monthEqualsFilterMonth(dateString, '0')

      expect(result).toEqual(true)
    })

    it('does not match current month when next month selected', () => {
      const dateString = DateString.fromDate(new Date())

      const result = monthEqualsFilterMonth(dateString, '1')

      expect(result).toEqual(false)
    })

    it('matches next month when next month selected', () => {
      const dateString = DateString.fromDate(
        DateTime.local().plus({ months: 1 }).toJSDate()
      )

      const result = monthEqualsFilterMonth(dateString, '1')

      expect(result).toEqual(true)
    })
  })
})
