import type {
  AccommodationWithDeductions,
  GuestFeeWithDeductions,
  IRevenueTax,
  RevenueWithFeesAndTaxes,
  ShareSplit,
} from 'types/revenue'
import {
  type IReservationRevenue,
  EMPTY_SHARE_SPLIT,
  sumShareSplits,
  subtractShareSplits,
} from 'types/revenue'
import {
  AccommodationRevenueSummaryBuilder,
  type AccommodationRevenueSummary,
} from './accommodationRevenue'
import {
  GuestFeesSummaryBuilder,
  type GuestFeesSummary,
} from './guestFeeRevenue'
import { RevenueEntryType } from '@prisma/client'

interface Props {
  revenueId: string
  accommodationRevenueSummary: AccommodationRevenueSummary
  guestFeesSummary: GuestFeesSummary
}

interface PayoutProps {
  grossBookingValue: ShareSplit
  channelCommission: ShareSplit
  creditCard: ShareSplit
}

abstract class RevenueSummary {
  private revenueId: string
  private accommodationRevenueSummary: AccommodationRevenueSummary
  private guestFeesSummary: GuestFeesSummary

  constructor({
    revenueId,
    accommodationRevenueSummary,
    guestFeesSummary,
  }: Props) {
    this.revenueId = revenueId
    this.accommodationRevenueSummary = accommodationRevenueSummary
    this.guestFeesSummary = guestFeesSummary
  }

  abstract calculatePayout({
    grossBookingValue,
    channelCommission,
    creditCard,
  }: PayoutProps): number

  public getSummary = () => {
    const allTaxes = this.getTaxSummary([
      ...this.accommodationRevenueSummary.taxes,
      ...this.guestFeesSummary.taxes,
    ])

    const totalTaxes = sumShareSplits(...allTaxes.map((tax) => tax.value))

    const grossBookingValue = sumShareSplits(
      this.accommodationRevenueSummary.taxableRevenue,
      this.guestFeesSummary.nonTaxableGuestFeesTotal,
      this.guestFeesSummary.taxableGuestFeesTotal,
      totalTaxes
    )

    const channelCommission = sumShareSplits(
      this.accommodationRevenueSummary.channelCommission || EMPTY_SHARE_SPLIT,
      this.guestFeesSummary.guestFeesChannelCommission
    )

    const creditCard = sumShareSplits(
      this.accommodationRevenueSummary.creditCard || EMPTY_SHARE_SPLIT,
      this.guestFeesSummary.guestFeesCreditCard
    )

    const payoutAmount = this.calculatePayout({
      grossBookingValue,
      channelCommission,
      creditCard,
    })

    const netRevenue = subtractShareSplits(
      grossBookingValue,
      totalTaxes,
      channelCommission,
      creditCard
    )

    const result: IReservationRevenue = {
      revenueId: this.revenueId,
      grossBookingValue,
      netRevenue,

      totalTaxes,
      allTaxes,

      payoutAmount,

      accommodationRevenue: this.accommodationRevenueSummary,
      guestFeeRevenue: this.guestFeesSummary,
    }

    if (channelCommission.amount > 0) {
      result.channelCommission = channelCommission
    }

    if (creditCard.amount > 0) {
      result.creditCard = creditCard
    }

    return result
  }

  private getPmcShare = (listingPmcShare: number) => {
    return listingPmcShare * 0.01
  }

  private getOwnerShare = (listingPmcShare: number) => {
    return 1 - this.getPmcShare(listingPmcShare)
  }

  private getTaxSummary = (allTaxes: IRevenueTax[]) => {
    const taxNames = new Set(allTaxes.map((tax) => tax.description))

    const summary: IRevenueTax[] = []

    taxNames.forEach((item) => {
      const taxValues = allTaxes
        .filter((t) => t.description === item)
        .map((tax) => tax.value)

      summary.push({
        description: item,
        value: sumShareSplits(...taxValues),
      })
    })

    return summary
  }
}

class AirbnbRevenueSummary extends RevenueSummary {
  calculatePayout({
    grossBookingValue,
    channelCommission,
  }: PayoutProps): number {
    const payoutAmount = subtractShareSplits(
      grossBookingValue,
      channelCommission
    ).amount

    return payoutAmount
  }
}

class VrboRevenueSummary extends RevenueSummary {
  calculatePayout({ grossBookingValue, creditCard }: PayoutProps): number {
    const payoutAmount = subtractShareSplits(
      grossBookingValue,
      creditCard
    ).amount

    return payoutAmount
  }
}

class DirectRevenueSummary extends RevenueSummary {
  calculatePayout({ grossBookingValue, creditCard }: PayoutProps): number {
    const payoutAmount = subtractShareSplits(
      grossBookingValue,
      creditCard
    ).amount

    return payoutAmount
  }
}

export class RevenueSummaryBuilder {
  private revenue: RevenueWithFeesAndTaxes
  private numberOfNights: number

  constructor(revenue: RevenueWithFeesAndTaxes, numberOfNights: number) {
    this.revenue = revenue
    this.numberOfNights = numberOfNights
  }

  public build = (): RevenueSummary => {
    const numberOfNights = this.numberOfNights
    const discount = this.revenue.discount || 0
    const totalChannelCommission = this.revenue.channelCommission || 0
    const totalGrossRevenue = this.revenue.fees.reduce((acc, curr) => {
      return acc + curr.value
    }, 0)

    const accommodationRevenue = this.revenue.fees.find(
      (fee): fee is AccommodationWithDeductions =>
        fee.type === RevenueEntryType.ACCOMMODATION
    )

    if (accommodationRevenue === undefined) {
      throw new Error('No accommodation revenue found')
    }

    const accommodationRevenueSummary = new AccommodationRevenueSummaryBuilder(
      accommodationRevenue,
      {
        discount,
        numberOfNights,
        totalChannelCommission,
        totalGrossRevenue,
      }
    ).build()

    const guestFees: GuestFeeWithDeductions[] = this.revenue.fees.filter(
      (fee): fee is GuestFeeWithDeductions =>
        fee.type === RevenueEntryType.GUEST_FEE
    )

    const guestFeesSummary = new GuestFeesSummaryBuilder(
      guestFees,
      totalChannelCommission,
      totalGrossRevenue
    ).build()

    if (this.revenue.reservation.channel === 'Airbnb') {
      return new AirbnbRevenueSummary({
        revenueId: this.revenue.id,
        accommodationRevenueSummary,
        guestFeesSummary,
      })
    } else if (this.revenue.reservation.channel === 'VRBO') {
      return new VrboRevenueSummary({
        revenueId: this.revenue.id,
        accommodationRevenueSummary,
        guestFeesSummary,
      })
    } else if (this.revenue.reservation.channel === 'Direct') {
      return new DirectRevenueSummary({
        revenueId: this.revenue.id,
        accommodationRevenueSummary,
        guestFeesSummary,
      })
    } else {
      throw new Error(
        `Revenue summary builder not implemented for channel ${this.revenue.reservation.channel}`
      )
    }
  }
}
