import type { PrismaClient } from '@prisma/client'
import {
  DynamicPricing,
  GlobalRole,
  KeyType,
  MessageUser,
  OrganizationRole,
  ReservationStatus,
  RevenueEntryType,
  UnitType,
} from '@prisma/client'
import { DateTime } from 'luxon'

const now = DateTime.local()

export const PROPERTY_VINE_ORG_NAME = 'Property Vine'

export const seedVine = async (prisma: PrismaClient): Promise<void> => {
  const org = await prisma.organization.create({
    data: {
      name: PROPERTY_VINE_ORG_NAME,
      language: 'en',
      adminName: 'John Doe',
      line1: '374 Vine Street',
      city: 'Oklahoma City',
      state: 'OK',
      zip: '73008',
      country: 'US',
      website: 'https://propertyvine.rentals',
      phone: '+13124567890',
      currency: 'USD',
      directBooking: true,
      bookingPalConnection: {
        create: {
          email: 'property-vine@getvesta.io',
          password: 'badpassword',
          companyId: 879374209,
        },
      },
      startDate: DateTime.fromJSDate(new Date())
        .minus({ months: 1 })
        .toJSDate(),
      priceLabsConnection: {
        create: {
          accountEmail: 'sanjay@getvesta.io',
        },
      },
      logoUrl: 'https://d2hacrehbrvv3h.cloudfront.net/propertyvine.png',
      stripeConnection: {
        create: {
          // Shared Stripe credentials in 1Password for Property Vine test account
          accountId: 'acct_1Nxw1TRCleQ2gcXf',
          detailsSubmitted: true,
        },
      },
    },
  })

  ;[
    ['Jen Stiemke', '63f528216e9e6ada7443f223'],
    ['Nick Rokosz', '63d81d9d038558e5ad45b412'],
    ['Brian Issleb', '63a1ba0318d75cfb75489706'],
    ['Robert Clark', '63b5d35644641e0a186f7af3'],
    ['Sanjay Ginde', '639c85dbcae22d33423c0a44'],
  ].map(async ([name, auth0_id]) => {
    const email = `${name.split(' ')[0].toLowerCase()}@getvesta.io`
    await prisma.user.create({
      data: {
        email: email,
        name: name,
        globalRole: GlobalRole.SUPERADMIN,
        organizationId: org.id,
        organizationRole: OrganizationRole.ADMIN,
        accounts: {
          create: [
            {
              type: 'oauth',
              provider: 'auth0',
              providerAccountId: `auth0|${auth0_id}`,
            },
          ],
        },
      },
    })
  })

  const pm = await prisma.user.create({
    data: {
      email: 'test-users+johnpropertyvine@getvesta.io',
      name: 'John Property Vine',
      phone: '+13124567890',
      globalRole: GlobalRole.CUSTOMER,
      organizationId: org.id,
      organizationRole: OrganizationRole.ADMIN,
      accounts: {
        create: [
          {
            type: 'oauth',
            provider: 'auth0',
            providerAccountId: 'auth0|64077091cff7a41825da0715',
          },
        ],
      },
    },
  })

  const whOwner = await prisma.user.create({
    data: {
      email: 'test-users+georgewashington@getvesta.io',
      name: 'George Washington',
      phone: '+13125678901',
      globalRole: GlobalRole.CUSTOMER,
      organizationId: org.id,
      organizationRole: OrganizationRole.PROPERTY_OWNER,
      accounts: {
        create: [
          {
            type: 'oauth',
            provider: 'auth0',
            providerAccountId: 'auth0|65034c8c6371a502e0227417',
          },
        ],
      },
    },
  })

  await prisma.plaidItem.create({
    data: {
      organizationId: org.id,
      accessToken: 'access-sandbox-66f1a778-d7f1-45ae-92b5-af703d50990e',
      institution: 'Chase',
      institutionId: 'ins_56',
      creatorId: whOwner.id,
      accounts: {
        create: [
          {
            id: 'clncl2yen0005uwpk3nsyblw3',
            plaidId: '74JJe48n3mU83d1nRNgvSabqAdqLJ7IdPyAj7',
            name: 'Plaid Checking',
            mask: '0000',
            type: 'depository',
            subtype: 'checking',
          },
        ],
      },
    },
  })

  // ******************************************************
  // WHITE HOUSE
  // ******************************************************
  const wh = await prisma.listing.create({
    data: {
      organizationId: org.id,
      id: 'clmp78rnx000puwss1g1osn6y',
      name: 'White house',
      unitType: UnitType.House,
      beds: 25,
      baths: 9,
      guests: 120,
      line1: '1600 Pennsylvania Avenue NW',
      city: 'Washington',
      state: 'DC',
      zip: '20500',
      timeZone: 'US/Eastern',
      bpProductId: '1237790691',
      basePrice: 100,
      latitude: 38.8977,
      longitude: -77.0365,

      content: {
        create: {
          photos: ['https://vesta-photos.s3.us-east-2.amazonaws.com/wh.jpg'],
          title: 'Historic place to stay with bowling alley',
          description: 'Great spot',
          bedrooms: {
            createMany: {
              data: [
                {
                  type: 'Bedroom',
                  bathroom: true,
                  beds: ['RMA58'],
                },
                {
                  type: 'Bedroom',
                  bathroom: true,
                  beds: ['RMA86'],
                },
                {
                  type: 'Bedroom',
                  bathroom: true,
                  beds: ['RMA58'],
                },
                {
                  type: 'Bedroom',
                  bathroom: true,
                  beds: ['RMA86'],
                },
                {
                  type: 'Bedroom',
                  bathroom: true,
                  beds: ['RMA58'],
                },
                {
                  type: 'Bedroom',
                  bathroom: true,
                  beds: ['RMA86'],
                },
                {
                  type: 'Bedroom',
                  bathroom: true,
                  beds: ['RMA58'],
                },
                {
                  type: 'Bedroom',
                  bathroom: true,
                  beds: ['RMA86'],
                },
                {
                  type: 'Bedroom',
                  bathroom: true,
                  beds: ['RMA58'],
                },
                {
                  type: 'Bedroom',
                  bathroom: true,
                  beds: ['RMA86'],
                },
                {
                  type: 'Bedroom',
                  bathroom: true,
                  beds: ['RMA58'],
                },
                {
                  type: 'Bedroom',
                  bathroom: true,
                  beds: ['RMA86'],
                },
                {
                  type: 'Bedroom',
                  bathroom: true,
                  beds: ['RMA58'],
                },
                {
                  type: 'Bedroom',
                  bathroom: true,
                  beds: ['RMA86'],
                },
                {
                  type: 'Bedroom',
                  bathroom: true,
                  beds: ['RMA58'],
                },
                {
                  type: 'Bedroom',
                  bathroom: true,
                  beds: ['RMA86'],
                },
                {
                  type: 'Bedroom',
                  bathroom: true,
                  beds: ['RMA58'],
                },
                {
                  type: 'Bedroom',
                  bathroom: true,
                  beds: ['RMA86'],
                },
                {
                  type: 'Bedroom',
                  bathroom: true,
                  beds: ['RMA58'],
                },
                {
                  type: 'Bedroom',
                  bathroom: true,
                  beds: ['RMA86'],
                },
                {
                  type: 'Bedroom',
                  bathroom: true,
                  beds: ['RMA58'],
                },
                {
                  type: 'Bedroom',
                  bathroom: true,
                  beds: ['RMA86'],
                },
                {
                  type: 'Bedroom',
                  bathroom: true,
                  beds: ['RMA58'],
                },
                {
                  type: 'Bedroom',
                  bathroom: true,
                  beds: ['RMA86'],
                },
                {
                  type: 'Bedroom',
                  bathroom: true,
                  beds: ['RMA58'],
                },
              ],
            },
          },
        },
      },
      pricing: {
        create: {
          minimum: 100,
          weekday: 150,
          weekend: 200,
          minStay: 1,
          maxStay: 7,
        },
      },
      availability: {
        create: {
          checkIn: '15:00',
          checkOut: '10:00',
        },
      },
      fees: {
        create: [
          {
            id: 'clk04vdkp000mt2228hqdb5md',
            name: 'Cleaning fee',
            value: 100,
            unit: 'PerStay',
            taxable: true,
            type: 'CleaningFee',
            share: 40,
          },
          {
            id: 'clkhl48ln0027sr21i0yejzu7',
            name: 'A/C surcharge',
            value: 25,
            unit: 'PerStay',
            taxable: false,
            type: 'General',
            share: 75,
          },
          {
            name: 'Resort fee',
            value: 15,
            unit: 'PerDayPerPerson',
            taxable: true,
            type: 'General',
            share: 50,
          },
        ],
      },
      deductions: {
        create: {
          channelFees: true,
          creditCardFees: true,
          discounts: true,
          municipalTaxes: true,
          countyTaxes: true,
          stateTaxes: true,
          otherGuestFees: true,
          pmcShare: 40,
        },
      },
      propertyManagerId: pm.id,
      propertyOwnerId: whOwner.id,
      wifiName: 'White House Wifi',
      wifiPassword: 'g30rg3',
      doorCode: '5678',
      taxRates: { create: { county: 1.4, state: 3, municipal: 2 } },
      keys: {
        createMany: {
          data: [
            {
              id: 'g1fcoT1wh61H4BbMW4F4w',
              keyType: KeyType.iCal,
            },
            {
              id: 'clmtnox110003uppe9rd9ulw2',
              keyType: KeyType.Direct,
            },
          ],
        },
      },
    },
  })

  // starts in 5 days, lasts 3 nights, uses checkin/checkout times from listing
  const guestWilson = await prisma.guest.create({
    data: {
      organizationId: org.id,
      name: 'Sam Wilson',
      phone: '+19876543210',
    },
  })

  await prisma.calendarEvent.create({
    data: {
      listingId: wh.id,
      type: 'Reservation',
      fromDate: now
        .plus({ days: 5 })
        .set({ hour: 15, minute: 0, second: 0 })
        .toJSDate(),
      toDate: now
        .plus({ days: 8 })
        .set({ hour: 10, minute: 0, second: 0 })
        .toJSDate(),
      reservation: {
        create: {
          adults: 3,
          children: 0,
          status: ReservationStatus.PROVISIONAL,
          confirmationCode: 'b6437967-1ae0-410b-9fa9-2ed33c810f2a',
          channel: 'Airbnb',
          guestId: guestWilson.id,
        },
      },
    },
  })
  await prisma.messageThread.create({
    data: {
      channel: 'Airbnb',
      dateFrom: now.plus({ days: 5 }).toISODate(),
      dateTo: now.plus({ days: 8 }).toISODate(),
      listing: {
        connect: {
          id: wh.id,
        },
      },
      guest: {
        connect: { id: guestWilson.id },
      },
      messages: {
        createMany: {
          data: [
            {
              timestamp: new Date('3/11/2023 2:30:00 PM'),
              message: 'What are some fun things to do during our stay?',
              user: MessageUser.GUEST,
            },
            {
              timestamp: new Date('3/11/2023 2:31:00 PM'),
              message: "I hear there's a bowling lane.",
              user: MessageUser.GUEST,
            },
            {
              timestamp: new Date('3/11/2023 2:32:00 PM'),
              message: 'There is indeed a bowling lane!',
              user: MessageUser.PROPERTY_MANAGER,
            },
            {
              timestamp: new Date('3/11/2023 2:33:00 PM'),
              message:
                'As for other activities, see https://www.theinfatuation.com/washington-dc for recommendations.',
              user: MessageUser.PROPERTY_MANAGER,
            },
            {
              timestamp: new Date('3/11/2023 9:30:00 PM'),
              message:
                'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
              user: MessageUser.GUEST,
            },
            {
              timestamp: new Date('3/11/2023 9:31:00 PM'),
              message:
                'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
              user: MessageUser.PROPERTY_MANAGER,
            },
            {
              timestamp: new Date('3/11/2023 9:32:00 PM'),
              message:
                'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
              user: MessageUser.GUEST,
            },
            {
              timestamp: new Date('3/11/2023 9:33:00 PM'),
              message:
                'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
              user: MessageUser.PROPERTY_MANAGER,
            },
            {
              timestamp: new Date('3/11/2023 9:34:00 PM'),
              message:
                'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
              user: MessageUser.GUEST,
            },
            {
              timestamp: new Date('3/11/2023 9:35:00 PM'),
              message:
                'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
              user: MessageUser.PROPERTY_MANAGER,
            },
            {
              timestamp: new Date('3/11/2023 9:36:00 PM'),
              message:
                'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
              user: MessageUser.PROPERTY_MANAGER,
            },
            {
              timestamp: new Date('3/12/2023 4:20:00 PM'),
              message: 'Hello, would it be possible to check in early?',
              user: MessageUser.GUEST,
            },
            {
              timestamp: new Date('3/12/2023 4:47:00 PM'),
              message:
                'Yes, sir. Please let us know what time will you be arriving so that we can arrange for cleaning.',
              user: MessageUser.PROPERTY_MANAGER,
            },
            {
              timestamp: new Date('3/12/2023 6:30:00 PM'),
              message: 'I will be arriving at 11am',
              user: MessageUser.GUEST,
            },
          ],
        },
      },
    },
  })

  // starts in 8 days, lasts 6 nights, uses checkin/checkout times from listing
  const guestJeff = await prisma.guest.create({
    data: {
      organizationId: org.id,
      name: 'Jeff Parker',
      phone: '+13129997890',
    },
  })

  await prisma.calendarEvent.create({
    data: {
      listingId: wh.id,
      type: 'Reservation',
      fromDate: now
        .plus({ days: 8 })
        .set({ hour: 15, minute: 0, second: 0 })
        .toJSDate(),
      toDate: now
        .plus({ days: 14 })
        .set({ hour: 10, minute: 0, second: 0 })
        .toJSDate(),
      reservation: {
        create: {
          adults: 3,
          children: 0,
          status: ReservationStatus.CANCELLED,
          confirmationCode: 'W019GPQ',
          channel: 'Airbnb',
          guestId: guestJeff.id,
        },
      },
    },
  })

  await prisma.messageThread.create({
    data: {
      channel: 'Airbnb',
      dateFrom: now.plus({ days: 8 }).toISODate(),
      dateTo: now.plus({ days: 14 }).toISODate(),
      listing: {
        connect: {
          id: wh.id,
        },
      },
      guest: {
        connect: { id: guestJeff.id },
      },
      messages: {
        createMany: {
          data: [
            {
              timestamp: new Date('3/11/2023 2:30:00 PM'),
              message: 'Is the property ADA compliant?',
              user: MessageUser.GUEST,
            },
          ],
        },
      },
    },
  })

  await prisma.calendarEvent.create({
    data: {
      listingId: wh.id,
      type: 'Reservation',
      fromDate: now
        .minus({ days: 4 })
        .set({ hour: 15, minute: 0, second: 0 })
        .toJSDate(),
      toDate: now
        .plus({ days: 6 })
        .set({ hour: 10, minute: 0, second: 0 })
        .toJSDate(),
      reservation: {
        create: {
          adults: 3,
          children: 0,
          status: ReservationStatus.CONFIRMED,
          confirmationCode: 'W017NBC',
          channel: 'Airbnb',
          guest: {
            create: {
              organizationId: org.id,
              name: 'Josh Goldberg',
              email: 'jg@gmail.com',
              phone: '+13123337890',
            },
          },
        },
      },
    },
  })

  await prisma.calendarEvent.create({
    data: {
      listingId: wh.id,
      type: 'Reservation',
      fromDate: now
        .plus({ days: 2 })
        .set({ hour: 15, minute: 0, second: 0 })
        .toJSDate(),
      toDate: now
        .plus({ days: 5 })
        .set({ hour: 10, minute: 0, second: 0 })
        .toJSDate(),
      reservation: {
        create: {
          adults: 3,
          children: 0,
          status: ReservationStatus.CONFIRMED,
          confirmationCode: 'W018L5N',
          channel: 'Airbnb',
          guest: {
            create: {
              organizationId: org.id,
              name: 'Murphy Brown',
              email: 'murph@gmail.com',
              phone: '+13122227890',
            },
          },
        },
      },
    },
  })

  // Started last month
  await prisma.calendarEvent.create({
    data: {
      listingId: wh.id,
      type: 'Reservation',
      fromDate: now.minus({ days: 35 }).toJSDate(),
      toDate: now.minus({ days: 31 }).toJSDate(),
      reservation: {
        create: {
          adults: 3,
          children: 0,
          status: ReservationStatus.FULLY_PAID,
          confirmationCode: 'W014JS',
          channel: 'VRBO',
          guest: {
            create: {
              organizationId: org.id,
              name: 'Claude Shannon',
              email: 'info@gmail.com',
            },
          },
        },
      },
    },
  })

  // ******************************************************
  // SANCTUM SANTORUM
  // ******************************************************
  const sanctumOwner = await prisma.user.create({
    data: {
      email: 'test-users+stephenstrange@getvesta.io',
      name: 'Stephen Strange',
      phone: '+13456789012',
      globalRole: GlobalRole.CUSTOMER,
      organizationId: org.id,
      organizationRole: OrganizationRole.PROPERTY_OWNER,
    },
  })

  const sanctum = await prisma.listing.create({
    data: {
      id: 'cllnzonl2002vrx2qdcod0636',
      organizationId: org.id,
      name: 'Sanctum sanctorum',
      unitType: UnitType.Apartment,
      beds: 2,
      baths: 1,
      guests: 2,
      line1: '177a Bleecker St',
      city: 'New York',
      state: 'NY',
      zip: '10012',
      timeZone: 'US/Eastern',
      basePrice: 100,
      content: {
        create: {
          photos: [
            'https://vesta-photos.s3.us-east-2.amazonaws.com/bleeker.png',
          ],
          title: 'Magical getaway spot',
          description: 'Doctor on site.',
          bedrooms: {
            createMany: {
              data: [
                {
                  type: 'Bedroom',
                  bathroom: true,
                  beds: ['RMA58'],
                },
                {
                  type: 'Bedroom',
                  bathroom: true,
                  beds: ['RMA86'],
                },
              ],
            },
          },
        },
      },
      pricing: {
        create: {
          minimum: 365,
          weekday: 365,
          weekend: 365,
          minStay: 1,
          maxStay: 7,
        },
      },
      availability: {
        create: {
          checkIn: '14:00',
          checkOut: '11:00',
        },
      },
      fees: {
        create: [
          {
            name: 'Cleaning fee',
            value: 100,
            unit: 'PerStay',
            taxable: true,
            type: 'CleaningFee',
            share: 50,
          },
          {
            name: 'Pet fee',
            value: 80,
            unit: 'PerStay',
            taxable: true,
            type: 'CleaningFee',
            share: 75,
          },
          {
            name: 'Internet',
            value: 50,
            unit: 'PerStay',
            taxable: true,
            type: 'General',
            share: 100,
          },
          {
            name: 'Deposit',
            value: 132,
            unit: 'PerStay',
            taxable: false,
            type: 'Deposit',
            share: 40,
          },
        ],
      },
      deductions: {
        create: {
          channelFees: true,
          creditCardFees: true,
          discounts: true,
          municipalTaxes: true,
          countyTaxes: true,
          stateTaxes: true,
          otherGuestFees: true,
          pmcShare: 25,
        },
      },
      propertyManagerId: pm.id,
      propertyOwnerId: sanctumOwner.id,
      wifiName: 'Sanctum Wifi',
      wifiPassword: 'm4rv3l',
      doorCode: '9876',
      taxRates: { create: { county: 4, state: 10, municipal: 8 } },
      keys: {
        createMany: {
          data: [
            {
              id: 'cln0ps779000cuwgoxlkd1igi',
              keyType: KeyType.Direct,
            },
          ],
        },
      },
    },
  })

  // Starts in 2 days, lasts 1 night, uses checkin/checkout times from listing
  const guestSteve = await prisma.guest.create({
    data: {
      organizationId: org.id,
      name: 'Steve Rogers',
      email: 'cap@gmail.com',
    },
  })

  const _sanctumEvent = await prisma.calendarEvent.create({
    data: {
      listingId: sanctum.id,
      type: 'Reservation',
      fromDate: now
        .plus({ days: 2 })
        .set({ hour: 14, minute: 0, second: 0 })
        .toJSDate(),
      toDate: now
        .plus({ days: 4 })
        .set({ hour: 11, minute: 0, second: 0 })
        .toJSDate(),
      reservation: {
        create: {
          adults: 1,
          children: 0,
          status: ReservationStatus.CONFIRMED,
          confirmationCode: 'W012KG',
          channel: 'VRBO',
          guest: {
            connect: { id: guestSteve.id },
          },
        },
      },
    },
    include: { reservation: true },
  })

  await prisma.messageThread.create({
    data: {
      channel: 'VRBO',
      dateFrom: now.plus({ days: 2 }).toISODate(),
      dateTo: now.plus({ days: 4 }).toISODate(),
      listing: {
        connect: {
          id: sanctum.id,
        },
      },
      guest: {
        connect: { id: guestSteve.id },
      },
      messages: {
        createMany: {
          data: [
            {
              timestamp: new Date('2/28/2023 12:01:00 PM'),
              message: 'Does this place have a pool?',
              user: MessageUser.GUEST,
            },
            {
              timestamp: new Date('2/28/2023 12:45:00 PM'),
              message:
                'So sorry, we do not have a pool. There is a public pool 2 blocks away.',
              user: MessageUser.PROPERTY_MANAGER,
            },
          ],
        },
      },
    },
  })

  // cancelled event 4 days ago for 3 nights
  const guestGeorgio = await prisma.guest.create({
    data: {
      organizationId: org.id,
      name: 'Georgio Papadopoulos',
      email: 'pappyg@gmail.com',
      phone: '+13125557890',
    },
  })

  await prisma.calendarEvent.create({
    data: {
      listingId: sanctum.id,
      type: 'Reservation',
      fromDate: now
        .minus({ days: 4 })
        .set({ hour: 14, minute: 0, second: 0 })
        .toJSDate(),
      toDate: now
        .minus({ days: 1 })
        .set({ hour: 11, minute: 0, second: 0 })
        .toJSDate(),
      reservation: {
        create: {
          adults: 1,
          children: 0,
          status: ReservationStatus.CANCELLED,
          confirmationCode: 'W013KL',
          channel: 'Direct',
          guestId: guestGeorgio.id,
        },
      },
    },
  })

  await prisma.messageThread.create({
    data: {
      channel: 'Direct',
      dateFrom: now.minus({ days: 4 }).toISODate(),
      dateTo: now.minus({ days: 1 }).toISODate(),
      listing: {
        connect: {
          id: sanctum.id,
        },
      },
      guest: {
        connect: { id: guestGeorgio.id },
      },
    },
  })

  // confirmed event 2 days ago for 3 nights
  const guestArthur = await prisma.guest.create({
    data: {
      organizationId: org.id,
      name: 'Arthur Dent',
      email: 'art@gmail.com',
      phone: '+ 13125557890',
    },
  })

  await prisma.calendarEvent.create({
    data: {
      listingId: sanctum.id,
      type: 'Reservation',
      fromDate: now
        .minus({ days: 1 })
        .set({ hour: 14, minute: 0, second: 0 })
        .toJSDate(),
      toDate: now
        .plus({ days: 2 })
        .set({ hour: 11, minute: 0, second: 0 })
        .toJSDate(),
      reservation: {
        create: {
          adults: 1,
          children: 0,
          status: ReservationStatus.CONFIRMED,
          channel: 'Direct',
          guest: {
            connect: { id: guestArthur.id },
          },
          revenue: {
            create: {
              pmcShare: 50,
              fees: {
                create: {
                  name: 'Accommodation revenue',
                  unit: 'PerStay',
                  value: 450,
                  taxable: true,
                  pmcShare: 50,
                  type: RevenueEntryType.ACCOMMODATION,
                  deductions: {
                    createMany: {
                      data: [
                        {
                          type: 'TAX',
                          description: 'Municipal tax',
                          value: 68,
                        },
                        { type: 'TAX', description: 'County tax', value: 17 },
                        { type: 'TAX', description: 'State tax', value: 102 },
                      ],
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  })

  await prisma.messageThread.create({
    data: {
      channel: 'Direct',
      dateFrom: now.minus({ days: 1 }).toISODate(),
      dateTo: now.plus({ days: 2 }).toISODate(),
      listing: {
        connect: {
          id: sanctum.id,
        },
      },
      guest: {
        connect: { id: guestArthur.id },
      },
    },
  })

  // confirmed event in 4 days for 4 nights
  const guestVelma = await prisma.guest.create({
    data: {
      organizationId: org.id,
      name: 'Velma Dinkley',
      email: 'velma@gmail.com',
      phone: '+13128867890',
    },
  })

  const reservation = await prisma.reservation.create({
    data: {
      adults: 1,
      children: 0,
      status: ReservationStatus.CONFIRMED,
      channel: 'Direct',
      calendarEvent: {
        create: {
          listingId: sanctum.id,
          type: 'Reservation',
          fromDate: now
            .plus({ days: 4 })
            .set({ hour: 14, minute: 0, second: 0 })
            .toJSDate(),
          toDate: now
            .plus({ days: 11 })
            .set({ hour: 11, minute: 0, second: 0 })
            .toJSDate(),
        },
      },
      guest: {
        connect: { id: guestVelma.id },
      },
      revenue: {
        create: {
          pmcShare: 25,
          // Credit card fee: GBV * .029 + $0.30 = $3,508.14 * .029 + $0.30 = $102.04
        },
      },
    },
    include: {
      revenue: true,
    },
  })

  if (!!reservation.revenue) {
    await prisma.revenueFee.create({
      data: {
        name: 'Accommodation revenue',
        unit: 'PerStay',
        value: 2555,
        taxable: true,
        pmcShare: 25,
        type: RevenueEntryType.ACCOMMODATION,
        revenue: {
          connect: { id: reservation.revenue.id },
        },
        deductions: {
          createMany: {
            data: [
              {
                type: 'TAX',
                description: 'Municipal tax',
                value: 204.4,
              },
              {
                type: 'TAX',
                description: 'County tax',
                value: 102.2,
              },
              {
                type: 'TAX',
                description: 'State tax',
                value: 255.5,
              },
              {
                type: 'CREDIT_CARD',
                description: 'Credit card fees',
                value: 90.67,
              },
            ],
          },
        },
      },
    })

    await prisma.revenueFee.create({
      data: {
        name: 'Cleaning fee',
        unit: 'PerStay',
        value: 100,
        taxable: false,
        pmcShare: 50,
        type: RevenueEntryType.GUEST_FEE,
        revenue: {
          connect: { id: reservation.revenue.id },
        },
        deductions: {
          createMany: {
            data: [
              {
                type: 'CREDIT_CARD',
                description: 'Credit card fees',
                value: 2.91,
              },
            ],
          },
        },
      },
    })

    await prisma.revenueFee.create({
      data: {
        name: 'Pet fee',
        unit: 'PerStay',
        value: 80,
        taxable: false,
        pmcShare: 75,
        type: RevenueEntryType.GUEST_FEE,
        revenue: {
          connect: { id: reservation.revenue.id },
        },
        deductions: {
          createMany: {
            data: [
              {
                type: 'CREDIT_CARD',
                description: 'Credit card fees',
                value: 2.33,
              },
            ],
          },
        },
      },
    })

    await prisma.revenueFee.create({
      data: {
        name: 'Internet',
        unit: 'PerStay',
        value: 50,
        taxable: false,
        pmcShare: 100,
        type: RevenueEntryType.GUEST_FEE,
        revenue: {
          connect: { id: reservation.revenue.id },
        },
        deductions: {
          createMany: {
            data: [
              {
                type: 'CREDIT_CARD',
                description: 'Credit card fees',
                value: 1.45,
              },
            ],
          },
        },
      },
    })

    await prisma.revenueFee.create({
      data: {
        name: 'Daily Newspaper delivery',
        unit: 'PerStay',
        value: 132,
        taxable: true,
        pmcShare: 40,
        type: RevenueEntryType.GUEST_FEE,
        revenue: {
          connect: { id: reservation.revenue.id },
        },
        deductions: {
          createMany: {
            data: [
              { type: 'TAX', description: 'Municipal tax', value: 10.56 },
              { type: 'TAX', description: 'County tax', value: 5.28 },
              { type: 'TAX', description: 'State tax', value: 13.2 },
              {
                type: 'CREDIT_CARD',
                description: 'Credit card fees',
                value: 4.68,
              },
            ],
          },
        },
      },
    })
  }

  await prisma.messageThread.create({
    data: {
      channel: 'Direct',
      dateFrom: now.plus({ days: 4 }).toISODate(),
      dateTo: now.plus({ days: 11 }).toISODate(),
      listing: {
        connect: {
          id: sanctum.id,
        },
      },
      guest: {
        connect: { id: guestVelma.id },
      },
    },
  })

  // confirmed event in 14 days for 3 nights
  const guestMarge = await prisma.guest.create({
    data: {
      organizationId: org.id,
      name: 'Margarie Bouvier',
      email: 'marg@gmail.com',
      phone: '+13124447999',
    },
  })

  await prisma.calendarEvent.create({
    data: {
      listingId: sanctum.id,
      type: 'Reservation',
      fromDate: now
        .plus({ days: 14 })
        .set({ hour: 14, minute: 0, second: 0 })
        .toJSDate(),
      toDate: now
        .plus({ days: 17 })
        .set({ hour: 11, minute: 0, second: 0 })
        .toJSDate(),
      reservation: {
        create: {
          adults: 1,
          children: 0,
          status: ReservationStatus.PROVISIONAL,
          confirmationCode: 'W015KLX',
          channel: 'Airbnb',
          guestId: guestMarge.id,
        },
      },
    },
  })

  await prisma.messageThread.create({
    data: {
      channel: 'Airbnb',
      dateFrom: now.plus({ days: 14 }).toISODate(),
      dateTo: now.plus({ days: 17 }).toISODate(),
      listing: {
        connect: {
          id: sanctum.id,
        },
      },
      guest: {
        connect: { id: guestMarge.id },
      },
    },
  })

  //message thread with no reservation
  await prisma.messageThread.create({
    data: {
      dateFrom: '12/20/2024',
      dateTo: '12/26/2024',
      channel: 'Airbnb',
      listing: {
        connect: {
          id: sanctum.id,
        },
      },
      guest: {
        create: {
          organizationId: org.id,
          name: 'Jack',
        },
      },
      messages: {
        createMany: {
          data: [
            {
              timestamp: new Date('5/18/2023 12:03:00 PM'),
              message: 'Is this too far ahead to book?',
              user: MessageUser.GUEST,
            },
            {
              timestamp: new Date('5/18/2023 12:45:00 PM'),
              message: 'No, go ahead, Christmas is a wonderful time to visit!',
              user: MessageUser.PROPERTY_MANAGER,
            },
          ],
        },
      },
    },
  })

  {
    // Vrbo reservation, with channel commission, taxes, and credit card fees
    const modestoGuest = await prisma.guest.create({
      data: {
        organizationId: org.id,
        name: 'Modesto Herzog',
        email: 'modesto@gmail.com',
        phone: '+9194722937',
      },
    })

    const modestoReservation = await prisma.reservation.create({
      data: {
        id: 'clohnba5a004yupctf4zlwurt',
        adults: 2,
        children: 2,
        status: ReservationStatus.CONFIRMED,
        channel: 'VRBO',
        confirmationCode: 'a5a4ee3c-3e71-436c-8d2f-7304831fcc11',
        calendarEvent: {
          create: {
            listingId: wh.id,
            type: 'Reservation',
            fromDate: now
              .plus({ days: 4 })
              .set({ hour: 14, minute: 0, second: 0 })
              .toJSDate(),
            toDate: now
              .plus({ days: 7 })
              .set({ hour: 11, minute: 0, second: 0 })
              .toJSDate(),
          },
        },
        guest: {
          connect: { id: modestoGuest.id },
        },
        revenue: {
          create: {
            pmcShare: 40,
            // Credit card fee: GBV * .029 + $0.30 = $410.85 * .029 + $0.30 = $12.21
            channelCommission: 30.78,
          },
        },
      },
      include: {
        revenue: true,
      },
    })

    await prisma.revenueFee.create({
      data: {
        name: 'Accommodation revenue',
        unit: 'PerStay',
        value: 263.0,
        taxable: true,
        pmcShare: 40,
        type: RevenueEntryType.ACCOMMODATION,
        revenue: {
          connect: { id: modestoReservation?.revenue?.id },
        },
        deductions: {
          createMany: {
            data: [
              {
                type: 'TAX',
                description: 'Municipal tax',
                value: 5.26,
              },
              {
                type: 'TAX',
                description: 'County tax',
                value: 3.68,
              },
              {
                type: 'TAX',
                description: 'State tax',
                value: 7.89,
              },
              {
                type: 'CREDIT_CARD',
                description: 'Credit card fees',
                value: 8.32,
              },
            ],
          },
        },
      },
    })

    await prisma.revenueFee.create({
      data: {
        name: 'Cleaning fee',
        unit: 'PerStay',
        value: 100,
        taxable: true,
        pmcShare: 40,
        type: RevenueEntryType.GUEST_FEE,
        revenue: {
          connect: { id: modestoReservation?.revenue?.id },
        },
        deductions: {
          createMany: {
            data: [
              { type: 'TAX', description: 'Municipal tax', value: 1.88 },
              { type: 'TAX', description: 'County tax', value: 1.32 },
              { type: 'TAX', description: 'State tax', value: 2.82 },
              {
                type: 'CREDIT_CARD',
                description: 'Credit card fees',
                value: 3.15,
              },
            ],
          },
        },
      },
    })

    await prisma.revenueFee.create({
      data: {
        name: 'A/C surcharge',
        unit: 'PerStay',
        value: 25,
        taxable: false,
        pmcShare: 75,
        type: RevenueEntryType.GUEST_FEE,
        revenue: {
          connect: { id: modestoReservation?.revenue?.id },
        },
        deductions: {
          createMany: {
            data: [
              {
                type: 'CREDIT_CARD',
                description: 'Credit card fees',
                value: 0.74,
              },
            ],
          },
        },
      },
    })

    await prisma.messageThread.create({
      data: {
        channel: 'VRBO',
        dateFrom: now.plus({ days: 4 }).toISODate(),
        dateTo: now.plus({ days: 11 }).toISODate(),
        listing: {
          connect: {
            id: sanctum.id,
          },
        },
        guest: {
          connect: { id: modestoGuest.id },
        },
      },
    })
  }

  // blocked for maintenance
  await prisma.calendarEvent.create({
    data: {
      listingId: sanctum.id,
      type: 'Blocked',
      fromDate: now
        .plus({ days: 12 })
        .set({ hour: 14, minute: 0, second: 0 })
        .toJSDate(),
      toDate: now
        .plus({ days: 14 })
        .set({ hour: 11, minute: 0, second: 0 })
        .toJSDate(),
    },
  })

  // Message templates
  // Canned message
  await prisma.messageTemplate.create({
    data: {
      organizationId: org.id,
      title: 'Wi-fi password',
      body: 'Hi {{guest_name}},\n\nThe WiFi network is "{{listing_wifi_name}}" and the password is "{{listing_wifi_password}}".',
      bodyHtml:
        '<p>Hi <span data-type="messageTag" class="vesta-message-tag" data-id="{{guest_name}}">{{guest_name}}</span>, The WiFi network is "<span data-type="messageTag" class="vesta-message-tag" data-id="{{listing_wifi_name}}">{{listing_wifi_name}}</span>" and the password is "<span data-type="messageTag" class="vesta-message-tag" data-id="{{listing_wifi_password}}">{{listing_wifi_password}}</span>".  </p>',
      listings: {
        connect: [{ id: wh.id }, { id: sanctum.id }],
      },
    },
  })

  const _messageTemplate = await prisma.messageTemplate.create({
    data: {
      organizationId: org.id,
      title: 'Welcome',
      body: 'Hi {{guest_name}}, Welcome to our place!\n\nMy name is {{property_manager_name}}. If you have any questions, please call me at {{property_manager_phone}}.',
      bodyHtml:
        '<p>Hi <span data-type="messageTag" class="vesta-message-tag" data-id="{{guest_name}}">{{guest_name}}</span>, Welcome to our place! My name is <span data-type="messageTag" class="vesta-message-tag" data-id="{{property_manager_full_name}}">{{property_manager_full_name}}</span>. If you have any questions, please call me at <span data-type="messageTag" class="vesta-message-tag" data-id="{{property_manager_phone}}">{{property_manager_phone}}</span> </p>',
      listings: {
        connect: [{ id: wh.id }, { id: sanctum.id }],
      },
      trigger: 'CheckIn',
      triggerRange: 'Immediately',
    },
  })

  await prisma.messageTemplate.create({
    data: {
      organizationId: org.id,
      title: 'Pool Maintenance',
      body: 'Dear {{guest_name}}, \n\nPlease be informed that pool maintenance will be performed tomorrow.\n\n{{property_manager_full_name}}\n{{property_manager_phone}}\n{{property_manager_email}}',
      bodyHtml:
        '<p>Dear <span data-type="messageTag" class="vesta-message-tag" data-id="{{guest_name}}">{{guest_name}}</span>, <br><br>Please be informed that pool maintenance will be performed tomorrow.</p><p></p><p><span data-type="messageTag" class="vesta-message-tag" data-id="{{property_manager_full_name}}">{{property_manager_full_name}}</span><br><span data-type="messageTag" class="vesta-message-tag" data-id="{{property_manager_phone}}">{{property_manager_phone}}</span><br><span data-type="messageTag" class="vesta-message-tag" data-id="{{property_manager_email}}">{{property_manager_email}}</span></p>',
      listings: {
        connect: [{ id: wh.id }, { id: sanctum.id }],
      },
      trigger: 'CheckIn',
      triggerRange: 'Immediately',
    },
  })

  // TODO: Scheduled message
  // await prisma.scheduledMessage.create({
  //   data: {
  //     reservationId: sanctumEvent.reservation?.id ?? '',
  //     messageTemplateId: messageTemplate.id,
  //     scheduledAt: now
  //       .plus({ days: 2 })
  //       .set({ hour: 14, minute: 0, second: 0 })
  //       .toJSDate(),
  //   },
  // })

  // ******************************************************
  // BP Test Property (for certification)
  // ******************************************************
  await prisma.listing.create({
    data: {
      id: 'clgdywk2q000dphkt68zonlmy',
      organizationId: org.id,
      name: 'BP Test Property',
      unitType: UnitType.House,
      beds: 1,
      baths: 1.5,
      guests: 2,
      line1: '1600 Pennsylvania Avenue NW',
      city: 'Washington',
      state: 'DC',
      zip: '20500',
      country: 'US',
      latitude: 38.89,
      longitude: -77.03,
      timeZone: 'US/Eastern',
      basePrice: 100,
      content: {
        create: {
          photos: [
            'https://d3m65jzbgi46ie.cloudfront.net/67648560-aa52-46fc-893b-b1c52d858979.jpg',
            'https://d3m65jzbgi46ie.cloudfront.net/82f335b9-058b-4f46-a161-ba8ccddcfa34.png',
            'https://d3m65jzbgi46ie.cloudfront.net/74a9225d-a7c5-4592-817b-8b8e0cc6f1fb.png',
            'https://d3m65jzbgi46ie.cloudfront.net/8a4be325-a8f6-42cc-a8a6-73a3d963daf3.png',
            'https://d3m65jzbgi46ie.cloudfront.net/f87b97e7-09c5-45bd-a907-1a27312bdac2.png',
            'https://d3m65jzbgi46ie.cloudfront.net/d6047b5b-27b1-4e3e-a321-3bbdb7492647.png',
            'https://d3m65jzbgi46ie.cloudfront.net/62009f40-65c5-426d-8392-60ee63b071fe.png',
          ],
          title: 'BP Test Property',
          description: 'test description',
          bedrooms: {
            createMany: {
              data: [
                {
                  type: 'Bedroom',
                  bathroom: true,
                  beds: ['RMA58'],
                },
              ],
            },
          },
        },
      },
      pricing: {
        create: {
          minimum: 100,
          weekday: 200,
          weekend: 350,
          minStay: 1,
          maxStay: 25,
        },
      },
      availability: {
        create: {
          checkIn: '15:00',
          checkOut: '10:00',
        },
      },
      propertyManagerId: pm.id,
      propertyOwnerId: whOwner.id,
      wifiName: 'White House Wifi',
      wifiPassword: 'g30rg3',
      bpProductId: '1237790288',
      doorCode: '1234',
      keys: {
        createMany: {
          data: [
            {
              id: 'cln0ps77a000muwgoegww5z4j',
              keyType: KeyType.Direct,
            },
          ],
        },
      },
    },
  })

  // Onwer statement for the previous month
  const whOwnerStatement = await prisma.ownerStatement.create({
    data: {
      listingId: wh.id,
      month: now.minus({ month: 1 }).month,
      year: now.minus({ month: 1 }).year,
      locked: true,
    },
  })

  // Expense for last month, attached to locked statement
  const expense = await prisma.expense.create({
    data: {
      date: now.minus({ month: 1 }).toJSDate(),
      amount: 342.24,
      description: 'Leaky pipe',
      vendor: 'Mario Bros Plumbing',
      workOrder: '12345',
      userId: pm.id,
    },
  })

  // Expense for current month, not attached to any statement
  const expense2 = await prisma.expense.create({
    data: {
      date: now.toJSDate(),
      amount: 669.8,
      description: 'AC Repair',
      vendor: 'ABC Heating & Cooling',
      workOrder: '54321',
      userId: pm.id,
    },
  })

  await prisma.listingExpense.create({
    data: {
      listingId: wh.id,
      expenseId: expense.id,
      amount: 171.12,
      amountPaid: 0,
      ownerStatementId: whOwnerStatement.id,
    },
  })

  await prisma.listingExpense.createMany({
    data: [
      {
        listingId: sanctum.id,
        expenseId: expense.id,
        amount: 171.12,
        amountPaid: 0,
      },
      {
        listingId: sanctum.id,
        expenseId: expense2.id,
        amount: 669.8,
        amountPaid: 0,
      },
    ],
  })

  // ******************************************************
  // LOGAN
  // ******************************************************
  const loganOwner = await prisma.user.create({
    data: {
      email: 'murphy-stiemke@getvesta.io',
      name: 'Murphy Stiemke',
      phone: '+13456789013',
      globalRole: GlobalRole.CUSTOMER,
      organizationId: org.id,
      organizationRole: OrganizationRole.PROPERTY_OWNER,
    },
  })

  await prisma.bookingPalConnection.create({
    data: {
      email: 'murphy-stiemke@getvesta.io',
      password: 'badpassword',
      companyId: 879374792,
      ownerId: loganOwner.id,
    },
  })

  const theLogan = await prisma.listing.create({
    data: {
      id: 'cllxs256j005kupo3m8043uvt',
      bpProductId: '1237790826',
      organizationId: org.id,
      name: 'The Logan',
      unitType: UnitType.Apartment,
      beds: 2,
      baths: 2,
      guests: 4,
      line1: '2252 N Milwaukee Ave',
      city: 'Chicago',
      state: 'IL',
      zip: '60647',
      timeZone: 'US/Central',
      latitude: 41.9217486,
      longitude: -87.697635,
      basePrice: 100,
      content: {
        create: {
          photos: [
            'https://d3m65jzbgi46ie.cloudfront.net/d9f76f85-6244-4333-ab5f-39bad392cd2d-md.jpg',
            'https://d3m65jzbgi46ie.cloudfront.net/31db5e3c-5895-4d30-aff0-a191cf0a1056-md.jpg',
            'https://d3m65jzbgi46ie.cloudfront.net/f00fda2e-dc84-4f55-a13f-f0e0f6ef07a3-md.png',
            'https://d3m65jzbgi46ie.cloudfront.net/0bb3d02c-ecfa-484c-b5ca-37e819293553-md.png',
          ],
          title: 'Six o six four heaven',
          description: 'Modern convenience in Logan Square',
          bedrooms: {
            createMany: {
              data: [
                {
                  type: 'Bedroom',
                  bathroom: true,
                  beds: ['RMA58'],
                },
                {
                  type: 'Bedroom',
                  bathroom: true,
                  beds: ['RMA86'],
                },
              ],
            },
          },
        },
      },
      pricing: {
        create: {
          minimum: 200,
          weekday: 225,
          weekend: 250,
          minStay: 2,
          maxStay: 7,
          dynamicPricing: DynamicPricing.PriceLabs,
        },
      },
      availability: {
        create: {
          checkIn: '14:00',
          checkOut: '11:00',
        },
      },
      fees: {
        create: [
          {
            name: 'Cleaning fee',
            value: 100,
            unit: 'PerStay',
            taxable: true,
            type: 'CleaningFee',
            share: 50,
          },
          {
            name: 'Pet fee',
            value: 80,
            unit: 'PerStay',
            taxable: true,
            type: 'PetFee',
            share: 75,
          },
        ],
      },
      deductions: {
        create: {
          channelFees: true,
          creditCardFees: true,
          discounts: true,
          municipalTaxes: true,
          countyTaxes: true,
          stateTaxes: true,
          otherGuestFees: true,
          pmcShare: 25,
        },
      },
      propertyManagerId: pm.id,
      propertyOwnerId: loganOwner.id,
      wifiName: 'Logan Wifi',
      wifiPassword: 'iLLin0ise',
      taxRates: { create: { county: 10, state: 2, municipal: 3 } },
      keys: {
        createMany: {
          data: [
            {
              id: 'cln0ps779000huwgo8qzxq7dt',
              keyType: KeyType.Direct,
            },
          ],
        },
      },
    },
  })

  const guestMarissa = await prisma.guest.create({
    data: {
      organizationId: org.id,
      name: 'Marissa, McKenzie',
      phone: '+13125555555',
    },
  })

  await prisma.calendarEvent.create({
    data: {
      listingId: theLogan.id,
      type: 'Reservation',
      fromDate: now
        .plus({ days: 5 })
        .set({ hour: 15, minute: 0, second: 0 })
        .toJSDate(),
      toDate: now
        .plus({ days: 8 })
        .set({ hour: 10, minute: 0, second: 0 })
        .toJSDate(),
      reservation: {
        create: {
          adults: 3,
          children: 0,
          status: ReservationStatus.PROVISIONAL,
          confirmationCode: '68fb5335-c914-4465-bbd4-2e9f71002f95',
          channel: 'Airbnb',
          guestId: guestMarissa.id,
        },
      },
    },
  })
}
