import { renderHook } from '@testing-library/react'
import { useReconciliationStatus } from './useReconciliationStatus'
import { PlaidImportStatus } from '@prisma/client'
import {
  sumShareSplits,
  type IReservationRevenue,
  type IRevenueEvent,
} from 'types/revenue'
import DateString from 'types/dateString'

const split = {
  amount: 0,
  managerAmount: 0,
  ownerAmount: 0,
  managerShare: 0,
  ownerShare: 0,
}

const allTaxes = [
  {
    description: 'Municipal tax',
    value: {
      ...split,
      amount: 222.812,
    },
  },
  {
    description: 'County tax',
    value: {
      ...split,
      amount: 111.489,
    },
  },
  {
    description: 'State tax',
    value: {
      ...split,
      amount: 278.566,
    },
  },
]

const revenue: IReservationRevenue = {
  revenueId: '1234',
  grossBookingValue: {
    ...split,
    amount: 3397.745,
  },
  netRevenue: {
    amount: 2172.365,
    managerAmount: 921.9634,
    ownerAmount: 1250.3456,
    managerShare: 0,
    ownerShare: 0,
  },
  totalTaxes: sumShareSplits(...allTaxes.map((t) => t.value)),
  allTaxes: allTaxes,
  accommodationRevenue: {
    taxableRoomRate: 365.8765,
    netRevenue: {
      ...split,
      amount: 1992.96543,
    },
    roomRate: 0,
    roomRateTotal: split,
    discount: split,
    taxableRevenue: split,
    grossRevenue: split,
    taxes: [],
    totalTax: split,
    creditCard: split,
  },
  guestFeeRevenue: {
    guestFeesNet: {
      ...split,
      amount: 179.4123,
    },
    guestFees: [],
    nonTaxableGuestFeesTotal: split,
    taxableGuestFeesTotal: split,
    guestFeesGross: split,
    guestFeesChannelCommission: split,
    guestFeesTaxTotals: split,
    taxes: [],
    guestFeesCreditCard: split,
  },
  payoutAmount: 100,
}

const reservation: IRevenueEvent = {
  id: '',
  listingId: '',
  listingName: '',
  listingPhoto: '',
  channel: '',
  name: 'Spongebob',
  email: 'bob@squarepants.com',
  status: 'CONFIRMED',
  fromDate: DateString.fromDate(new Date()),
  toDate: DateString.fromDate(new Date()),
  confirmationCode: 'xyz',
  numberOfNights: 0,
  revenue: revenue,
}

test('returns false when there is nothing to reconcile', () => {
  const { result } = renderHook(() =>
    useReconciliationStatus({ transactions: [], reservations: [] })
  )
  expect(result.current.canReconcile).toEqual(false)
})

test('returns false when the difference of the selections results in anything other than 0', () => {
  const { result } = renderHook(() =>
    useReconciliationStatus({
      transactions: [
        {
          id: '1',
          accountId: '12',
          status: PlaidImportStatus.PENDING,
          date: new Date(),
          amount: 200,
          vendor: 'test',
          account: { name: 'test account' },
        },
      ],
      reservations: [reservation],
    })
  )
  expect(result.current.canReconcile).toEqual(false)
  expect(result.current.gapToReconcile).toEqual(-100)
})

test('returns true when the difference of the selections results in 0', () => {
  const { result } = renderHook(() =>
    useReconciliationStatus({
      transactions: [
        {
          id: '1',
          accountId: '12',
          status: PlaidImportStatus.PENDING,
          date: new Date(),
          amount: 100,
          vendor: 'test',
          account: { name: 'test account' },
        },
      ],
      reservations: [reservation],
    })
  )
  expect(result.current.canReconcile).toEqual(true)
  expect(result.current.gapToReconcile).toEqual(0)
})
