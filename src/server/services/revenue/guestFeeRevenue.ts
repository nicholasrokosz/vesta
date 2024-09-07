import { RevenueDeductionType } from '@prisma/client'
import type {
  CreditCardDeduction,
  GuestFeeWithDeductions,
  IRevenueTax,
  ShareSplit,
  TaxDeduction,
} from 'types/revenue'
import {
  createShareSplitFromManagerShare,
  sumShareSplits,
  subtractShareSplits,
} from 'types/revenue'

export interface GuestFeesSummary {
  guestFees: GuestFee[]
  taxes: IRevenueTax[]
  taxableGuestFeesTotal: ShareSplit
  nonTaxableGuestFeesTotal: ShareSplit
  guestFeesGross: ShareSplit
  guestFeesChannelCommission: ShareSplit
  guestFeesTaxTotals: ShareSplit
  guestFeesCreditCard: ShareSplit
  guestFeesNet: ShareSplit
}

export interface GuestFee {
  id: string
  name: string
  amount: ShareSplit
  taxable: boolean
  taxes: GuestFeeTaxes
  channelCommission: ShareSplit
  creditCard: ShareSplit
  netRevenue: ShareSplit
}

export interface GuestFeeTax extends IRevenueTax {
  feeId: string | null // TODO: remove this nullable
}
export interface GuestFeeTaxes {
  total: ShareSplit
  taxes: GuestFeeTax[]
}

export class GuestFeesSummaryBuilder {
  private guestFees: GuestFee[] = []
  private totalChannelCommission: number
  private totalGrossRevenue: number

  public constructor(
    guestFees: GuestFeeWithDeductions[],
    totalChannelCommission: number,
    totalGrossRevenue: number
  ) {
    this.totalChannelCommission = totalChannelCommission
    this.totalGrossRevenue = totalGrossRevenue

    guestFees.forEach((guestFee) => this.addGuestFee(guestFee))
  }

  public addGuestFee = (guestFee: GuestFeeWithDeductions) => {
    this.guestFees.push(this.buildGuestFee(guestFee))
  }

  public build = (): GuestFeesSummary => {
    const taxableFees = this.guestFees.filter((guestFee) => guestFee.taxable)
    const nonTaxableFees = this.guestFees.filter(
      (guestFee) => !guestFee.taxable
    )

    const guestFeesTaxTotals = sumShareSplits(
      ...taxableFees.map((fee) => fee.taxes.total)
    )

    const nonTaxableGuestFeesTotal = sumShareSplits(
      ...nonTaxableFees.map((fee) => fee.amount)
    )

    const taxableGuestFeesTotal = sumShareSplits(
      ...taxableFees.map((fee) => fee.amount)
    )

    const guestFeesChannelCommission = sumShareSplits(
      ...this.guestFees.map((fee) => fee.channelCommission)
    )

    const guestFeesCreditCard = sumShareSplits(
      ...this.guestFees.map((fee) => fee.creditCard)
    )

    const guestFeesGross = sumShareSplits(
      taxableGuestFeesTotal,
      nonTaxableGuestFeesTotal,
      guestFeesTaxTotals
    )

    const guestFeesNet = subtractShareSplits(
      guestFeesGross,
      guestFeesTaxTotals,
      guestFeesChannelCommission,
      guestFeesCreditCard
    )

    return {
      guestFees: this.guestFees,
      taxes: this.buildTaxSummary(
        taxableFees.flatMap((fee) => fee.taxes.taxes)
      ),
      taxableGuestFeesTotal,
      nonTaxableGuestFeesTotal,
      guestFeesGross,
      guestFeesChannelCommission,
      guestFeesCreditCard,
      guestFeesTaxTotals,
      guestFeesNet,
    }
  }

  private buildTaxSummary = (taxes: GuestFeeTax[]): IRevenueTax[] => {
    const taxNames = new Set(taxes.map((tax) => tax.description))
    const summary: IRevenueTax[] = []

    taxNames.forEach((item) => {
      const taxValues = taxes
        .filter((t) => t.description === item)
        .map((t) => t.value)

      summary.push({
        description: item,
        value: sumShareSplits(...taxValues),
      })
    })

    return summary
  }

  private buildGuestFee = (guestFee: GuestFeeWithDeductions): GuestFee => {
    const managerShare = guestFee.pmcShare * 0.01

    const amount = createShareSplitFromManagerShare({
      amount: guestFee.value,
      managerShare: managerShare,
    })

    const feeChannelCommission =
      this.totalChannelCommission * (guestFee.value / this.totalGrossRevenue) ||
      0

    const taxes: TaxDeduction[] = guestFee.deductions.filter(
      (deduction): deduction is TaxDeduction =>
        deduction.type === RevenueDeductionType.TAX
    )

    const creditCardDeduction = guestFee.deductions.find(
      (deduction): deduction is CreditCardDeduction =>
        deduction.type === RevenueDeductionType.CREDIT_CARD
    )
    const creditCard = createShareSplitFromManagerShare({
      amount: creditCardDeduction?.value || 0,
      managerShare: managerShare,
    })

    const netFeeRevenue =
      amount.amount - feeChannelCommission - creditCard.amount

    return {
      id: guestFee.id,
      amount: amount,
      name: guestFee.name,
      taxable: guestFee.taxable,
      taxes: this.buildTaxes(taxes, managerShare),
      channelCommission: createShareSplitFromManagerShare({
        amount: feeChannelCommission,
        managerShare: managerShare,
      }),
      netRevenue: createShareSplitFromManagerShare({
        amount: netFeeRevenue,
        managerShare: managerShare,
      }),
      creditCard: creditCard,
    }
  }

  private buildTaxes(
    taxes: TaxDeduction[],
    managerShare: number
  ): GuestFeeTaxes {
    const guestFeeTaxes = taxes.map((tax): GuestFeeTax => {
      return {
        description: tax.description,
        value: createShareSplitFromManagerShare({
          amount: tax.value,
          managerShare: managerShare,
        }),
        feeId: tax.revenueFeeId,
      }
    })
    const total = sumShareSplits(...guestFeeTaxes.map((tax) => tax.value))

    return {
      total: total,
      taxes: guestFeeTaxes,
    }
  }
}
