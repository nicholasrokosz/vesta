import type {
  CalendarEvent,
  Content,
  Fee,
  Listing,
  Reservation,
  Guest,
  User,
} from '@prisma/client'
import { MessageTagsBuilder } from './messageTags'
import { DateTime } from 'luxon'

describe('MessageTagsBuilder,appendReservation', () => {
  const reservation: Reservation = {
    id: 'my-reservation',
    createdAt: new Date(),
    updatedAt: new Date(),
    calendarEventId: 'my-calendar-event',
    channel: 'Airbnb',
    bpReservationId: '',
    adults: 2,
    children: 3,
    pets: 0,
    status: 'CONFIRMED',
    confirmationCode: '',
    guestId: 'my-guest',
  }

  it('appends the reservation information', () => {
    const builder = new MessageTagsBuilder().appendReservation(reservation)

    expect(builder.getTags()).toEqual({
      total_num_guests: '5',
      num_adults: '2',
      num_children: '3',
      channel_name: 'Airbnb',
    })
  })
})

describe('MessageTagsBuilder,appendGuest', () => {
  const guest: Guest = {
    id: 'my-reservation',
    name: 'Rando Calrissian',
    email: 'rando@calrissian.com',
    phone: '+13128675309',
    createdAt: new Date(),
    updatedAt: new Date(),
    organizationId: 'my-org',
  }

  it('appends the guest information', () => {
    const builder = new MessageTagsBuilder().appendGuest(guest)

    expect(builder.getTags()).toEqual({
      guest_name: 'Rando',
      guest_full_name: 'Rando Calrissian',
    })
  })
})

describe('MessageTagsBuilder.appendCalendarEvent', () => {
  const zone = 'US/Hawaii'
  const now = DateTime.local({ zone: zone })

  const calendarEvent: CalendarEvent = {
    id: 'my-calendar-event',
    createdAt: new Date(),
    updatedAt: new Date(),
    type: 'Reservation',
    listingId: 'my-listing-id',
    fromDate: now
      .plus({ days: 2 })
      .set({ hour: 14, minute: 0, second: 0 })
      .toJSDate(),
    toDate: now
      .plus({ days: 3 })
      .set({ hour: 11, minute: 0, second: 0 })
      .toJSDate(),
    notes: null,
    bookedOn: null,
  }

  it('appends the checkin and checkout times', () => {
    const builder = new MessageTagsBuilder().appendCalendarEvent(
      calendarEvent,
      zone
    )

    const timeZone = DateTime.local().setZone(zone).toFormat('ZZZZ')

    expect(builder.getTags()).toEqual({
      check_in_time: `2:00 PM ${timeZone}`,
      checkout_time: `11:00 AM ${timeZone}`,
    })
  })
})

describe('MessageTagsBuilder.appendListing', () => {
  const listing: Listing = {
    id: '',
    createdAt: new Date(),
    updatedAt: new Date(),
    name: 'My listing',
    unitType: 'BoutiqueHotel',
    beds: 3,
    baths: 2,
    guests: 15,
    line1: '123 Sesame Street',
    line2: null,
    city: 'New York',
    state: 'NY',
    zip: '10001',
    country: 'US',
    latitude: 40.7484,
    longitude: -73.9857,
    timeZone: 'US/Eastern',
    organizationId: 'some-org',
    propertyManagerId: 'some-pm',
    propertyOwnerId: null,
    wifiName: 'vesta4eva',
    wifiPassword: 'gosox',
    notes: 'This is a note',
    bpProductId: null,
    doorCode: '1234',
    url: 'http://www.google.com',
    basePrice: 100,
    airbnbRemitsTaxes: false,
    iCalKey: 'some-key',
  }

  it('appends the listing information', () => {
    const builder = new MessageTagsBuilder().appendListing(listing)

    expect(builder.getTags()).toEqual({
      listing_address: '123 Sesame Street, New York, NY 10001',
      listing_city: 'New York',
      listing_num_beds: '3',
      listing_num_baths: '2',
      listing_unit_type: 'Boutique hotel',
      listing_wifi_name: 'vesta4eva',
      listing_wifi_password: 'gosox',
      listing_door_code: '1234',
      listing_url: 'http://www.google.com',
    })
  })
})

describe('MessageTagsBuilder.appendContent', () => {
  const content: Content = {
    id: '',
    listingId: '',
    photos: [],
    title: 'Pristine Brownstone in Brooklyn',
    aiInfo: 'The keycode is 1234',
    description: '',
  }

  it('appends the checkin and checkout times', () => {
    const builder = new MessageTagsBuilder().appendListingContent(content)

    expect(builder.getTags()).toEqual({
      listing_title: 'Pristine Brownstone in Brooklyn',
    })
  })
})

describe('MessageTagsBuilder.appendContent', () => {
  const user: User = {
    id: '',
    name: 'Jebediah Springfield',
    organizationId: null,
    email: 'pm@properties.com',
    emailVerified: null,
    image: null,
    globalRole: 'SUPERADMIN',
    organizationRole: null,
    phone: '+15558765309',
    ownerEntity: null,
  }

  it('appends the checkin and checkout times', () => {
    const builder = new MessageTagsBuilder().appendPropertyManager(user)

    expect(builder.getTags()).toEqual({
      property_manager_name: 'Jebediah',
      property_manager_full_name: 'Jebediah Springfield',
      property_manager_email: 'pm@properties.com',
      property_manager_phone: '+1 555 876 5309',
    })
  })

  const cleaningFee: Fee = {
    id: 'cleaning-fee',
    listingId: 'listing-id',
    name: 'Cleaning Fee',
    value: 350,
    unit: 'PerStay',
    taxable: false,
    type: 'CleaningFee',
    share: 0,
  }

  it('appends the cleaning fee', () => {
    const builder = new MessageTagsBuilder().appendCleaningFee([cleaningFee])

    expect(builder.getTags()).toEqual({
      cleaning_fee: '350',
    })
  })
})
