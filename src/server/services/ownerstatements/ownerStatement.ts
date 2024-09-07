import { Channel } from '@prisma/client'
import type { DateTime } from 'luxon'
import type { IExpense } from 'types/expenses'
import type { IOwnerStatement } from 'types/ownerstatement'
import {
  EMPTY_SHARE_SPLIT,
  sumShareSplits,
  type IReservationRevenue,
  type ShareSplit,
} from 'types/revenue'

interface Props {
  listingId: string
  listingName: string
  expenses: IExpense[]
  reservations: (
    | undefined
    | {
        numberOfNights: number
        id: string
        confirmationCode: string
        channel: string
        numGuests: number
        checkIn: Date
        checkOut: Date
        revenue: IReservationRevenue
      }
  )[]
  startDate: DateTime
  isCoHost: boolean
}

export class OwnerStatement {
  listingId: string
  listingName: string
  expenses: IExpense[]
  reservations: {
    id: string
    numberOfNights: number
    confirmationCode: string
    channel: string
    numGuests: number
    checkIn: Date
    checkOut: Date
    revenue: IReservationRevenue
  }[]
  guestFees: {
    checkOut: Date
    feeType: string
    confirmationCode: string
    paidByGuest: number
    netRevenue: ShareSplit
  }[]
  startDate: DateTime
  isCoHost: boolean

  constructor({
    listingId,
    listingName,
    expenses,
    reservations,
    isCoHost,
    startDate,
  }: Props) {
    this.listingId = listingId
    this.listingName = listingName
    this.expenses = expenses.sort(
      (lhs, rhs) => lhs.date.getTime() - rhs.date.getTime()
    )

    this.isCoHost = isCoHost
    this.startDate = startDate

    this.reservations = []
    reservations.forEach((r) => {
      if (r) {
        this.reservations.push(r)
      }
    })

    this.guestFees = []
    reservations
      .filter(
        (r) =>
          r?.revenue?.guestFeeRevenue.guestFees &&
          r?.revenue?.guestFeeRevenue.guestFees.length > 0
      )
      .forEach((r) => {
        if (r && r.revenue) {
          r?.revenue?.guestFeeRevenue.guestFees.forEach((fee) => {
            if (
              this.isCoHost ||
              (!this.isCoHost && fee.amount.ownerAmount > 0)
            ) {
              this.guestFees.push({
                checkOut: r?.checkOut ?? new Date(),
                feeType: fee?.name ?? '',
                confirmationCode: r?.confirmationCode ?? '',
                paidByGuest:
                  fee?.amount.amount + (fee?.taxes.total.amount ?? 0) ?? 0,
                netRevenue: fee?.netRevenue ?? EMPTY_SHARE_SPLIT,
              })
            }
          })
        }
      })
  }

  build = (): IOwnerStatement => {
    const grossRevenue = this.reservations.reduce(
      (acc, cur) => acc + (cur?.revenue.grossBookingValue.amount || 0),
      0
    )

    const taxes = this.reservations.reduce(
      (acc, cur) =>
        acc +
        cur?.revenue.allTaxes.reduce(
          (acc2, cur2) => acc2 + (cur2?.value.amount || 0),
          0
        ),
      0
    )

    const accommodationNetRevenue = sumShareSplits(
      ...this.reservations.map((r) => r.revenue.accommodationRevenue.netRevenue)
    )

    const guestFeesNetRevenue = sumShareSplits(
      ...this.guestFees.map((f) => f.netRevenue)
    )

    const expensesTotal = this.expenses.reduce(
      (acc, cur) => acc + (cur?.ownerChargedAmount || 0),
      0
    )
    const expensesReimbursedAmount = this.expenses.reduce(
      (acc, cur) => acc + (cur?.ownerPaidAmount || 0),
      0
    )
    const expensesUnpaid = this.expenses.reduce(
      (acc, cur) => acc + (cur?.ownerUnpaidAmount || 0),
      0
    )

    const accommodationRevenue = {
      ownerPeriod: this.reservations.reduce(
        (acc, cur) =>
          acc + (cur?.revenue.accommodationRevenue.netRevenue.ownerAmount || 0),
        0
      ),
      reservations: this.reservations.map((r) => ({
        id: r.id,
        confirmationCode: r.confirmationCode,
        channel: r.channel,
        numGuests: r.numGuests,
        numberOfNights: r.numberOfNights,
        checkIn: r.checkIn,
        checkOut: r.checkOut,
        avgNightlyRate: r.revenue.accommodationRevenue.taxableRoomRate,
        guestPaid: r.revenue.accommodationRevenue.taxableRevenue.amount,
        netRevenue: r.revenue.accommodationRevenue.netRevenue,
      })),
      numberOfNights: this.reservations.reduce(
        (acc, cur) => acc + (cur?.numberOfNights || 0),
        0
      ),
      avgNightlyRate:
        this.reservations.length > 0
          ? this.reservations.reduce(
              (acc, cur) =>
                acc + (cur?.revenue.accommodationRevenue.taxableRoomRate || 0),
              0
            ) / this.reservations.length
          : 0,

      guestPaid: this.reservations.reduce(
        (acc, cur) =>
          acc + cur.revenue.accommodationRevenue.taxableRevenue.amount,
        0
      ),
      netRevenue: accommodationNetRevenue,
    }

    const guestFeeRevenue = {
      paidByGuest:
        this.guestFees.reduce((acc, cur) => acc + (cur?.paidByGuest || 0), 0) ||
        0,
      netRevenue: guestFeesNetRevenue || EMPTY_SHARE_SPLIT,
      items: this.guestFees,
    }

    const channelFeesOther = this.reservations.reduce(
      (acc, cur) =>
        acc +
        (cur.channel !== Channel.Airbnb
          ? cur?.revenue.accommodationRevenue.channelCommission?.amount ?? 0
          : 0),
      0
    )

    const netRevenue = grossRevenue - taxes - channelFeesOther

    const dueToOwnerPeriod =
      accommodationRevenue.ownerPeriod +
      guestFeeRevenue.netRevenue.ownerAmount -
      expensesUnpaid

    return {
      isCoHost: this.isCoHost,
      listingId: this.listingId,
      listingName: this.listingName,
      month: this.startDate.month,
      year: this.startDate.year,
      dueToOwnerPeriod,
      dueToManagerPeriod: grossRevenue - dueToOwnerPeriod,

      accommodationRevenue: accommodationRevenue,
      guestFeeRevenue: guestFeeRevenue,
      expenses: {
        items: this.expenses ?? [],
        costToOwnerPeriod: expensesUnpaid,
        totalAmount: expensesTotal,
        reimbursedAmount: expensesReimbursedAmount,
        unpaidAmount: expensesUnpaid,
      },
      discounts: this.reservations.reduce(
        (acc, cur) =>
          acc + (cur?.revenue.accommodationRevenue.discount.amount || 0),
        0
      ),
      taxes,
      grossRevenue,
      netRevenue,
      channelFeesOther: channelFeesOther,
    }
  }
}
