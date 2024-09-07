import Time from './time'

describe('Time', () => {
  it('creates a new Time object with the correct values', () => {
    const time = new Time(10, 30)
    expect(time.getHours()).toBe(10)
    expect(time.getMinutes()).toBe(30)
  })

  it('throws an error if the hours value is invalid', () => {
    expect(() => new Time(-1, 30)).toThrowError('Invalid hours value: -1')

    expect(() => new Time(24, 75)).toThrowError('Invalid hours value: 24')
    expect(() => new Time(90, 30)).toThrowError('Invalid hours value: 90')
  })

  it('throws an error if the minutes value is invalid', () => {
    expect(() => new Time(1, -5)).toThrowError('Invalid minutes value: -5')

    expect(() => new Time(2, 60)).toThrowError('Invalid minutes value: 60')
    expect(() => new Time(19, 82)).toThrowError('Invalid minutes value: 82')
  })

  it('formats a Time object as a string correctly', () => {
    const time = new Time(10, 30)
    expect(time.toString()).toBe('10:30')
  })

  it('parses a valid time string correctly', () => {
    const time = Time.fromString('10:30')
    expect(time).not.toBeNull()
    expect(time?.getHours()).toBe(10)
    expect(time?.getMinutes()).toBe(30)
  })

  it('parses a valid time after 12:00 string correctly', () => {
    const time = Time.fromString('16:47')
    expect(time).not.toBeNull()
    expect(time?.getHours()).toBe(16)
    expect(time?.getMinutes()).toBe(47)
  })

  it('parses a valid time string in the am/pm format correctly', () => {
    const time = Time.fromString('10:30am')
    expect(time).not.toBeNull()
    expect(time?.getHours()).toBe(10)
    expect(time?.getMinutes()).toBe(30)
  })

  it('parses a valid time string in the AM/PM format correctly', () => {
    const time = Time.fromString('10:30PM')
    expect(time).not.toBeNull()
    expect(time?.getHours()).toBe(22)
    expect(time?.getMinutes()).toBe(30)
  })

  it('parses a valid time string without a colon correctly', () => {
    const time = Time.fromString('1030')
    expect(time).not.toBeNull()
    expect(time?.getHours()).toBe(10)
    expect(time?.getMinutes()).toBe(30)
  })

  it('parses a valid time string with a leading zero correctly', () => {
    const time = Time.fromString('08:15')
    expect(time).not.toBeNull()
    expect(time?.getHours()).toBe(8)
    expect(time?.getMinutes()).toBe(15)
  })

  it('parses a valid time string with a trailing zero correctly', () => {
    const time = Time.fromString('9:05')
    expect(time).not.toBeNull()
    expect(time?.getHours()).toBe(9)
    expect(time?.getMinutes()).toBe(5)
  })

  it('parses a valid time string with uppercase AM/PM correctly', () => {
    const time = Time.fromString('10:30AM')
    expect(time).not.toBeNull()
    expect(time?.getHours()).toBe(10)
    expect(time?.getMinutes()).toBe(30)
  })

  it('throws an error when parsing an invalid time string', () => {
    expect(() => Time.fromString('not a time string')).toThrowError(
      'Invalid time string format: not a time string'
    )
  })

  it('throws an error when parsing an invalid time string with non-numeric characters', () => {
    expect(() => Time.fromString('1a:2b')).toThrowError(
      'Invalid time string format: 1a:2b'
    )
  })

  it('throws an error when parsing an invalid time string with too many digits', () => {
    expect(() => Time.fromString('123:45')).toThrowError(
      'Invalid time string format: 123:45'
    )
  })

  it('throws an error when parsing an invalid time string with too few digits', () => {
    expect(() => Time.fromString('1:2')).toThrowError(
      'Invalid time string format: 1:2'
    )
  })
})
