import { getDateRange, getDayBasePrice } from './utils'
import { DynamicPricing } from '@prisma/client'
import DateString from 'types/dateString'

describe('Rates', () => {
  describe('getDayBasePrice', () => {
    it('gets the correct price for a Thursday night', () => {
      const result = getDayBasePrice(DateString.fromString('2024-09-05'), {
        id: '',
        listingId: '',
        minimum: 0,
        weekday: 100,
        weekend: 150,
        minStay: 0,
        maxStay: 0,
        dates: [],
        discounts: [],
        dynamicPricing: DynamicPricing.None,
      })

      expect(result).toEqual(100)
    })
    it('gets the correct price for a Friday night', () => {
      const result = getDayBasePrice(DateString.fromString('2024-09-06'), {
        id: '',
        listingId: '',
        minimum: 0,
        weekday: 100,
        weekend: 150,
        minStay: 0,
        maxStay: 0,
        dates: [],
        discounts: [],
        dynamicPricing: DynamicPricing.None,
      })

      expect(result).toEqual(150)
    })

    it('gets the correct price for a Saturday night', () => {
      const result = getDayBasePrice(DateString.fromString('2024-09-07'), {
        id: '',
        listingId: '',
        minimum: 0,
        weekday: 100,
        weekend: 150,
        minStay: 0,
        maxStay: 0,
        dates: [],
        discounts: [],
        dynamicPricing: DynamicPricing.None,
      })

      expect(result).toEqual(150)
    })

    it('gets the correct price for a Sunday night', () => {
      const result = getDayBasePrice(DateString.fromString('2024-09-08'), {
        id: '',
        listingId: '',
        minimum: 0,
        weekday: 100,
        weekend: 150,
        minStay: 0,
        maxStay: 0,
        dates: [],
        discounts: [],
        dynamicPricing: DynamicPricing.None,
      })

      expect(result).toEqual(100)
    })
  })

  describe('getDayBasePrice', () => {
    it('gets the correct prices for a week', () => {
      // Sunday through Saturday
      const result = getDateRange(
        DateString.fromString('2024-09-08'), // Sunday
        DateString.fromString('2024-09-14'), // Saturday
        {
          id: '',
          listingId: '',
          minimum: 0,
          weekday: 100,
          weekend: 150,
          minStay: 5,
          maxStay: 0,
          dates: [],
          discounts: [],
          dynamicPricing: DynamicPricing.None,
        }
      )

      expect(result.length).toEqual(7)

      expect(result[0].date.toString()).toEqual('2024-09-08') // Sunday
      expect(result[0].price).toEqual(100)

      expect(result[1].date.toString()).toEqual('2024-09-09') // Monday
      expect(result[1].price).toEqual(100)

      expect(result[2].price).toEqual(100) // Tuesday
      expect(result[3].price).toEqual(100) // Wednesday
      expect(result[4].price).toEqual(100) // Thursday
      expect(result[5].price).toEqual(150) // Friday
      expect(result[6].price).toEqual(150) // Saturday

      expect(result[0].minStay).toEqual(5)
      expect(result[6].minStay).toEqual(5)
    })
  })
})
