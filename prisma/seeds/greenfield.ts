import type { PrismaClient } from '@prisma/client'
import {
  GlobalRole,
  OrganizationRole,
  ReservationStatus,
  UnitType,
} from '@prisma/client'
import { DateTime } from 'luxon'

const now = DateTime.local().setZone('US/Central')

export const GREENFIELD_ORG_NAME = 'Greenfield Property Management'

export const seedGreenfield = async (prisma: PrismaClient): Promise<void> => {
  const org = await prisma.organization.create({
    data: {
      id: 'clk5vvcae003suwugmvbyqzjf',
      name: GREENFIELD_ORG_NAME,
      language: 'en',
      adminName: 'Michael Greenfield',
      line1: '374 5th Avenue',
      city: 'St. Paul',
      state: 'MN',
      zip: '55104',
      country: 'US',
      website: 'https://greenfield.properties',
      phone: '+12345678901',
      currency: 'USD',
      bookingPalConnection: {
        create: {
          email: 'greenfield-property-management@getvesta.io',
          password: 'badpassword',
          companyId: 879374210,
        },
      },
      startDate: new Date(),
    },
  })

  const pm = await prisma.user.create({
    data: {
      email: 'test-users+mikegreenfield@getvesta.io',
      name: 'Michael Greenfield',
      globalRole: GlobalRole.SUPERADMIN,
      organizationId: org.id,
      organizationRole: OrganizationRole.ADMIN,
      accounts: {
        create: [
          {
            type: 'oauth',
            provider: 'auth0',
            providerAccountId: 'auth0|640772e765426e2aa7c0cff5',
          },
        ],
      },
    },
  })

  // ******************************************************
  // PAISLEY PARK
  // ******************************************************
  const paisleyPark = await prisma.listing.create({
    data: {
      id: 'clk5t7sqp004quw347ukyo7nt',
      organizationId: org.id,
      name: 'Paisley Park',
      unitType: UnitType.House,
      beds: 5,
      baths: 3,
      guests: 12,
      line1: '7801 Audubon Road',
      city: 'Chanhassen',
      state: 'MN',
      zip: '55317',
      timeZone: 'US/Central',
      basePrice: 200.5,
      content: {
        create: {
          photos: [
            'https://d3m65jzbgi46ie.cloudfront.net/ccd02c00-dfa1-4286-88ff-b565f7be8c5e.jpeg',
          ],
          title: 'The home of a music legend',
          description: 'Great spot',
        },
      },
      pricing: {
        create: {
          minimum: 200,
          weekday: 225,
          weekend: 250,
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
            name: 'Cleaning fee',
            value: 120,
            unit: 'PerStay',
            taxable: true,
            type: 'CleaningFee',
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
          pmcShare: 40,
        },
      },
      propertyManagerId: pm.id,
      bpProductId: '1237790340',
    },
  })

  const guestRando = await prisma.guest.create({
    data: {
      organizationId: org.id,
      name: 'Rando Calrissian',
      email: 'rcalrissian@gmail.com',
    },
  })

  await prisma.calendarEvent.create({
    data: {
      listingId: paisleyPark.id,
      type: 'Reservation',
      fromDate: now
        .plus({ days: 3 })
        .set({ hour: 15, minute: 0, second: 0 })
        .toJSDate(),
      toDate: now
        .plus({ days: 12 })
        .set({ hour: 10, minute: 0, second: 0 })
        .toJSDate(),
      reservation: {
        create: {
          id: 'clk5t7shg001uuw34yhkhysxg',
          bpReservationId: '1237790341',
          adults: 1,
          children: 0,
          status: ReservationStatus.CONFIRMED,
          confirmationCode: 'W012ZZ',
          channel: 'VRBO',
          guestId: guestRando.id,
        },
      },
    },
    include: { reservation: true },
  })

  // ******************************************************
  // Booking Pal Test Property (for certification)
  // ******************************************************
  await prisma.listing.create({
    data: {
      organizationId: org.id,
      name: 'Booking Pal Test Property',
      unitType: UnitType.House,
      beds: 1,
      baths: 1.5,
      guests: 2,
      line1: '515 E. 6th St',
      line2: '5E',
      city: 'New York',
      state: 'NY',
      zip: '10009',
      country: 'US',
      latitude: 40.7252281,
      longitude: -73.9829341,
      timeZone: 'US/Eastern',
      content: {
        create: {
          photos: [
            'https://d3m65jzbgi46ie.cloudfront.net/e47f2303-a649-46d1-9a2f-65a8a84d2bc1.jpg',
          ],
          title: 'Booking Pal Test Property',
          description: 'Lorem ipsum dolor sit amet',
        },
      },
      propertyManagerId: pm.id,
      bpProductId: '1237790346',
    },
  })
}
