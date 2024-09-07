import type { RevenueWithFeesAndTaxes } from 'types/revenue'
import { RevenueSummaryBuilder } from './revenueSummary'
import { randomBytes } from 'crypto'

describe('Revenue Summary', () => {
  describe('getReservationRevenueSummary', () => {
    it('gets the correct values', () => {
      const numberOfNights = 7
      const revenue: RevenueWithFeesAndTaxes = {
        id: 'revenueId',
        createdAt: new Date(),
        updatedAt: new Date(),
        pmcShare: 25,
        discount: 0,
        channelCommission: 54.83,
        payoutStatus: 'UNPAID',
        reservationId: 'reservationId',
        ownerStatementId: null,
        accommodation: null,
        fees: [
          {
            id: 'entry-1',
            revenueId: 'revenueId',
            createdAt: new Date(),
            updatedAt: new Date(),
            taxable: true,
            name: 'Accommodation',
            pmcShare: 25,
            type: 'ACCOMMODATION',
            value: 1400,
            unit: 'PerStay',
            deductions: [
              {
                id: randomBytes(16).toString(),
                createdAt: new Date(),
                updatedAt: new Date(),
                revenueFeeId: 'entry-1',
                description: 'Municipal tax',
                value: 19.6,
                type: 'TAX',
                revenueId: null,
              },
              {
                id: randomBytes(16).toString(),
                createdAt: new Date(),
                updatedAt: new Date(),
                revenueFeeId: 'entry-1',
                description: 'State tax',
                value: 42,
                type: 'TAX',
                revenueId: null,
              },
              {
                id: randomBytes(16).toString(),
                createdAt: new Date(),
                updatedAt: new Date(),
                revenueFeeId: 'entry-1',
                description: 'County tax',
                value: 28,
                type: 'TAX',
                revenueId: null,
              },
            ],
          },
          {
            id: 'entry-2',
            revenueId: 'revenueId',
            createdAt: new Date(),
            updatedAt: new Date(),
            taxable: true,
            name: 'Cleaning fee',
            pmcShare: 75,
            type: 'GUEST_FEE',
            value: 100,
            unit: 'PerStay',
            deductions: [
              {
                id: randomBytes(16).toString(),
                createdAt: new Date(),
                updatedAt: new Date(),
                revenueFeeId: 'entry-2',
                description: 'Municipal tax',
                value: 1.4,
                type: 'TAX',
                revenueId: null,
              },
              {
                id: randomBytes(16).toString(),
                createdAt: new Date(),
                updatedAt: new Date(),
                revenueFeeId: 'entry-2',
                description: 'County tax',
                value: 3,
                type: 'TAX',
                revenueId: null,
              },
              {
                id: randomBytes(16).toString(),
                createdAt: new Date(),
                updatedAt: new Date(),
                revenueFeeId: 'entry-2',
                description: 'State tax',
                value: 2,
                type: 'TAX',
                revenueId: null,
              },
            ],
          },
          {
            id: 'entry-3',
            revenueId: 'revenueId',
            createdAt: new Date(),
            updatedAt: new Date(),
            taxable: true,
            name: 'Pet fee',
            pmcShare: 40,
            type: 'GUEST_FEE',
            value: 75,
            unit: 'PerStay',
            deductions: [
              {
                id: randomBytes(16).toString(),
                createdAt: new Date(),
                updatedAt: new Date(),
                revenueFeeId: 'entry-3',
                description: 'Municipal tax',
                value: 1.05,
                type: 'TAX',
                revenueId: null,
              },
              {
                id: randomBytes(16).toString(),
                createdAt: new Date(),
                updatedAt: new Date(),
                revenueFeeId: 'entry-3',
                description: 'County tax',
                value: 2.25,
                type: 'TAX',
                revenueId: null,
              },
              {
                id: randomBytes(16).toString(),
                createdAt: new Date(),
                updatedAt: new Date(),
                revenueFeeId: 'entry-3',
                description: 'State tax',
                value: 1.5,
                type: 'TAX',
                revenueId: null,
              },
            ],
          },
          {
            id: 'entry-4',
            revenueId: 'revenueId',
            createdAt: new Date(),
            updatedAt: new Date(),
            taxable: true,
            name: 'Internet',
            pmcShare: 30,
            type: 'GUEST_FEE',
            value: 85,
            unit: 'PerStay',
            deductions: [
              {
                id: randomBytes(16).toString(),
                createdAt: new Date(),
                updatedAt: new Date(),
                revenueFeeId: 'entry-4',
                description: 'Municipal tax',
                value: 1.19,
                type: 'TAX',
                revenueId: null,
              },
              {
                id: randomBytes(16).toString(),
                createdAt: new Date(),
                updatedAt: new Date(),
                revenueFeeId: 'entry-3',
                description: 'County tax',
                value: 2.55,
                type: 'TAX',
                revenueId: null,
              },
              {
                id: randomBytes(16).toString(),
                createdAt: new Date(),
                updatedAt: new Date(),
                revenueFeeId: 'entry-3',
                description: 'State tax',
                value: 1.7,
                type: 'TAX',
                revenueId: null,
              },
            ],
          },
          {
            id: 'entry-5',
            revenueId: 'revenueId',
            createdAt: new Date(),
            updatedAt: new Date(),
            taxable: false,
            name: 'Daily Newspaper delivery',
            pmcShare: 25,
            type: 'GUEST_FEE',
            value: 60,
            unit: 'PerStay',
            deductions: [],
          },
        ],
        reservation: { channel: 'Airbnb' },
      }

      const builder = new RevenueSummaryBuilder(revenue, numberOfNights)

      const result = builder.build().getSummary()

      expect(result.grossBookingValue.amount).toEqual(1826.24)
      expect(result.grossBookingValue.managerAmount).toBeCloseTo(526.25, 2)
      expect(result.grossBookingValue.ownerAmount).toBeCloseTo(1299.99, 2)

      expect(result.channelCommission?.amount).toBeCloseTo(54.83, 2)
      expect(result.channelCommission?.managerAmount).toBeCloseTo(15.8, 2)
      expect(result.channelCommission?.ownerAmount).toBeCloseTo(39.03, 2)

      expect(result.netRevenue.amount).toEqual(1665.17)
      expect(result.netRevenue.managerAmount).toBeCloseTo(479.7, 2)
      expect(result.netRevenue.ownerAmount).toBeCloseTo(1185.47, 2)

      expect(result.totalTaxes.amount).toBeCloseTo(106.24, 2)

      expect(result.allTaxes.length).toEqual(3)
    })

    it('gets the correct values when a discount is applied', () => {
      const numberOfNights = 7
      const revenue: RevenueWithFeesAndTaxes = {
        id: 'revenueId',
        createdAt: new Date(),
        updatedAt: new Date(),
        pmcShare: 25,
        discount: 20,
        channelCommission: 45.85,
        payoutStatus: 'UNPAID',
        reservationId: 'reservationId',
        ownerStatementId: null,
        accommodation: null,
        fees: [
          {
            id: 'entry-1',
            revenueId: 'revenueId',
            createdAt: new Date(),
            updatedAt: new Date(),
            taxable: true,
            name: 'Accommodation',
            pmcShare: 25,
            type: 'ACCOMMODATION',
            value: 1400,
            unit: 'PerStay',
            deductions: [
              {
                id: randomBytes(16).toString(),
                createdAt: new Date(),
                updatedAt: new Date(),
                revenueFeeId: 'entry-1',
                description: 'Municipal tax',
                value: 15.68,
                type: 'TAX',
                revenueId: null,
              },
              {
                id: randomBytes(16).toString(),
                createdAt: new Date(),
                updatedAt: new Date(),
                revenueFeeId: 'entry-1',
                description: 'State tax',
                value: 33.6,
                type: 'TAX',
                revenueId: null,
              },
              {
                id: randomBytes(16).toString(),
                createdAt: new Date(),
                updatedAt: new Date(),
                revenueFeeId: 'entry-1',
                description: 'County tax',
                value: 22.4,
                type: 'TAX',
                revenueId: null,
              },
            ],
          },
          {
            id: 'entry-2',
            revenueId: 'revenueId',
            createdAt: new Date(),
            updatedAt: new Date(),
            taxable: true,
            name: 'Cleaning fee',
            pmcShare: 75,
            type: 'GUEST_FEE',
            value: 100,
            unit: 'PerStay',
            deductions: [
              {
                id: randomBytes(16).toString(),
                createdAt: new Date(),
                updatedAt: new Date(),
                revenueFeeId: 'entry-2',
                description: 'Municipal tax',
                value: 1.4,
                type: 'TAX',
                revenueId: null,
              },
              {
                id: randomBytes(16).toString(),
                createdAt: new Date(),
                updatedAt: new Date(),
                revenueFeeId: 'entry-2',
                description: 'County tax',
                value: 3,
                type: 'TAX',
                revenueId: null,
              },
              {
                id: randomBytes(16).toString(),
                createdAt: new Date(),
                updatedAt: new Date(),
                revenueFeeId: 'entry-2',
                description: 'State tax',
                value: 2,
                type: 'TAX',
                revenueId: null,
              },
            ],
          },
          {
            id: 'entry-3',
            revenueId: 'revenueId',
            createdAt: new Date(),
            updatedAt: new Date(),
            taxable: true,
            name: 'Pet fee',
            pmcShare: 40,
            type: 'GUEST_FEE',
            value: 75,
            unit: 'PerStay',
            deductions: [
              {
                id: randomBytes(16).toString(),
                createdAt: new Date(),
                updatedAt: new Date(),
                revenueFeeId: 'entry-3',
                description: 'Municipal tax',
                value: 1.05,
                type: 'TAX',
                revenueId: null,
              },
              {
                id: randomBytes(16).toString(),
                createdAt: new Date(),
                updatedAt: new Date(),
                revenueFeeId: 'entry-3',
                description: 'County tax',
                value: 2.25,
                type: 'TAX',
                revenueId: null,
              },
              {
                id: randomBytes(16).toString(),
                createdAt: new Date(),
                updatedAt: new Date(),
                revenueFeeId: 'entry-3',
                description: 'State tax',
                value: 1.5,
                type: 'TAX',
                revenueId: null,
              },
            ],
          },
          {
            id: 'entry-4',
            revenueId: 'revenueId',
            createdAt: new Date(),
            updatedAt: new Date(),
            taxable: true,
            name: 'Internet',
            pmcShare: 30,
            type: 'GUEST_FEE',
            value: 85,
            unit: 'PerStay',
            deductions: [
              {
                id: randomBytes(16).toString(),
                createdAt: new Date(),
                updatedAt: new Date(),
                revenueFeeId: 'entry-4',
                description: 'Municipal tax',
                value: 1.19,
                type: 'TAX',
                revenueId: null,
              },
              {
                id: randomBytes(16).toString(),
                createdAt: new Date(),
                updatedAt: new Date(),
                revenueFeeId: 'entry-3',
                description: 'County tax',
                value: 2.55,
                type: 'TAX',
                revenueId: null,
              },
              {
                id: randomBytes(16).toString(),
                createdAt: new Date(),
                updatedAt: new Date(),
                revenueFeeId: 'entry-3',
                description: 'State tax',
                value: 1.7,
                type: 'TAX',
                revenueId: null,
              },
            ],
          },
          {
            id: 'entry-5',
            revenueId: 'revenueId',
            createdAt: new Date(),
            updatedAt: new Date(),
            taxable: false,
            name: 'Daily Newspaper delivery',
            pmcShare: 25,
            type: 'GUEST_FEE',
            value: 60,
            unit: 'PerStay',
            deductions: [],
          },
        ],
        reservation: { channel: 'Airbnb' },
      }

      const builder = new RevenueSummaryBuilder(revenue, numberOfNights)

      const result = builder.build().getSummary()

      expect(result.grossBookingValue.amount).toEqual(1528.32)
      expect(result.grossBookingValue.managerAmount).toBeCloseTo(451.77, 2)
      expect(result.grossBookingValue.ownerAmount).toBeCloseTo(1076.55, 2)

      expect(result.channelCommission?.amount).toBeCloseTo(45.85, 2)
      expect(result.channelCommission?.managerAmount).toBeCloseTo(13.21, 2)
      expect(result.channelCommission?.ownerAmount).toBeCloseTo(32.64, 2)

      expect(result.netRevenue.amount).toEqual(1394.15)
      expect(result.netRevenue.managerAmount).toBeCloseTo(412.288, 2)
      expect(result.netRevenue.ownerAmount).toBeCloseTo(981.863, 2)

      expect(result.totalTaxes.amount).toBeCloseTo(88.32, 2)

      expect(result.allTaxes.length).toEqual(3)
    })
  })
})
