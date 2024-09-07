import type { IExpense } from './expenses'
import type { ShareSplit } from './revenue'

export interface IAccommodationReservation {
  id: string
  confirmationCode: string
  channel: string
  numGuests: number
  numberOfNights: number
  checkIn: Date
  checkOut: Date
  avgNightlyRate: number
  guestPaid: number
  netRevenue: ShareSplit
}

export interface IAccommodationRevenue {
  ownerPeriod: number
  numberOfNights: number
  avgNightlyRate: number
  guestPaid: number
  netRevenue: ShareSplit
  reservations: IAccommodationReservation[]
}

export interface IGuestFeeRevenueItem {
  checkOut: Date
  feeType: string
  confirmationCode: string
  paidByGuest: number
  netRevenue: ShareSplit
}

export interface IGuestFeeRevenue {
  paidByGuest: number
  netRevenue: ShareSplit
  items: IGuestFeeRevenueItem[]
}

export interface IOwnerExpense {
  costToOwnerPeriod: number
  totalAmount: number
  reimbursedAmount: number
  unpaidAmount: number
  items: IExpense[]
}

export interface IOwnerStatement {
  accommodationRevenue: IAccommodationRevenue
  guestFeeRevenue: IGuestFeeRevenue
  listingId: string
  listingName: string
  month: number
  year: number
  dueToOwnerPeriod: number
  dueToManagerPeriod: number
  expenses: IOwnerExpense
  isCoHost: boolean
  discounts: number
  taxes: number
  grossRevenue: number
  netRevenue: number
  channelFeesOther: number
}

export interface IOwnerStatementListItem {
  id: string
  listingId: string
  listingName: string
  month: number
  year: number
  isLocked: boolean
  ownerPortal?: boolean
}
