import { RevenueDeductionType } from '@prisma/client'
import type {
  AccommodationWithDeductions,
  CreditCardDeduction,
  IRevenueTax,
  ShareSplit,
  TaxDeduction,
} from 'types/revenue'
import {
  createShareSplitFromManagerShare,
  sumShareSplits,
  subtractShareSplits,
} from 'types/revenue'

export interface AccommodationRevenueSummary {
  roomRate: number
  roomRateTotal: ShareSplit

  discount: ShareSplit

  taxableRoomRate: number
  taxableRevenue: ShareSplit

  grossRevenue: ShareSplit
  netRevenue: ShareSplit
  channelCommission?: ShareSplit

  taxes: IRevenueTax[]
  totalTax: ShareSplit

  creditCard: ShareSplit
}

export interface AccommodationRevenueTaxes {
  total: ShareSplit
  taxes: IRevenueTax[]
}

export class AccommodationRevenueSummaryBuilder {
  private accommodationRevenue: AccommodationWithDeductions
  private discount: number
  private numberOfNights: number
  private channelCommission: number

  constructor(
    accommodationRevenue: AccommodationWithDeductions,
    args: {
      discount: number
      numberOfNights: number
      totalChannelCommission: number
      totalGrossRevenue: number
    }
  ) {
    this.accommodationRevenue = accommodationRevenue

    this.discount = args.discount
    this.numberOfNights = args.numberOfNights

    this.channelCommission =
      args.totalChannelCommission *
      (accommodationRevenue.value / args.totalGrossRevenue)
  }

  public build = (): AccommodationRevenueSummary => {
    const managerShare = this.accommodationRevenue.pmcShare * 0.01

    const averageNightlyRate =
      this.accommodationRevenue.value / this.numberOfNights

    const originalAmount = createShareSplitFromManagerShare({
      amount: this.accommodationRevenue.value,
      managerShare,
    })

    const discountedAmount = createShareSplitFromManagerShare({
      amount: this.accommodationRevenue.value * (this.discount / 100),
      managerShare,
    })

    const channelCommission = createShareSplitFromManagerShare({
      amount: this.channelCommission || 0,
      managerShare,
    })

    const taxableRevenue = subtractShareSplits(originalAmount, discountedAmount)

    const taxDeductions = this.accommodationRevenue.deductions.filter(
      (deduction): deduction is TaxDeduction =>
        deduction.type === RevenueDeductionType.TAX
    )

    const creditCardDeduction = this.accommodationRevenue.deductions.find(
      (deduction): deduction is CreditCardDeduction =>
        deduction.type === RevenueDeductionType.CREDIT_CARD
    )
    const creditCard = createShareSplitFromManagerShare({
      amount: creditCardDeduction?.value || 0,
      managerShare: managerShare,
    })

    const taxes = this.buildTaxes(taxDeductions, managerShare)

    const grossRevenue = sumShareSplits(taxableRevenue, taxes.total)

    const netRevenue = subtractShareSplits(
      grossRevenue,
      taxes.total,
      channelCommission,
      creditCard
    )

    return {
      roomRate: averageNightlyRate,

      roomRateTotal: originalAmount,

      discount: discountedAmount,

      taxableRoomRate: taxableRevenue.amount / this.numberOfNights,
      taxableRevenue,

      grossRevenue,

      netRevenue,

      taxes: taxes.taxes,
      totalTax: taxes.total,

      channelCommission,

      creditCard,
    }
  }

  private buildTaxes(
    taxes: TaxDeduction[],
    managerShare: number
  ): AccommodationRevenueTaxes {
    const accommodationTaxes = taxes.map((tax): IRevenueTax => {
      return {
        description: tax.description,
        value: createShareSplitFromManagerShare({
          amount: tax.value,
          managerShare: managerShare,
        }),
      }
    })

    const total: ShareSplit = sumShareSplits(
      ...accommodationTaxes.map((tax) => tax.value)
    )

    return {
      total: total,
      taxes: accommodationTaxes,
    }
  }
}
