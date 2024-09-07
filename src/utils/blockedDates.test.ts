import {
  dateIsBlocked,
  validateDateRange,
  getBlockedDates,
} from './blockedDates'

describe('getBlockedDates', () => {
  const events = [
    {
      startDate: new Date('2027-05-19'),
      endDate: new Date('2027-05-20'),
    },
    {
      startDate: new Date('2027-05-20'),
      endDate: new Date('2027-05-21'),
    },
    {
      startDate: new Date('2027-05-23'),
      endDate: new Date('2027-05-27'),
    },
    {
      startDate: new Date('2027-05-29'),
      endDate: new Date('2027-06-01'),
    },
  ]
  const blockedDates = getBlockedDates(events)

  test('returns false if the date is the start of an event', () => {
    const result = blockedDates.includes('2027-05-19')
    expect(result).toBe(false)
  })

  test('returns false if the date is the end of an event', () => {
    const result = blockedDates.includes('2027-05-27')
    expect(result).toBe(false)
  })

  test('returns false if the date is open', () => {
    const result = blockedDates.includes('2027-05-28')
    expect(result).toBe(false)
  })

  test('returns true if adjacent to another event', () => {
    const result = blockedDates.includes('2027-05-20')
    expect(result).toBe(true)
  })

  test('returns true if the date is during another event', () => {
    const result = blockedDates.includes('2027-05-24')
    expect(result).toBe(true)
  })
})

describe('dateIsExcluded', () => {
  const blockedDates = ['2027-05-19', '2027-05-20', '2027-05-21']

  test('returns true if the date is blocked', () => {
    const result = dateIsBlocked(blockedDates, new Date('2027-05-19'))
    expect(result).toBe(true)
  })

  test('returns false if the date is not blocked', () => {
    const result = dateIsBlocked(blockedDates, new Date('2027-05-31'))
    expect(result).toBe(false)
  })
})

describe('validateDateRange', () => {
  const blockedDates = ['2027-05-19', '2027-05-20', '2027-05-21']

  test('returns false if any date in the range is blocked', () => {
    const result = validateDateRange(
      blockedDates,
      new Date('2027-05-17'),
      new Date('2027-05-22')
    )
    expect(result).toBe(false)
  })

  test('returns true if all dates in the range are free', () => {
    const result = validateDateRange(
      blockedDates,
      new Date('2027-05-15'),
      new Date('2027-05-18')
    )
    expect(result).toBe(true)
  })
})
