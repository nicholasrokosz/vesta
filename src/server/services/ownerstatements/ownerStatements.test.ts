import { DateTime } from 'luxon'
import { OwnerStatement } from './ownerStatement'
import { sumShareSplits, type IReservationRevenue } from 'types/revenue'
import type { IExpense } from 'types/expenses'

describe('Owner Statement', () => {
  describe('build', () => {
    const managerShare = 0.4
    const ownerShare = 1 - managerShare

    const allTaxes = [
      {
        description: 'Municipal tax',
        value: {
          amount: 222.8,
          managerAmount: 94.56,
          ownerAmount: 128.24,
          managerShare: 0.4244165170556553,
          ownerShare: 0.5755834829443447,
        },
      },
      {
        description: 'County tax',
        value: {
          amount: 111.4,
          managerAmount: 47.28,
          ownerAmount: 64.12,
          managerShare: 0.4244165170556553,
          ownerShare: 0.5755834829443447,
        },
      },
      {
        description: 'State tax',
        value: {
          amount: 278.5,
          managerAmount: 118.2,
          ownerAmount: 160.29999999999998,
          managerShare: 0.4244165170556553,
          ownerShare: 0.5755834829443447,
        },
      },
    ]

    const revenue: IReservationRevenue = {
      revenueId: '1234',
      grossBookingValue: {
        amount: 3397.7,
        managerAmount: 0,
        ownerAmount: 0,
        managerShare: managerShare,
        ownerShare: ownerShare,
      },
      netRevenue: {
        amount: 2172.3,
        managerAmount: 921.96,
        ownerAmount: 1250.34,
        managerShare: 0.42441652,
        ownerShare: 0.57558348,
      },
      totalTaxes: sumShareSplits(...allTaxes.map((t) => t.value)),
      allTaxes: allTaxes,
      payoutAmount: 0,
      accommodationRevenue: {
        roomRate: 365,
        roomRateTotal: {
          amount: 2555,
          managerAmount: 1022,
          ownerAmount: 1533,
          managerShare: managerShare,
          ownerShare: ownerShare,
        },
        taxableRoomRate: 365,
        taxableRevenue: {
          amount: 2555,
          managerAmount: 1022,
          ownerAmount: 1533,
          managerShare: managerShare,
          ownerShare: ownerShare,
        },
        grossRevenue: {
          amount: 0,
          managerAmount: 0,
          ownerAmount: 0,
          managerShare: managerShare,
          ownerShare: ownerShare,
        },
        netRevenue: {
          amount: 1992.9,
          managerAmount: 797.1600000000001,
          ownerAmount: 1195.74,
          managerShare: managerShare,
          ownerShare: ownerShare,
        },
        discount: {
          amount: 0,
          managerAmount: 0,
          ownerAmount: 0,
          managerShare: managerShare,
          ownerShare: ownerShare,
        },
        totalTax: {
          amount: 612.7,
          managerAmount: 245.08,
          ownerAmount: 367.62,
          managerShare: managerShare,
          ownerShare: ownerShare,
        },

        taxes: [
          {
            description: 'Municipal tax',
            value: {
              amount: 204.4,
              managerAmount: 81.76,
              ownerAmount: 122.64,
              managerShare: managerShare,
              ownerShare: ownerShare,
            },
          },
          {
            description: 'County tax',
            value: {
              amount: 102.2,
              managerAmount: 40.88,
              ownerAmount: 61.32,
              managerShare: managerShare,
              ownerShare: ownerShare,
            },
          },
          {
            description: 'State tax',
            value: {
              amount: 255.5,
              managerAmount: 102.2,
              ownerAmount: 153.29999999999998,
              managerShare: managerShare,
              ownerShare: ownerShare,
            },
          },
        ],
        creditCard: {
          amount: 0,
          managerAmount: 0,
          ownerAmount: 0,
          managerShare: managerShare,
          ownerShare: ownerShare,
        },
      },
      guestFeeRevenue: {
        guestFees: [
          {
            id: 'clkjwcpf6001uvzbp632ecxgl',
            name: 'Cleaning fee',
            amount: {
              amount: 100,
              managerAmount: 50,
              ownerAmount: 50,
              managerShare: 0.5,
              ownerShare: 0.5,
            },
            taxable: true,
            taxes: {
              total: {
                amount: 22,
                managerAmount: 11,
                ownerAmount: 11,
                managerShare: 0.5,
                ownerShare: 0.5,
              },
              taxes: [], // The itemized tax records are not needed for this test
            },
            channelCommission: {
              amount: 0,
              managerAmount: 0,
              ownerAmount: 0,
              managerShare: 0,
              ownerShare: 0,
            },
            netRevenue: {
              amount: 100,
              managerAmount: 50,
              ownerAmount: 50,
              managerShare: 0.5,
              ownerShare: 0.5,
            },
            creditCard: {
              amount: 0,
              managerAmount: 0,
              ownerAmount: 0,
              managerShare: 0,
              ownerShare: 0,
            },
          },
          {
            id: 'clkjwcpf6001vvzbpso6wuf4t',
            name: 'Pet fee',
            amount: {
              amount: 80,
              managerAmount: 60,
              ownerAmount: 20,
              managerShare: 0.75,
              ownerShare: 0.25,
            },
            taxable: true,
            taxes: {
              total: {
                amount: 17.6,
                managerAmount: 13.2,
                ownerAmount: 4.4,
                managerShare: 0.75,
                ownerShare: 0.25,
              },
              taxes: [], // The itemized tax records are not needed for this test
            },
            channelCommission: {
              amount: 0,
              managerAmount: 0,
              ownerAmount: 0,
              managerShare: 0,
              ownerShare: 0,
            },
            netRevenue: {
              amount: 80,
              managerAmount: 60,
              ownerAmount: 20,
              managerShare: 0.75,
              ownerShare: 0.25,
            },
            creditCard: {
              amount: 0,
              managerAmount: 0,
              ownerAmount: 0,
              managerShare: 0,
              ownerShare: 0,
            },
          },
          {
            id: 'clkjwcpf6001wvzbphzp1kq2h',
            name: 'Internet',
            amount: {
              amount: 50,
              managerAmount: 50,
              ownerAmount: 0,
              managerShare: 1,
              ownerShare: 0,
            },
            taxable: true,
            taxes: {
              total: {
                amount: 11,
                managerAmount: 11,
                ownerAmount: 0,
                managerShare: 1,
                ownerShare: 0,
              },
              taxes: [], // The itemized tax records are not needed for this test
            },
            channelCommission: {
              amount: 0,
              managerAmount: 0,
              ownerAmount: 0,
              managerShare: 0,
              ownerShare: 0,
            },
            netRevenue: {
              amount: 50,
              managerAmount: 50,
              ownerAmount: 0,
              managerShare: 1,
              ownerShare: 0,
            },
            creditCard: {
              amount: 0,
              managerAmount: 0,
              ownerAmount: 0,
              managerShare: 0,
              ownerShare: 0,
            },
          },
        ],
        taxes: [
          {
            description: 'Municipal tax',
            value: {
              amount: 18.4,
              managerAmount: 12.8,
              ownerAmount: 5.6,
              managerShare: 0.6956521739130436,
              ownerShare: 0.30434782608695654,
            },
          },
          {
            description: 'County tax',
            value: {
              amount: 9.2,
              managerAmount: 6.4,
              ownerAmount: 2.8,
              managerShare: 0.6956521739130436,
              ownerShare: 0.30434782608695654,
            },
          },
          {
            description: 'State tax',
            value: {
              amount: 23,
              managerAmount: 16,
              ownerAmount: 7,
              managerShare: 0.6956521739130436,
              ownerShare: 0.30434782608695654,
            },
          },
        ],

        taxableGuestFeesTotal: {
          amount: 230,
          managerAmount: 160,
          ownerAmount: 70,
          managerShare: 0.6956521739130435,
          ownerShare: 0.30434782608695654,
        },
        nonTaxableGuestFeesTotal: {
          amount: 0,
          managerAmount: 0,
          ownerAmount: 0,
          managerShare: 100,
          ownerShare: 0,
        },
        guestFeesGross: {
          amount: 280.6,
          managerAmount: 195.2,
          ownerAmount: 85.4,
          managerShare: 0.6956521739130435,
          ownerShare: 0.30434782608695654,
        },
        guestFeesChannelCommission: {
          amount: 0,
          managerAmount: 0,
          ownerAmount: 0,
          managerShare: 0,
          ownerShare: 0,
        },
        guestFeesTaxTotals: {
          amount: 50.6,
          managerAmount: 35.2,
          ownerAmount: 15.4,
          managerShare: 0.6956521739130435,
          ownerShare: 0.30434782608695654,
        },
        guestFeesNet: {
          amount: 179.4,
          managerAmount: 124.8,
          ownerAmount: 54.6,
          managerShare: 0.6956521739130435,
          ownerShare: 0.30434782608695654,
        },
        guestFeesCreditCard: {
          amount: 0,
          managerAmount: 0,
          ownerAmount: 0,
          managerShare: 0,
          ownerShare: 0,
        },
      },
    }
    const expenses: IExpense[] = [
      {
        id: 'clkjzy95b0029vzbpnfudd17h',
        amount: 100,
        date: new Date('2023-09-02'),
        vendor: 'Property Vine',
        description: 'Cleaning fee - owner stay',
        receiptUrl: '',
        invoiceUrl: '',
        listingId: 'clkjrj6e40026vznijpzlr5a8',
        listingName: 'Sanctum sanctorum',
        ownerName: 'Stephen Strange',
        ownerPaidAmount: 0,
        ownerChargedAmount: 100,
        ownerUnpaidAmount: 100,
        listingExpenses: [],
      },
      {
        id: 'clkjzx2rp0028vzbpk160fiip',
        amount: 150,
        date: new Date('2023-09-01'),
        vendor: 'Mario Bros Plumbing',
        description: 'Water heater replacement',
        receiptUrl: '',
        invoiceUrl: '',
        listingId: 'clkjrj6e40026vznijpzlr5a8',
        listingName: 'Sanctum sanctorum',
        ownerName: 'Stephen Strange',
        ownerPaidAmount: 50,
        ownerChargedAmount: 150,
        ownerUnpaidAmount: 100,
        listingExpenses: [],
      },
    ]

    const input = {
      reservations: [
        {
          numberOfNights: 7,
          id: 'some-reservation-id',
          confirmationCode: '',
          channel: 'Direct',
          numGuests: 2,
          checkIn: new Date('2023-09-05'),
          checkOut: new Date('2023-09-12'),
          revenue,
        },
      ],
      expenses,
      listingId: 'clkjrj6e40026vznijpzlr5a8',
      listingName: 'Sanctum sanctorum',
      isCoHost: false,
      startDate: DateTime.fromJSDate(new Date('09-01-2023')),
    }

    it('gets the correct values for owner statements', () => {
      const ownerStatement = new OwnerStatement(input)
      const result = ownerStatement.build()

      expect(result.isCoHost).toBe(false)
      expect(result.listingId).toBe('clkjrj6e40026vznijpzlr5a8')
      expect(result.listingName).toBe('Sanctum sanctorum')
      expect(result.month).toBe(9)
      expect(result.year).toBe(2023)

      expect(result.dueToOwnerPeriod).toBe(1065.74)
      expect(result.dueToManagerPeriod).toBeCloseTo(2331.96)
      expect(result.accommodationRevenue.ownerPeriod).toBe(1195.74)
      expect(result.expenses.costToOwnerPeriod).toBe(200)
      expect(result.expenses.totalAmount).toBe(250)
      expect(result.expenses.reimbursedAmount).toBe(50)
      expect(result.expenses.unpaidAmount).toBe(200)
      expect(result.discounts).toBe(0)
      expect(result.taxes).toBe(612.7)
      expect(result.grossRevenue).toBe(3397.7)
      expect(result.netRevenue).toBe(2785)

      const reservation = result.accommodationRevenue.reservations[0]
      expect(reservation.numberOfNights).toBe(7)
      expect(reservation.channel).toBe('Direct')
      expect(reservation.numGuests).toBe(2)
      expect(reservation.checkIn).toEqual(new Date('2023-09-05'))
      expect(reservation.checkOut).toEqual(new Date('2023-09-12'))

      expect(result.guestFeeRevenue.paidByGuest).toBe(219.6)
      expect(result.guestFeeRevenue.netRevenue.amount).toBe(180)
      expect(result.guestFeeRevenue.netRevenue.managerShare).toBeCloseTo(0.61)
      expect(result.guestFeeRevenue.netRevenue.managerAmount).toBe(110)
      expect(result.guestFeeRevenue.netRevenue.ownerAmount).toBe(70)

      expect(result.guestFeeRevenue.items.length).toBe(2)
      expect(result.guestFeeRevenue.items[0].netRevenue.managerShare).toBe(0.5)
      expect(result.guestFeeRevenue.items[1].netRevenue.managerShare).toBe(0.75)

      expect(result.expenses.items[0].id).toBe('clkjzx2rp0028vzbpk160fiip')
      expect(result.expenses.items[0].amount).toBe(150)
      expect(result.expenses.items[0].date).toEqual(new Date('2023-09-01'))
      expect(result.expenses.items[0].vendor).toBe('Mario Bros Plumbing')
      expect(result.expenses.items[0].description).toBe(
        'Water heater replacement'
      )
      expect(result.expenses.items[0].listingId).toBe(
        'clkjrj6e40026vznijpzlr5a8'
      )
      expect(result.expenses.items[0].listingName).toBe('Sanctum sanctorum')
      expect(result.expenses.items[0].ownerName).toBe('Stephen Strange')
      expect(result.expenses.items[0].ownerPaidAmount).toBe(50)
      expect(result.expenses.items[0].ownerChargedAmount).toBe(150)
      expect(result.expenses.items[0].ownerUnpaidAmount).toBe(100)

      expect(result.expenses.items[1].id).toBe('clkjzy95b0029vzbpnfudd17h')
      expect(result.expenses.items[1].amount).toBe(100)
      expect(result.expenses.items[1].date).toEqual(new Date('2023-09-02'))
      expect(result.expenses.items[1].vendor).toBe('Property Vine')
      expect(result.expenses.items[1].description).toBe(
        'Cleaning fee - owner stay'
      )
      expect(result.expenses.items[1].listingId).toBe(
        'clkjrj6e40026vznijpzlr5a8'
      )
      expect(result.expenses.items[1].listingName).toBe('Sanctum sanctorum')
      expect(result.expenses.items[1].ownerName).toBe('Stephen Strange')
      expect(result.expenses.items[1].ownerPaidAmount).toBe(0)
      expect(result.expenses.items[1].ownerChargedAmount).toBe(100)
      expect(result.expenses.items[1].ownerUnpaidAmount).toBe(100)
    })

    it('gets the correct values for co host statements', () => {
      input.isCoHost = true

      const ownerStatement = new OwnerStatement(input)
      const result = ownerStatement.build()

      expect(result.isCoHost).toBe(true)
      expect(result.listingId).toBe('clkjrj6e40026vznijpzlr5a8')
      expect(result.listingName).toBe('Sanctum sanctorum')
      expect(result.month).toBe(9)
      expect(result.year).toBe(2023)
      expect(result.dueToOwnerPeriod).toBe(1065.74)
      expect(result.dueToManagerPeriod).toBeCloseTo(2331.96)
      expect(result.accommodationRevenue.ownerPeriod).toBe(1195.74)
      expect(result.expenses.costToOwnerPeriod).toBe(200)
      expect(result.expenses.totalAmount).toBe(250)
      expect(result.expenses.reimbursedAmount).toBe(50)
      expect(result.expenses.unpaidAmount).toBe(200)
      expect(result.discounts).toBe(0)
      expect(result.taxes).toBe(612.7)
      expect(result.grossRevenue).toBe(3397.7)
      expect(result.netRevenue).toBe(2785)

      const reservation = result.accommodationRevenue.reservations[0]
      expect(reservation.numberOfNights).toBe(7)
      expect(reservation.channel).toBe('Direct')
      expect(reservation.numGuests).toBe(2)
      expect(reservation.checkIn).toEqual(new Date('2023-09-05'))
      expect(reservation.checkOut).toEqual(new Date('2023-09-12'))

      expect(result.guestFeeRevenue.paidByGuest).toBe(280.6)
      expect(result.guestFeeRevenue.netRevenue.amount).toBe(230)
      expect(result.guestFeeRevenue.netRevenue.managerShare).toBeCloseTo(0.696)
      expect(result.guestFeeRevenue.netRevenue.managerAmount).toBe(160)
      expect(result.guestFeeRevenue.netRevenue.ownerAmount).toBe(70)

      expect(result.guestFeeRevenue.items.length).toBe(3)
      expect(result.guestFeeRevenue.items[0].netRevenue.managerShare).toBe(0.5)
      expect(result.guestFeeRevenue.items[1].netRevenue.managerShare).toBe(0.75)
      expect(result.guestFeeRevenue.items[2].netRevenue.managerShare).toBe(1)

      expect(result.expenses.items[0].id).toBe('clkjzx2rp0028vzbpk160fiip')
      expect(result.expenses.items[0].amount).toBe(150)
      expect(result.expenses.items[0].date).toEqual(new Date('2023-09-01'))
      expect(result.expenses.items[0].vendor).toBe('Mario Bros Plumbing')
      expect(result.expenses.items[0].description).toBe(
        'Water heater replacement'
      )
      expect(result.expenses.items[0].listingId).toBe(
        'clkjrj6e40026vznijpzlr5a8'
      )
      expect(result.expenses.items[0].listingName).toBe('Sanctum sanctorum')
      expect(result.expenses.items[0].ownerName).toBe('Stephen Strange')
      expect(result.expenses.items[0].ownerPaidAmount).toBe(50)
      expect(result.expenses.items[0].ownerChargedAmount).toBe(150)
      expect(result.expenses.items[0].ownerUnpaidAmount).toBe(100)

      expect(result.expenses.items[1].id).toBe('clkjzy95b0029vzbpnfudd17h')
      expect(result.expenses.items[1].amount).toBe(100)
      expect(result.expenses.items[1].date).toEqual(new Date('2023-09-02'))
      expect(result.expenses.items[1].vendor).toBe('Property Vine')
      expect(result.expenses.items[1].description).toBe(
        'Cleaning fee - owner stay'
      )
      expect(result.expenses.items[1].listingId).toBe(
        'clkjrj6e40026vznijpzlr5a8'
      )
      expect(result.expenses.items[1].listingName).toBe('Sanctum sanctorum')
      expect(result.expenses.items[1].ownerName).toBe('Stephen Strange')
      expect(result.expenses.items[1].ownerPaidAmount).toBe(0)
      expect(result.expenses.items[1].ownerChargedAmount).toBe(100)
      expect(result.expenses.items[1].ownerUnpaidAmount).toBe(100)
    })
  })
})
