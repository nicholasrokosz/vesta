import type { PriceLabsConnection } from '@prisma/client'
import type { CalendarData } from 'server/integrations/pricelabs/types'
import {
  convertStatus,
  type CalendarSettings,
  type Listing as PriceLabsListing,
  type ReservationData,
} from 'server/integrations/pricelabs/types'
import type PriceLabsApi from 'server/integrations/pricelabs/api'
import type ListingService from 'server/services/listing'
import possibleAmenities from 'utils/amenities'
import { whereAlpha2 } from 'iso-3166-1'
import type CalendarService from '../calendar'
import { DateTime } from 'luxon'
import type ReservationService from '../reservation'
import { RevenueSummaryBuilder } from '../revenue/revenueSummary'

class PriceLabsService {
  constructor(
    private readonly organizationId: string,
    private readonly api: PriceLabsApi,
    private readonly listingService: ListingService,
    private readonly calendarService: CalendarService,
    private readonly reservationService: ReservationService
  ) {}

  async syncListing(listingId: string, connection: PriceLabsConnection) {
    const listing = await this.listingService.getOne(listingId)
    if (!listing) {
      throw new Error('Listing not found')
    }

    const amenities: string[] = []
    listing.amenities.forEach(({ typeId }): void => {
      const amenity = possibleAmenities.find((amenity) =>
        amenity.typeIds.includes(typeId)
      )
      if (amenity) {
        amenities.push(amenity.name)
      }
    })

    const listingCountry = listing.country ?? ''
    const country = whereAlpha2(listingCountry)

    const priceLabsListing: PriceLabsListing = {
      listing_id: listing.id,
      user_token: connection.accountEmail,
      location: {
        latitude: listing.latitude,
        longitude: listing.longitude,
        city: listing.city,
        country: country?.alpha3 ?? '',
      },
      name: listing.name,
      status: 'available',
      number_of_bedrooms: listing.beds,
      amenities: amenities,
    }

    return await this.api.listingsSync([priceLabsListing])
  }

  async syncCalendar(listingId: string, fromDate: DateTime, toDate: DateTime) {
    const listing = await this.listingService.getOne(listingId)
    if (!listing) {
      throw new Error('Listing not found')
    }

    const settings: CalendarSettings = {
      min_stay: listing.pricing?.minStay || 0,
    }

    const bookedDates =
      await this.calendarService.getCalendarForDynamicPricingSync(
        listingId,
        fromDate,
        toDate
      )

    const calendarData: CalendarData[] = []

    for (let i = fromDate; i <= toDate; i = i.plus({ days: 1 })) {
      const dateString = i.toISODate().substring(0, 10)
      const foundPrice = bookedDates.prices.find((price) => {
        return price.date.compareToDate(i.toJSDate())
      })

      if (!!foundPrice) {
        if (bookedDates.blockedDates.blockedCheckIn.includes(i.toISODate())) {
          calendarData.push({
            date: i.toISODate(),
            available_units: 0,
            blocked_units: 1,
            price: foundPrice.price,
            settings,
          })
        } else {
          calendarData.push({
            date: i.toISODate(),
            available_units: 1,
            price: foundPrice.price,
            settings,
          })
        }
      } else {
        console.log(
          `PriceLabs calendarSync: Couldn't find price for ${listingId} on ${dateString}. Skipping...`
        )
      }
    }
    const calendar = [
      {
        listing_id: listingId,
        currency: 'USD',
        data: calendarData,
      },
    ]
    return await this.api.calendarSync(calendar)
  }

  async syncReservations(listingId: string) {
    const reservations = await this.reservationService.getAllByListing(
      listingId
    )

    const reservationsData = reservations
      .map((reservation) => {
        const total_days =
          DateTime.fromJSDate(reservation.calendarEvent.toDate)
            .diff(
              DateTime.fromJSDate(reservation.calendarEvent.fromDate),
              'days'
            )
            .toObject().days ?? 0

        if (!reservation.revenue) {
          return null
        }

        const revenueSummary = new RevenueSummaryBuilder(
          reservation.revenue,
          total_days
        )
          .build()
          .getSummary()

        return {
          reservation_id: reservation.id,
          start_date: reservation.calendarEvent.fromDate.toISOString(),
          end_date: reservation.calendarEvent.toDate.toISOString(),
          booked_time: reservation.createdAt.toISOString(),
          total_days: total_days,
          total_cost: revenueSummary.grossBookingValue.amount,
          total_taxes: revenueSummary.totalTaxes.amount,
          total_fees: revenueSummary.guestFeeRevenue.guestFeesGross.amount,
          currency: 'USD',
          status: convertStatus(reservation.status),
        } as ReservationData
      })
      .flatMap((f) => (!!f ? [f] : []))

    if (reservationsData.length > 0) {
      const request = [
        {
          listing_id: listingId,
          data: reservationsData,
        },
      ]

      return await this.api.reservationsSync(request)
    } else {
      return null
    }
  }
}

export default PriceLabsService
