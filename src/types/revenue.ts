import type { Prisma, RevenueTax } from '@prisma/client'
import { z } from 'zod'
import type DateString from './dateString'
import type { GuestFeesSummary } from 'server/services/revenue/guestFeeRevenue'
import type { AccommodationRevenueSummary } from 'server/services/revenue/accommodationRevenue'

export type RevenueWithFeesAndTaxes = Prisma.RevenueGetPayload<{
  include: {
    fees: { include: { deductions: true } }
    reservation: { select: { channel: true } }
  }
}>

export type RevenueEntryWithDeductions = Prisma.RevenueFeeGetPayload<{
  include: { deductions: true }
}>

export type AccommodationWithDeductions = Prisma.RevenueFeeGetPayload<{
  include: { deductions: true }
}> & { type: 'ACCOMMODATION' }

export type GuestFeeWithDeductions = Prisma.RevenueFeeGetPayload<{
  include: { deductions: true }
}> & { type: 'GUEST_FEE' }

export type TaxDeduction = RevenueTax & { type: 'TAX' }
export type CreditCardDeduction = RevenueTax & { type: 'CREDIT_CARD' }

export const TaxSchema = z
  .object({
    id: z.string().optional(),
    revenueId: z.string().optional(),
    revenueFeeId: z.string().optional(),
    description: z.string(),
    value: z.number(),
  })
  .strict()

export const TaxCreateSchema = TaxSchema.omit({
  id: true,
  revenueId: true,
  revenueFeeId: true,
})

export type Tax = z.infer<typeof TaxSchema>
export type TaxCreate = z.infer<typeof TaxCreateSchema>

const RevenueFeeSchema = z.object({
  id: z.string().optional(),
  revenueId: z.string().optional(),
  name: z.string(),
  value: z.number(),
  unit: z.string(),
  taxable: z.boolean(),
  pmcShare: z.number(),
  taxes: TaxCreateSchema.array(),
})

export const RevenueFeeCreateSchema = RevenueFeeSchema.omit({
  id: true,
  revenueId: true,
  taxes: true,
})

export type RevenueFee = z.infer<typeof RevenueFeeSchema>
export type RevenueFeeCreate = z.infer<typeof RevenueFeeCreateSchema>

export const RevenueSchema = z
  .object({
    id: z.string().optional(),
    reservationId: z.string(),
    accommodationRevenue: z.number(),
    pmcShare: z.number(),
    taxes: TaxSchema.array(),
    fees: RevenueFeeSchema.array(),
    discount: z.number().optional(),
    channelCommission: z.number().optional(),
  })
  .strict()

export const RevenueCreateSchema = RevenueSchema.omit({
  id: true,
})

export type Revenue = z.infer<typeof RevenueSchema>
export type RevenueCreate = z.infer<typeof RevenueCreateSchema>

export const RevenueFiltersSchema = z
  .object({
    fromDate: z.string().optional(),
    status: z.string().optional(),
  })
  .strict()
export type RevenueFilters = z.infer<typeof RevenueFiltersSchema>

//TODO refactor this to {name, amount}
export interface IRevenueTax {
  description: string
  value: ShareSplit
}

export interface IReservationRevenue {
  revenueId: string
  accommodationRevenue: AccommodationRevenueSummary
  guestFeeRevenue: GuestFeesSummary

  grossBookingValue: ShareSplit
  netRevenue: ShareSplit
  payoutAmount: number

  totalTaxes: ShareSplit
  allTaxes: IRevenueTax[]
  channelCommission?: ShareSplit
  creditCard?: ShareSplit
}

export interface IRevenueEvent {
  id: string
  listingId: string
  listingName: string
  listingPhoto: string
  channel: string
  name: string
  email: string
  status: string
  fromDate: DateString
  toDate: DateString
  confirmationCode: string
  numberOfNights: number
  revenue: IReservationRevenue
  bookedOn?: DateString
}

export interface ShareSplit {
  readonly amount: number
  readonly managerAmount: number
  readonly ownerAmount: number
  readonly managerShare: number
  readonly ownerShare: number
}

export const EMPTY_SHARE_SPLIT: ShareSplit = {
  amount: 0,
  managerAmount: 0,
  ownerAmount: 0,
  managerShare: 0,
  ownerShare: 0,
}

// TODO: Reactor this to {value:number, pmcShare:numbert} to match `RevenueFee`?
export function createShareSplitFromManagerShare(amountManagerShare: {
  amount: number
  managerShare: number
}): ShareSplit {
  const { amount, managerShare } = amountManagerShare
  if (managerShare < 0 || managerShare > 1) {
    throw new Error(
      `Manager share must be between 0 and 1, but received ${managerShare}`
    )
  }
  const managerAmount = amount * managerShare
  const ownerShare = 1 - managerShare
  const ownerAmount = amount * ownerShare

  return {
    amount,
    managerAmount,
    ownerAmount,
    managerShare,
    ownerShare,
  }
}

export function sumShareSplits(...shareSplits: ShareSplit[]): ShareSplit {
  const amounts = shareSplits.reduce(
    (acc, curr) => {
      return {
        amount: acc.amount + curr.amount,
        managerAmount: acc.managerAmount + curr.managerAmount,
        ownerAmount: acc.ownerAmount + curr.ownerAmount,
      }
    },
    { amount: 0, managerAmount: 0, ownerAmount: 0 }
  )

  return createShareSplitFromAmounts(amounts)
}

export function subtractShareSplits(
  firstSplit: ShareSplit,
  ...remainingSplits: ShareSplit[]
): ShareSplit {
  const amounts = remainingSplits.reduce(
    (acc, curr) => {
      return {
        amount: acc.amount - curr.amount,
        managerAmount: acc.managerAmount - curr.managerAmount,
        ownerAmount: acc.ownerAmount - curr.ownerAmount,
      }
    },
    {
      amount: firstSplit.amount,
      managerAmount: firstSplit.managerAmount,
      ownerAmount: firstSplit.ownerAmount,
    }
  )

  return createShareSplitFromAmounts(amounts)
}

function createShareSplitFromAmounts(amounts: {
  amount: number
  managerAmount: number
  ownerAmount: number
}) {
  const { amount, managerAmount, ownerAmount } = amounts
  const managerShare = managerAmount / amount || 0
  const ownerShare = ownerAmount / amount || 0

  return {
    amount,
    managerAmount,
    ownerAmount,
    managerShare,
    ownerShare,
  }
}

export type ReservationUrlParams =
  | 'reservationsSort'
  | 'reservationsDir'
  | 'channel'
  | 'status'
  | 'fromDate'
  | 'bookedOn'
  | 'toDate'

export type TransactionUrlParams =
  | 'transactionsSort'
  | 'transactionsDir'
  | 'vendor'
  | 'date'

export type ReconciliationUrlParams = 'reservationsTab' | 'transactionsTab'
