import DateString from './dateString'

//'2023-12-25T06:00:00.000Z' is CST midnight in UTC

describe('DateString', () => {
  describe('construction', () => {
    it('creates a new DateString object with the correct value', () => {
      const dateString = new DateString('2022-01-15')
      expect(dateString.toString()).toBe('2022-01-15')
    })

    it('parses a valid date string correctly', () => {
      const dateString = DateString.fromString('2022-01-15')
      expect(dateString.toString()).toBe('2022-01-15')
      expect(dateString.getYear()).toBe(2022)
      expect(dateString.getMonth()).toBe(1)
      expect(dateString.getDay()).toBe(15)
    })

    it('parses a valid date with a non-zero-padded month', () => {
      const dateString = DateString.fromString('2022-1-15')
      expect(dateString.toString()).toBe('2022-01-15')
      expect(dateString.getYear()).toBe(2022)
      expect(dateString.getMonth()).toBe(1)
      expect(dateString.getDay()).toBe(15)
    })

    it('throws an exception when parsing an invalid date string', () => {
      expect(() => DateString.fromString('not a date string')).toThrowError(
        'Invalid date string format: not a date string'
      )
    })

    it('parses an incoming CST midnight in UTC', () => {
      const date = new Date('2023-12-25T06:00:00.000Z')
      const dateString = DateString.fromDate(date)

      expect(dateString.getDay()).toBe(25)
      expect(dateString.getMonth()).toBe(12)
      expect(dateString.getYear()).toBe(2023)
      expect(dateString.toString()).toBe('2023-12-25')
    })

    it('parses an incoming CST checkout', () => {
      const date = new Date('Dec 25 2023 09:00:00 GMT-0600')
      const dateString = DateString.fromDate(date)

      expect(dateString.getDay()).toBe(25)
      expect(dateString.getMonth()).toBe(12)
      expect(dateString.getYear()).toBe(2023)
      expect(dateString.toString()).toBe('2023-12-25')
    })

    it('parses an incoming CST checkin', () => {
      const date = new Date('Dec 25 2023 17:00:00 GMT-0600')
      const dateString = DateString.fromDate(date)

      expect(dateString.getDay()).toBe(25)
      expect(dateString.getMonth()).toBe(12)
      expect(dateString.getYear()).toBe(2023)
      expect(dateString.toString()).toBe('2023-12-25')
    })

    it('parses an incoming UTC midnight', () => {
      const date = new Date('2023-12-25T00:00:00.000Z')
      const dateString = DateString.fromDate(date)

      expect(dateString.getDay()).toBe(25)
      expect(dateString.getMonth()).toBe(12)
      expect(dateString.getYear()).toBe(2023)
      expect(dateString.toString()).toBe('2023-12-25')
    })
  })

  describe('toLocalDate', () => {
    it('outputs local date', () => {
      const dateString = DateString.fromString('2023-12-25')
      const result = dateString.toDate()

      expect(result.toString()).toBe(
        'Mon Dec 25 2023 00:00:00 GMT-0600 (Central Standard Time)'
      )
    })
  })

  describe('compareToDate', () => {
    it('matches a local midnight', () => {
      const date = new Date('Dec 25 2023 00:00:00 GMT-0600')
      const dateString = DateString.fromString('2023-12-25')

      const result = dateString.compareToDate(date)

      expect(result).toBe(0)
    })

    it('returns positive when greater than date', () => {
      const dateString = DateString.fromString('2023-12-26')
      const date = new Date('Dec 25 2023 00:00:00 GMT-0600')

      const result = dateString.compareToDate(date)

      expect(result).toBe(1)
    })

    it('returns negative when less than date', () => {
      const dateString = DateString.fromString('2023-12-22')
      const date = new Date('Dec 25 2023 00:00:00 GMT-0600')

      const result = dateString.compareToDate(date)

      expect(result).toBe(-3)
    })
  })

  describe('compareToDateString', () => {
    it('returns positive when less than date', () => {
      const dateString = DateString.fromString('2023-12-26')
      const dateStringToCompare = DateString.fromString('2023-12-25')

      const result = dateString.compareToDateString(dateStringToCompare)

      expect(result).toBe(1)
    })

    it('returns positive when greater than date', () => {
      const dateString = DateString.fromString('2023-12-26')
      const dateStringToCompare = DateString.fromString('2023-12-29')

      const result = dateString.compareToDateString(dateStringToCompare)

      expect(result).toBe(-3)
    })
  })

  describe('toFormattedString', () => {
    it('outputs the date in the correct format', () => {
      const dateString = DateString.fromString('2023-12-25')
      const result = dateString.toFormattedString()

      expect(result.toString()).toBe('12/25/2023')
    })
  })
})
