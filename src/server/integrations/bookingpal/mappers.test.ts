import { DateTime } from 'luxon'
import { mapChannel, mapPricing } from './mappers'
import { Channel } from '@prisma/client'
import DateString from 'types/dateString'

describe('mapPricing', () => {
  it('should correctly map pricing', () => {
    const threeYearsFromNow = DateTime.local().plus({ years: 3 })
    const result = mapPricing(
      1,
      [
        { date: DateString.fromDate(new Date()), price: 12, minStay: 5 },
        {
          date: DateString.fromString(threeYearsFromNow.toISODate()),
          price: 15,
          minStay: 2,
        },
      ],
      10
    )

    expect(result.minStays.length).toEqual(2)
    expect(result.maxStays.length).toEqual(1)

    expect(result.rates[0].amount).toEqual(12)
    expect(result.minStays[1].minStay).toEqual(2)
    expect(result.maxStays[0].maxStay).toEqual(10)

    expect(result.maxStays[0].beginDate).toEqual(DateTime.local().toISODate())
    expect(result.maxStays[0].endDate).toEqual(threeYearsFromNow.toISODate())
  })
})

describe('mapChannel', () => {
  it('should correctly map Airbnb, case-insensitive', () => {
    const channel = 'AiRBnb'
    const result = mapChannel(channel)
    expect(result).toEqual(Channel.Airbnb)
  })

  it('should correctly map Vrbo, case-insensitive', () => {
    const channel = 'VrbO'
    const result = mapChannel(channel)
    expect(result).toEqual(Channel.VRBO)
  })

  it('should correctly map Booking, case-insensitive', () => {
    const channel = 'bOOkIng'
    const result = mapChannel(channel)
    expect(result).toEqual(Channel.Booking)
  })
})
