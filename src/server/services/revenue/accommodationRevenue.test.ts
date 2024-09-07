import type { AccommodationWithDeductions } from 'types/revenue'
import { AccommodationRevenueSummaryBuilder } from './accommodationRevenue'
import { randomBytes } from 'crypto'

describe('Accommodation Revenue', () => {
  describe('build', () => {
    const revenueFeeId = randomBytes(16).toString()

    const accommodationEntry: AccommodationWithDeductions = {
      id: revenueFeeId,
      revenueId: 'revenueId',
      createdAt: new Date(),
      updatedAt: new Date(),
      taxable: true,
      name: 'Accommodation',
      pmcShare: 25,
      type: 'ACCOMMODATION',
      value: 2555,
      unit: 'PerStay',
      deductions: [
        {
          id: randomBytes(16).toString(),
          createdAt: new Date(),
          updatedAt: new Date(),
          revenueFeeId,
          description: 'Municipal tax',
          value: 198.27,
          type: 'TAX',
          revenueId: null,
        },
        {
          id: randomBytes(16).toString(),
          createdAt: new Date(),
          updatedAt: new Date(),
          revenueFeeId,
          description: 'State tax',
          value: 247.84,
          type: 'TAX',
          revenueId: null,
        },
        {
          id: randomBytes(16).toString(),
          createdAt: new Date(),
          updatedAt: new Date(),
          revenueFeeId,
          description: 'County tax',
          value: 99.13,
          type: 'TAX',
          revenueId: null,
        },
      ],
    }

    const numberOfNights = 7

    it('gets the correct values', () => {
      // TODO: move these to a setup method?

      const totalChannelCommission = 93.01
      const totalGrossRevenue = 2555

      const builder = new AccommodationRevenueSummaryBuilder(
        accommodationEntry,
        {
          discount: 0,
          numberOfNights,
          totalChannelCommission,
          totalGrossRevenue,
        }
      )
      const result = builder.build()

      expect(result.roomRate).toEqual(365)
      expect(result.roomRateTotal.amount).toEqual(2555)
      expect(result.roomRateTotal.managerAmount).toEqual(638.75)
      expect(result.roomRateTotal.ownerAmount).toEqual(1916.25)

      expect(result.taxableRevenue.amount).toEqual(2555)
      expect(result.taxableRevenue.managerAmount).toEqual(638.75)
      expect(result.taxableRevenue.ownerAmount).toEqual(1916.25)

      expect(result.totalTax.amount).toEqual(545.24)
      expect(result.totalTax.managerAmount).toEqual(136.31)
      expect(result.totalTax.ownerAmount).toBeCloseTo(408.93, 2)

      expect(result.grossRevenue.amount).toEqual(2555 + 545.24)
      expect(result.grossRevenue.managerAmount).toEqual(638.75 + 136.31)
      expect(result.grossRevenue.ownerAmount).toEqual(1916.25 + 408.93)

      expect(result.netRevenue.amount).toEqual(2555 - 93.01)
      expect(result.netRevenue.managerAmount).toEqual(615.4975)
      expect(result.netRevenue.ownerAmount).toBeCloseTo(1846.4925)

      expect(result.taxes.length).toEqual(3)

      expect(result.discount.amount).toEqual(0)
      expect(result.discount.managerAmount).toEqual(0)
      expect(result.discount.ownerAmount).toEqual(0)

      expect(result.channelCommission?.amount).toEqual(93.01)
      expect(result.channelCommission?.managerAmount).toEqual(23.2525)
      expect(result.channelCommission?.ownerAmount).toBeCloseTo(69.7575)
    })

    it('gets the correct values when a discount is applied', () => {
      accommodationEntry.deductions = [
        {
          id: randomBytes(16).toString(),
          createdAt: new Date(),
          updatedAt: new Date(),
          revenueFeeId,
          description: 'Municipal tax',
          value: 158.61,
          type: 'TAX',
          revenueId: null,
        },
        {
          id: randomBytes(16).toString(),
          createdAt: new Date(),
          updatedAt: new Date(),
          revenueFeeId,
          description: 'State tax',
          value: 198.27,
          type: 'TAX',
          revenueId: null,
        },
        {
          id: randomBytes(16).toString(),
          createdAt: new Date(),
          updatedAt: new Date(),
          revenueFeeId,
          description: 'County tax',
          value: 79.31,
          type: 'TAX',
          revenueId: null,
        },
      ]
      const discount = 20 //(20% discount)
      const totalChannelCommission = 61.63 //(3%)
      const totalGrossRevenue = 2555

      const builder = new AccommodationRevenueSummaryBuilder(
        accommodationEntry,
        {
          discount,
          numberOfNights,
          totalChannelCommission,
          totalGrossRevenue,
        }
      )
      const result = builder.build()

      expect(result.roomRate).toEqual(365)
      expect(result.roomRateTotal.amount).toEqual(2555)
      expect(result.roomRateTotal.managerAmount).toEqual(638.75)
      expect(result.roomRateTotal.ownerAmount).toEqual(1916.25)

      expect(result.discount.amount).toEqual(511)
      expect(result.discount.managerAmount).toEqual(127.75)
      expect(result.discount.ownerAmount).toEqual(383.25)

      expect(result.taxableRevenue.amount).toEqual(2044)
      expect(result.taxableRevenue.managerAmount).toEqual(511)
      expect(result.taxableRevenue.ownerAmount).toEqual(1533)

      expect(result.grossRevenue.amount).toEqual(2044 + 436.19)
      expect(result.grossRevenue.managerAmount).toEqual(620.0475)
      expect(result.grossRevenue.ownerAmount).toEqual(1860.1425)

      expect(result.netRevenue.amount).toEqual(1982.37)
      expect(result.netRevenue.managerAmount).toEqual(495.5925)
      expect(result.netRevenue.ownerAmount).toEqual(1486.7775)

      expect(result.taxes.length).toEqual(3)
    })
  })
})
