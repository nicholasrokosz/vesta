import type { ITrigger } from 'types/automations'
import { calculateScheduledTime, _getTrigger } from './triggers'

describe('calculateScheduledTime', () => {
  test('should calculate the scheduled time for CheckIn Immediately', () => {
    const checkinTime = new Date('2023-04-01T12:00:00')
    const checkoutTime = new Date('2023-04-10T10:00:00')
    const trigger: ITrigger = {
      type: 'CheckIn',
      range: 'Immediately',
    }

    const scheduledTime = calculateScheduledTime(
      checkinTime,
      checkoutTime,
      trigger
    )
    expect(scheduledTime).toEqual(checkinTime)
  })

  test('should calculate the scheduled time for CheckIn 2 Hours Before', () => {
    const checkinTime = new Date('2023-04-01T12:00:00')
    const checkoutTime = new Date('2023-04-10T10:00:00')
    const trigger: ITrigger = {
      type: 'CheckIn',
      range: 'Before',
      unit: 'Hours',
      value: 2,
    }

    const scheduledTime = calculateScheduledTime(
      checkinTime,
      checkoutTime,
      trigger
    )
    expect(scheduledTime).toEqual(new Date('2023-04-01T10:00:00'))
  })

  test('should calculate the scheduled time for CheckOut 30 Minutes After', () => {
    const checkinTime = new Date('2023-04-01T12:00:00')
    const checkoutTime = new Date('2023-04-10T10:00:00')
    const trigger: ITrigger = {
      type: 'CheckOut',
      range: 'After',
      unit: 'Minutes',
      value: 30,
    }

    const scheduledTime = calculateScheduledTime(
      checkinTime,
      checkoutTime,
      trigger
    )
    expect(scheduledTime).toEqual(new Date('2023-04-10T10:30:00'))
  })
})

describe('_getTrigger', () => {
  it('should return a trigger with range Immediately', () => {
    const result = _getTrigger('Immediately', 'CheckIn')
    expect(result).toEqual({
      type: 'CheckIn',
      range: 'Immediately',
    })
  })

  it('should return a trigger with range After', () => {
    const result = _getTrigger('After', 'CheckOut', 'Hours', 2)
    expect(result).toEqual({
      type: 'CheckOut',
      range: 'After',
      unit: 'Hours',
      value: 2,
    })
  })

  it('should return a trigger with range Before', () => {
    const result = _getTrigger('Before', 'CheckIn', 'Days', 1)
    expect(result).toEqual({
      type: 'CheckIn',
      range: 'Before',
      unit: 'Days',
      value: 1,
    })
  })

  it('should throw an error when range is After and unit or value is missing', () => {
    expect(() => _getTrigger('After', 'CheckIn', 'Hours')).toThrowError(
      "Unit and value are required for range 'After' or 'Before'"
    )
    expect(() => _getTrigger('After', 'CheckIn', undefined, 2)).toThrowError(
      "Unit and value are required for range 'After' or 'Before'"
    )
  })

  it('should throw an error when range is Before and unit or value is missing', () => {
    expect(() => _getTrigger('Before', 'CheckOut', 'Days')).toThrowError(
      "Unit and value are required for range 'After' or 'Before'"
    )
    expect(() => _getTrigger('Before', 'CheckOut', undefined, 1)).toThrowError(
      "Unit and value are required for range 'After' or 'Before'"
    )
  })
})
