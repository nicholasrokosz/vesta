import type {
  CalendarSyncRequest,
  CalendarData,
  IntegrationParams,
  Listing,
  ReservationSyncRequest,
} from 'server/integrations/pricelabs/types'
import PriceLabsApi from 'server/integrations/pricelabs/api'

async function configureIntegration(data: IntegrationParams) {
  const priceLabsService = new PriceLabsApi()
  return await priceLabsService.integration(data)
}

const user_token = process.env.PRICELABS_USER_EMAIL ?? ''

const integrationData = {
  sync_url: 'https://dashboard.getconvoy.io/ingest/nbhAGQ95HMNHxBcK',
  // sync_url: 'https://app.getvesta.io/api/webhooks/pricelabs/sync',
  calendar_trigger_url:
    'https://dashboard.getconvoy.io/ingest/12AkheYXiZtMxLQ2',
  // calendar_trigger_url: 'https://app.getvesta.io/api/webhooks/pricelabs/calendar',
  hook_url: 'https://dashboard.getconvoy.io/ingest/c1cDD1ZH2nJbRTn1',
  // hook_url: 'https://app.getvesta.io/api/webhooks/pricelabs/notification',
  regenerate_token: false,
  features: {
    min_stay: true,
    check_in: false,
    check_out: false,
    monthly_weekly_discounts: false,
    enforce_weekly_pms: false,
    extra_person_fee: false,
    los_pricing: false,
  },
}

async function syncListings(listings: Listing[]) {
  const priceLabsService = new PriceLabsApi()
  return await priceLabsService.listingsSync(listings)
}

const listingNumber = '123456789'

const listings: Listing[] = [
  {
    listing_id: listingNumber,
    user_token: user_token,
    location: {
      latitude: 37.7749,
      longitude: 122.4194,
      city: 'San Francisco',
      country: 'USA',
    },
    name: `Vesta Test Listing #${listingNumber}`,
    status: 'available',
    amenities: ['wifi', 'pool'],
  },
]

async function syncCalendar(calendars: CalendarSyncRequest[]) {
  const priceLabsService = new PriceLabsApi()
  return await priceLabsService.calendarSync(calendars)
}

function getCalendarData() {
  const calendarData: CalendarData[] = []
  for (let i = 0; i < 365; i++) {
    const date = new Date()
    date.setDate(date.getDate() + i)
    const dateString = date.toISOString().split('T')[0]
    calendarData.push({
      date: dateString,
      price: 100,
      available_units: 1,
    })
  }
  return calendarData
}

const calendarData = getCalendarData()

const calendars = [
  {
    listing_id: listingNumber,
    currency: 'USD',
    data: calendarData,
  },
]

async function syncReservations(reservations: ReservationSyncRequest[]) {
  const priceLabsService = new PriceLabsApi()
  return await priceLabsService.reservationsSync(reservations)
}

const randomReservationNumber = Math.floor(Math.random() * 1000000)

const reservations: ReservationSyncRequest[] = [
  {
    listing_id: listingNumber,
    data: [
      {
        reservation_id: randomReservationNumber.toString(),
        cancel_time: '2023-09-01T22::00Z',
        start_date: '2023-09-03T12:00:00Z',
        end_date: '2023-09-05T12:00:00Z',
        booked_time: '2023-07-25T20:00:00Z',
        total_days: 2,
        total_cost: 100,
        total_fees: 10,
        total_taxes: 10,
        currency: 'USD',
        status: 'booked',
      },
    ],
  },
]

async function getPrices(listing_id: string) {
  const priceLabsService = new PriceLabsApi()
  return await priceLabsService.getPrices(listing_id)
}

const main = async () => {
  console.log(
    `Sending Integration Request with data: ${JSON.stringify(integrationData)}`
  )

  await configureIntegration(integrationData)
    .then((response) => {
      console.log(`Request sent successfully ${JSON.stringify(response)}`)
    })
    .catch((e) => {
      const error = e as Error
      console.log(`Error sending request ${error.message}`)
    })

  console.log(
    `Sending Listings Sync Request with data: ${JSON.stringify(listings)}`
  )
  await syncListings(listings)
    .then((response) => {
      console.log(`Request sent successfully ${JSON.stringify(response)}`)
    })
    .catch((e) => {
      const error = e as Error
      console.log(`Error sending request ${error.message}`)
    })

  console.log(
    `Sending Calendar Sync Request with data: ${JSON.stringify(calendars)}`
  )

  await syncCalendar(calendars)
    .then((response) => {
      console.log(`Request sent successfully ${JSON.stringify(response)}`)
    })
    .catch((e) => {
      const error = e as Error
      console.log(`Error sending request ${error.message}`)
    })

  console.log(
    `Sending Reservations Sync Request with data: ${JSON.stringify(
      reservations
    )}`
  )

  await syncReservations(reservations)
    .then((response) => {
      console.log(`Request sent successfully ${JSON.stringify(response)}`)
    })
    .catch((e) => {
      const error = e as Error
      console.log(`Error sending request ${error.message}`)
    })

  await getPrices(listingNumber)
    .then(() => {
      console.log(`Request sent succesfully`)
    })
    .catch((e) => {
      const error = e as Error
      console.log(`Error sending request ${error.message}`)
    })
}

void main()
