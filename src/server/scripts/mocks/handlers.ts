import { DateTime } from 'luxon'
import { http, HttpResponse } from 'msw'
import DateString from 'types/dateString'
const bookingPalUrl = process.env.BOOKING_PAL_BASE_URI || ''
const now = DateTime.local()

// Define request handlers and response resolvers for MSW (mock server) here
// For all request handlers, NEVER include query params
// For more information, see https://mswjs.io/docs/basics/mocking-responses
export const handlers = [
  // Sentry
  http.post(`*.ingest.sentry.io/api/*`, () => {
    return HttpResponse.json({})
  }),

  // Login for token
  http.get(`${bookingPalUrl}/authc/login*`, () => {
    return HttpResponse.json({
      message: '',
      errorMessage: [],
      code: '',
      token: 'cf75d72d303b9041/d32602a8-7a98-4e16-846e-1b7a8fa42765',
      partyId: 8811481,
      organizationId: 879374209,
      name: 'Property Vine',
      currency: 'USD',
      supplierId: 8811481,
      is_error: false,
    })
  }),

  // White House
  http.get(`${bookingPalUrl}/reservation/1237790691`, () => {
    return HttpResponse.json({
      message: '',
      errorMessage: [],
      code: '',
      data: [
        {
          reservationId: '401953832',
          productId: '1237790691',
          supplierId: '8811481',
          supplierResDateValidation: true,
          agentName: 'Vrbo',
          channelName: 'Vrbo',
          customerName: 'Madison, Happy',
          // Should not import, date is in the past
          fromDate: DateString.fromDate(
            now
              .minus({ days: 12 })
              .set({ hour: 15, minute: 0, second: 0 })
              .toJSDate()
          ).toString(),
          toDate: DateString.fromDate(
            now
              .minus({ days: 5 })
              .set({ hour: 15, minute: 0, second: 0 })
              .toJSDate()
          ).toString(),
          adult: 1,
          child: 0,
          email: 'happymadison@gmail.com',
          agencyRate: 0.0,
          total: 4759.76,
          extra: 0.0,
          fees: [],
          taxes: [],
          confirmationId: '75fb5335-c914-4465-bbd4-2e9f71002f84',
          newState: 'Confirmed',
          commission: {
            channelCommission: 0.0,
            commission: 0.0,
          },
          rate: {
            originalRackRate: 3547.95,
            netRate: 0.0,
            newPublishedRackRate: 0.0,
          },
          uniqueKey: 'f701cgg97f558c04',
        },
        {
          reservationId: '402957832',
          productId: '1237790691',
          supplierId: '8811481',
          supplierResDateValidation: true,
          agentName: 'Vrbo',
          channelName: 'Vrbo',
          customerName: 'Costanza, George',
          fromDate: DateString.fromDate(
            now
              .plus({ days: 45 })
              .set({ hour: 15, minute: 0, second: 0 })
              .toJSDate()
          ).toString(),
          toDate: DateString.fromDate(
            now
              .plus({ days: 52 })
              .set({ hour: 15, minute: 0, second: 0 })
              .toJSDate()
          ).toString(),
          adult: 3,
          child: 5,
          email: 'gcostanza@gmail.com',
          agencyRate: 0.0,
          total: 4759.76,
          extra: 0.0,
          fees: [],
          taxes: [],
          confirmationId: '75fb5335-c914-4465-bbd4-2e9f71002f84',
          newState: 'Confirmed',
          commission: {
            channelCommission: 0.0,
            commission: 0.0,
          },
          rate: {
            originalRackRate: 3547.95,
            netRate: 0.0,
            newPublishedRackRate: 0.0,
          },
          uniqueKey: 'f701cgg97f558c04',
        },
        {
          reservationId: '401953839',
          productId: '1237790691',
          supplierId: '8811481',
          agentName: 'Airbnb',
          channelName: 'Airbnb',
          customerName: 'Sam, Wilson',
          fromDate: DateString.fromDate(
            now
              .plus({ days: 5 })
              .set({ hour: 15, minute: 0, second: 0 })
              .toJSDate()
          ).toString(),
          toDate: DateString.fromDate(
            now
              .plus({ days: 8 })
              .set({ hour: 10, minute: 0, second: 0 })
              .toJSDate()
          ).toString(),
          adult: 0,
          child: 0,
          email: 'support@airbnb.com',
          agencyRate: 0.0,
          total: 0.0,
          extra: 0.0,
          fees: [],
          taxes: [],
          // Should match on confirmation code, no immport
          confirmationId: 'b6437967-1ae0-410b-9fa9-2ed33c810f2a',
          newState: 'Confirmed',
          commission: {
            channelCommission: 0.0,
            commission: 0.0,
          },
          rate: {
            originalRackRate: 0.0,
            netRate: 0.0,
            newPublishedRackRate: 0.0,
          },
          uniqueKey: 'f701cgg97f558c04',
        },
        {
          reservationId: '400923900',
          productId: '1237790691',
          supplierId: '8811481',
          supplierResDateValidation: true,
          agentName: 'AirBnB',
          channelName: 'AirBnB',
          customerName: 'John, Doe',
          fromDate: DateString.fromDate(
            now
              .plus({ days: 100 })
              .set({ hour: 15, minute: 0, second: 0 })
              .toJSDate()
          ).toString(),
          toDate: DateString.fromDate(
            now
              .plus({ days: 101 })
              .set({ hour: 10, minute: 0, second: 0 })
              .toJSDate()
          ).toString(),
          adult: 4,
          child: 0,
          email: 'support@airbnb.com',
          phone: '12035614585',
          notes: 'From Airbnb Notification',
          agencyRate: 2346.5,
          total: 2470.0,
          extra: 0.0,
          fees: [
            {
              id: '43723823',
              name: 'Cleaning fee',
              value: 250.0,
            },
          ],
          taxes: [],
          confirmationId: 'HMRPP2NJTS',
          // Should not import, status is Cancelled
          newState: 'Cancelled',
          commission: {
            channelCommission: 385.5,
            commission: 0.0,
          },
          rate: {
            originalRackRate: 1878.0,
            netRate: 1834.5,
            newPublishedRackRate: 2220.0,
          },
          uniqueKey: 'f701cgg97f558c04',
        },
      ],
      is_error: false,
    })
  }),

  // the Logan
  http.get(`${bookingPalUrl}/reservation/1237790826`, () => {
    return HttpResponse.json({
      message: '',
      errorMessage: [],
      code: '',
      data: [
        {
          reservationId: '299461814',
          productId: '1235503114',
          supplierId: '8810841',
          agentName: 'AirBnB',
          channelName: 'AirBnB',
          customerName: 'Justine, Newman',
          fromDate: DateString.fromDate(
            now
              .plus({ days: 100 })
              .set({ hour: 15, minute: 0, second: 0 })
              .toJSDate()
          ).toString(),
          toDate: DateString.fromDate(
            now
              .plus({ days: 101 })
              .set({ hour: 10, minute: 0, second: 0 })
              .toJSDate()
          ).toString(),
          adult: 2,
          child: 0,
          email: 'support@airbnb.com',
          phone: '15106105704',
          notes: 'From Airbnb Notification',
          agencyRate: 0.0,
          total: 6306.0,
          extra: 225.0,
          fees: [
            {
              id: '43080486',
              name: 'Cleaning fee',
              value: 225.0,
            },
          ],
          taxes: [],
          confirmationId: 'HMWQ3SJH9T',
          newState: 'Provisional',
          commission: {
            channelCommission: 143.55,
            commission: 0.0,
          },
          rate: {
            originalRackRate: 6081.0,
            netRate: 6081.0,
            newPublishedRackRate: 6081.0,
          },
          uniqueKey: 'f701cff97f558c04',
        },
        {
          reservationId: '300259440',
          productId: '1235503114',
          supplierId: '8810841',
          agentName: 'AirBnB',
          channelName: 'AirBnB',
          customerName: 'Marissa, McKenzie',
          fromDate: DateString.fromDate(
            now
              .plus({ days: 5 })
              .set({ hour: 15, minute: 0, second: 0 })
              .toJSDate()
          ).toString(),
          toDate: DateString.fromDate(
            now
              .plus({ days: 8 })
              .set({ hour: 15, minute: 0, second: 0 })
              .toJSDate()
          ).toString(),
          adult: 4,
          child: 0,
          email: 'support@airbnb.com',
          phone: '12484449805',
          notes: 'From Airbnb Notification',
          agencyRate: 3971.0,
          total: 4180.0,
          extra: 0.0,
          fees: [],
          taxes: [],
          // Should match on confirmation code, no immport
          confirmationId: '68fb5335-c914-4465-bbd4-2e9f71002f95',
          newState: 'Confirmed',
          commission: {
            channelCommission: 0.0,
            commission: 0.0,
          },
          rate: {
            originalRackRate: 0.0,
            netRate: 0.0,
            newPublishedRackRate: 0.0,
          },
          uniqueKey: 'f701cff97f558c04',
        },
        {
          reservationId: '296501058',
          productId: '1235503114',
          supplierId: '8810841',
          supplierResDateValidation: true,
          agentName: 'AirBnB',
          channelName: 'AirBnB',
          customerName: 'Jack, Skellington',
          fromDate: DateString.fromDate(
            now
              .plus({ days: 30 })
              .set({ hour: 15, minute: 0, second: 0 })
              .toJSDate()
          ).toString(),
          toDate: DateString.fromDate(
            now
              .plus({ days: 32 })
              .set({ hour: 15, minute: 0, second: 0 })
              .toJSDate()
          ).toString(),
          adult: 1,
          child: 0,
          email: 'support@airbnb.com',
          phone: '17326195980',
          notes: 'From Airbnb Notification',
          agencyRate: 2796.8,
          total: 2944.0,
          extra: 0.0,
          fees: [
            {
              id: '43080486',
              name: 'Cleaning fee',
              value: 225.0,
            },
          ],
          taxes: [],
          confirmationId: 'HMYMEZR2FH',
          newState: 'FullyPaid',
          commission: {
            channelCommission: 88.32,
            commission: 0.0,
          },
          rate: {
            originalRackRate: 2718.9,
            netRate: 2630.68,
            newPublishedRackRate: 2719.0,
          },
          uniqueKey: 'f701cff97f558c04',
        },
      ],
      is_error: false,
    })
  }),

  // Wildcard, all listings not found in the above
  http.get(`${bookingPalUrl}/reservation/*`, () => {
    return HttpResponse.json({
      message: '',
      errorMessage: [],
      code: '',
      data: [],
      is_error: false,
    })
  }),
]
