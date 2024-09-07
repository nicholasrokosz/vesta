import { GuestFeesSummaryBuilder } from './guestFeeRevenue'
import {
  guestFeesFixture,
  totalChannelCommissionFixture,
  totalGrossRevenueFixture,
} from './revenue.test.fixtures'

describe('Guest Fee Revenue', () => {
  describe('calculate', () => {
    it('gets the correct values', () => {
      const guestFees = guestFeesFixture()
      const totalChannelCommission = totalChannelCommissionFixture
      const totalGrossRevenue = totalGrossRevenueFixture

      const builder = new GuestFeesSummaryBuilder(
        guestFees,
        totalChannelCommission,
        totalGrossRevenue
      )

      const result = builder.build()

      expect(result.guestFees.length).toEqual(4)

      expect(result.taxableGuestFeesTotal.amount).toEqual(230)
      expect(result.taxableGuestFeesTotal.managerAmount).toEqual(160)
      expect(result.taxableGuestFeesTotal.ownerAmount).toEqual(70)
      expect(result.taxableGuestFeesTotal.managerShare).toBeCloseTo(0.696)

      expect(result.nonTaxableGuestFeesTotal.amount).toEqual(132)
      expect(result.nonTaxableGuestFeesTotal.managerAmount).toBeCloseTo(52.8)
      expect(result.nonTaxableGuestFeesTotal.ownerAmount).toEqual(79.2)

      expect(result.guestFeesTaxTotals.amount).toBeCloseTo(50.6, 2)
      expect(result.guestFeesTaxTotals.managerAmount).toBeCloseTo(35.2, 2)
      expect(result.guestFeesTaxTotals.ownerAmount).toBeCloseTo(15.4, 2)
      expect(result.guestFeesTaxTotals.managerShare).toBeCloseTo(0.69565217, 2)
      expect(result.guestFeesTaxTotals.ownerShare).toBeCloseTo(0.30434783, 2)

      expect(result.guestFeesGross.amount).toEqual(412.6)
      expect(result.guestFeesGross.managerAmount).toEqual(248)
      expect(result.guestFeesGross.ownerAmount).toEqual(164.6)
      expect(result.guestFeesGross.managerShare).toBeCloseTo(0.60106641, 2)
      expect(result.guestFeesGross.ownerShare).toBeCloseTo(0.39893359, 2)

      expect(result.guestFeesChannelCommission.amount).toEqual(10.86)
      expect(result.guestFeesChannelCommission.managerAmount).toEqual(6.384)
      expect(result.guestFeesChannelCommission.ownerAmount).toEqual(4.476)
      expect(result.guestFeesChannelCommission.managerShare).toBeCloseTo(
        0.5878453,
        2
      )
      expect(result.guestFeesChannelCommission.ownerShare).toBeCloseTo(
        0.4121547,
        2
      )

      expect(result.guestFeesNet.amount).toBeCloseTo(351.14, 2)
      expect(result.guestFeesNet.managerAmount).toBeCloseTo(206.416, 2)
      expect(result.guestFeesNet.ownerAmount).toBeCloseTo(144.724, 2)
      expect(result.guestFeesNet.managerShare).toBeCloseTo(0.5878453, 2)
      expect(result.guestFeesNet.ownerShare).toBeCloseTo(0.4121547, 2)

      expect(result.taxes.length).toEqual(3)
    })
  })
})
