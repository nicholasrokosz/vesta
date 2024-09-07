import { sumShareSplits, type IReservationRevenue } from 'types/revenue'
import { formatForCSV } from './revenueCsv'
import DateString from 'types/dateString'

test('formats the object correctly', () => {
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
    payoutAmount: 0,
  }

  const formattedResult = formatForCSV([
    {
      id: '1234',
      listingId: '1234',
      listingName: 'Hello World',
      listingPhoto: '',
      channel: 'Airbnb',
      status: 'Confirmed',
      name: 'John Doe',
      email: 'jdoe@ded.com',
      fromDate: DateString.fromString('2019-12-31'),
      toDate: DateString.fromString('2020-01-01'),
      confirmationCode: 'ABC123',
      numberOfNights: 1,
      revenue: revenue,
      bookedOn: DateString.fromString('2019-11-30'),
    },
  ])

  expect(formattedResult[0].numberOfNights).toBe(1)
  expect(formattedResult[0].listingName).toBe('Hello World')
  expect(formattedResult[0].channel).toBe('Airbnb')
  expect(formattedResult[0].status).toBe('Confirmed')
  expect(formattedResult[0].guestName).toBe('John Doe')
  expect(formattedResult[0].guestEmail).toBe('jdoe@ded.com')
  expect(formattedResult[0].fromDate).toBe('12/31/2019')
  expect(formattedResult[0].toDate).toBe('01/01/2020')
  expect(formattedResult[0].confirmationCode).toBe('ABC123')
  expect(formattedResult[0].effectiveAdr).toBe('$365.88')
  expect(formattedResult[0].grossBookingValue).toBe('$3,397.75')
  expect(formattedResult[0].accommodationRevenue).toBe('$1,992.97')
  expect(formattedResult[0].totalGuestFees).toBe('$179.41')
  expect(formattedResult[0].municipalTax).toBe('$222.81')
  expect(formattedResult[0].countyTax).toBe('$111.49')
  expect(formattedResult[0].stateTax).toBe('$278.57')
  expect(formattedResult[0].propertyManagerProceeds).toBe('$921.96')
  expect(formattedResult[0].propertyOwnerProceeds).toBe('$1,250.35')
  expect(formattedResult[0].bookedOn).toBe('11/30/2019')
})
