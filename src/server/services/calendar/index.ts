import type { PrismaClient } from '@prisma/client'

import { customAlphabet } from 'nanoid'
import { DateTime, IANAZone } from 'luxon'
import { CalendarEventType, Channel, ReservationStatus } from '@prisma/client'

import type {
  CalendarEvent,
  ICalendarEvent,
  RequestToBookResponse,
  Reservation,
  ReservationCreate,
  BookedDates,
  ReservationBulkCreate,
  ReservationWithCalendarEvent,
  ReservationCreateManualDirect,
  ReservationCreateBookingPal,
  ReservationCreateManualAirbnb,
} from 'types/calendar'
import Time from 'types/time'
import { RequestToBookDeclineReasonType } from 'server/integrations/bookingpal/types'

import {
  getDate,
  getEventDate,
  getGuests,
  getNightsText,
  getBlockedDates,
  getPrismaBetweenDatesOrClause,
  getAvailabilititesForNextThreeYears,
} from './dates'

import { formatAddress } from 'utils/vesta'

import type AutomationsService from '../automations'
import type RateService from '../rates'
import type GuestService from '../guest'
import type MessagingService from '../messages'
import type BookingPalService from '../channels/bookingpal'
import type NotificationService from '../notification'

import ical from 'ical-generator'
import type RevenueService from '../revenue'
import DateString from 'types/dateString'
import type { Price } from '../rates/types'

class CalendarService {
  constructor(
    private readonly guestService: GuestService,
    private readonly messagingService: MessagingService,
    private readonly bookingPalService: BookingPalService,
    private readonly revenueService: RevenueService,
    private readonly rateService: RateService,
    private readonly notificationService: NotificationService,
    private readonly automationService: AutomationsService,
    private readonly prismaListing: PrismaClient['listing'],
    private readonly prismaCalendarEvent: PrismaClient['calendarEvent'],
    private readonly prismaReservation: PrismaClient['reservation'],
    private readonly organizationId: string
  ) {}

  async createDirectReservation(
    reservationCreate: ReservationCreateManualDirect,
    adjustFeeValue: boolean
  ) {
    reservationCreate.confirmationCode = `VES-${customAlphabet(
      'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'
    )(10)}`
    reservationCreate.bookedOn = new Date()

    const reservation = await this.createReservation(reservationCreate)

    const messageThread = await this.messagingService.createDirectMessageThread(
      reservation.calendarEvent.listingId,
      reservation.guestId,
      reservation.calendarEvent.fromDate,
      reservation.calendarEvent.toDate
    )

    if (!messageThread) throw new Error('Failed to create message thread')

    const calendarEvent = reservation.calendarEvent

    const revenue = await this.revenueService.createDirectBookingRevenue(
      reservation.calendarEvent.listingId,
      reservation.id,
      calendarEvent.fromDate,
      calendarEvent.toDate,
      reservation.adults + reservation.children,
      reservationCreate.fees ?? [],
      reservationCreate.discount ?? 0,
      adjustFeeValue
    )

    return {
      reservation,
      revenue,
      messageThread,
    }
  }

  async createBpReservation(reservationCreate: ReservationCreateBookingPal) {
    reservationCreate.bookedOn = new Date()
    return this.createReservation(reservationCreate)
  }

  async createManualAirbnbResevation(
    reservationCreate: ReservationCreateManualAirbnb
  ) {
    return this.createReservation(reservationCreate)
  }

  private async createReservation(
    reservationCreate: ReservationCreate
  ): Promise<ReservationWithCalendarEvent> {
    const listing = await this.prismaListing.findUnique({
      where: { id: reservationCreate.listingId },
      include: { availability: true },
    })

    if (!listing || !listing?.availability) {
      throw new Error('Listing not found.')
    }

    const timeZone = IANAZone.create(listing.timeZone)

    const guestId = await this.guestService.getOrCreate({
      name: reservationCreate.name,
      email: reservationCreate.email,
      phone: reservationCreate.phone,
    })

    const reservation = await this.prismaReservation.create({
      data: {
        channel: reservationCreate.channel,
        bpReservationId: reservationCreate.bpReservationId,
        adults: reservationCreate.adults,
        children: reservationCreate.children,
        pets: reservationCreate.pets,
        status: reservationCreate.status,
        confirmationCode: reservationCreate.confirmationCode,
        guest: {
          connect: {
            id: guestId,
          },
        },
        calendarEvent: {
          create: {
            listingId: reservationCreate.listingId,
            fromDate: getEventDate(
              reservationCreate.fromDate,
              Time.fromString(listing.availability.checkIn),
              timeZone
            ),
            toDate: getEventDate(
              reservationCreate.toDate,
              Time.fromString(listing.availability.checkOut),
              timeZone
            ),
            type: CalendarEventType.Reservation,
            bookedOn: reservationCreate.bookedOn,
          },
        },
      },
      include: {
        guest: true,
        calendarEvent: {
          include: { listing: { include: { organization: true } } },
        },
      },
    })

    // Process automated messages for the reservation
    if (reservation.status === ReservationStatus.CONFIRMED) {
      await this.automationService.processNewReservation(reservation)
    }

    // Create unavailable for any reservation that comes in
    if (
      listing.bpProductId &&
      (reservation.channel === Channel.Direct ||
        (reservation.channel === Channel.Airbnb &&
          !reservation.bpReservationId))
    ) {
      await this.bookingPalService.createUnavailable(
        Number(listing.bpProductId),
        [
          getDate(reservationCreate.fromDate),
          getDate(reservationCreate.toDate),
        ],
        listing.propertyOwnerId
      )
    }

    return reservation
  }

  async bulkCreateReservations(bulkReservations: ReservationBulkCreate) {
    // Inline functions
    const log = (message: string) => {
      console.log(`[BULK RESERVATION LOAD] ${message}`)
    }
    const convertToDateString = (s: string): DateString =>
      DateString.fromDate(DateTime.fromFormat(s, 'M/d/yyyy').toJSDate())

    log(`Bulk loading ${bulkReservations.length} reservations`)

    const reservationsWithListingIds = await Promise.all(
      bulkReservations.map(
        async ({
          guestName,
          fromDate,
          toDate,
          bookedOn,
          listingName,
          channel,
          confirmationCode,
          email,
          phone,
        }) => ({
          guestName,
          fromDate,
          toDate,
          bookedOn,
          channel,
          confirmationCode,
          email,
          phone,
          listingName,
          listingId: await this.prismaListing
            .findFirst({
              where: { name: listingName },
              select: { id: true },
            })
            .then((listing) => listing?.id),
        })
      )
    )

    const successes: unknown[] = []
    const failures: unknown[] = []

    for (const reservation of reservationsWithListingIds) {
      const {
        guestName,
        fromDate,
        toDate,
        bookedOn,
        listingId,
        listingName,
        channel,
        confirmationCode,
        email,
        phone,
      } = reservation

      if (!listingId) {
        log(
          `No listing found for ${guestName} at '${listingName}' [${confirmationCode}]. Skipping...`
        )
        failures.push(reservation)
        continue
      }

      try {
        const reservationParams = {
          name: guestName,
          fromDate: convertToDateString(fromDate),
          toDate: convertToDateString(toDate),
          bookedOn: !!bookedOn
            ? convertToDateString(bookedOn).toDate()
            : undefined,
          listingId,
          confirmationCode,
          email,
          phone,
          adults: 1,
          children: 0,
          channel: channel,
        }

        const createdReservation =
          reservationParams.channel === Channel.Direct
            ? (
                await this.createDirectReservation(
                  {
                    ...reservationParams,
                    channel: Channel.Direct,
                  },
                  true
                )
              ).reservation
            : await this.createReservation(reservationParams)

        log(
          `Loaded ${guestName} at '${listingName}' [${
            createdReservation.confirmationCode || ''
          }] with id ${createdReservation.id}}`
        )
        successes.push(reservation)
      } catch (e) {
        const error = e as Error
        log(
          `Error loading ${guestName} at '${listingName}' [${confirmationCode}] - ${error.message}}`
        )
        failures.push(reservation)
      }
    }

    log(
      `Bulk loading reservations complete: ${successes.length} successes, ${failures.length} failures`
    )

    return failures
  }

  async cancelReservation(reservationId: string) {
    const reservation = await this.prismaReservation.findUnique({
      where: { id: reservationId },
      include: {
        calendarEvent: {
          select: { fromDate: true, toDate: true, listing: true },
        },
      },
    })

    if (!reservation) {
      throw new Error('Reservation not found.')
    }

    const listing = reservation?.calendarEvent?.listing

    await this.prismaReservation.update({
      where: { id: reservationId },
      data: {
        status: ReservationStatus.CANCELLED,
      },
    })

    await this.automationService.processCancelReservation(reservation.id)

    if (listing?.bpProductId && reservation.channel === Channel.Direct) {
      await this.bookingPalService.createAvailable(
        Number(listing.bpProductId),
        [
          reservation?.calendarEvent.fromDate,
          reservation?.calendarEvent.toDate,
        ],
        listing.propertyOwnerId
      )
    }
  }

  async updateReservation(reservationUpdate: Reservation) {
    const reservation = await this.prismaReservation.findUnique({
      where: { id: reservationUpdate.id },
      include: {
        calendarEvent: {
          select: {
            id: true,
            fromDate: true,
            toDate: true,
            listing: { include: { availability: true } },
          },
        },
        guest: true,
      },
    })

    if (!reservation?.calendarEvent) throw new Error('Reservation not found.')

    // TODO: Should we support updating the guest?
    await this.prismaReservation.update({
      where: { id: reservationUpdate.id },
      data: {
        children: reservationUpdate.children,
        adults: reservationUpdate.adults,
        confirmationCode: reservationUpdate.confirmationCode,
      },
    })

    const fromCompare = reservationUpdate.fromDate.compareToDate(
      reservation?.calendarEvent.fromDate
    )
    const toCompare = reservationUpdate.toDate.compareToDate(
      reservation?.calendarEvent.toDate
    )

    if (fromCompare !== 0 || toCompare !== 0) {
      const listing = reservation?.calendarEvent?.listing
      if (!listing || !listing.availability) return

      const timeZone = IANAZone.create(listing.timeZone)
      await this.prismaCalendarEvent.update({
        where: { id: reservation.calendarEvent.id },
        data: {
          fromDate: getEventDate(
            reservationUpdate.fromDate,
            Time.fromString(listing.availability.checkIn),
            timeZone
          ),
          toDate: getEventDate(
            reservationUpdate.toDate,
            Time.fromString(listing.availability.checkOut),
            timeZone
          ),
        },
      })

      // TODO: if reservationUpdate.status === confirmed && reservation.status !== confirmed, then create scheduled messages for confirmation
      // TODO: if going from confirmed to something else, delete scheduled messages with range value of 'after'
      await this.automationService.processUpdateReservation(reservation.id)

      if (listing.bpProductId) {
        await this.bookingPalService.createUnavailable(
          Number(listing.bpProductId),
          [
            getDate(reservationUpdate.fromDate),
            getDate(reservationUpdate.toDate),
          ],
          listing.propertyOwnerId
        )

        if (fromCompare > 1) {
          // New from date is later than old date, so we need to make some dates available
          await this.bookingPalService.createAvailable(
            Number(listing.bpProductId),
            [
              reservation?.calendarEvent.fromDate,
              getDate(reservationUpdate.fromDate),
            ],
            listing.propertyOwnerId
          )
        } else if (toCompare < 1) {
          // New to date is earlier than old date, so we need to make some dates available
          await this.bookingPalService.createAvailable(
            Number(listing.bpProductId),
            [
              getDate(reservationUpdate.toDate),
              reservation?.calendarEvent.toDate,
            ],
            listing.propertyOwnerId
          )
        }
      }
    }
  }

  async createEvent(event: CalendarEvent) {
    const listing = await this.prismaListing.findUnique({
      where: { id: event.listingId },
      include: { availability: true },
    })

    // TODO: Handle error
    if (!listing || !listing?.availability) {
      throw new Error('Listing not found.')
    }

    if (listing.bpProductId) {
      await this.bookingPalService.createUnavailable(
        Number(listing.bpProductId),
        [getDate(event.fromDate), getDate(event.toDate)],
        listing.propertyOwnerId
      )
    }

    const timeZone = IANAZone.create(listing.timeZone)
    await this.prismaCalendarEvent.create({
      data: {
        listingId: event.listingId,
        fromDate: getEventDate(
          event.fromDate,
          Time.fromString(listing.availability.checkIn),
          timeZone
        ),
        toDate: getEventDate(
          event.toDate,
          Time.fromString(listing.availability.checkOut),
          timeZone
        ),
        type: event.type,
        notes: event.notes,
      },
    })
  }

  async deleteEvent(eventId: string) {
    const event = await this.prismaCalendarEvent.findUnique({
      where: { id: eventId },
      include: {
        listing: {
          select: {
            organizationId: true,
            bpProductId: true,
            propertyOwnerId: true,
          },
        },
      },
    })

    if (!event) {
      throw new Error('Calendar event not found.')
    } else if (event.type === CalendarEventType.Reservation) {
      throw new Error('Calendar event is a reservation.')
    }

    await this.prismaCalendarEvent.delete({
      where: {
        id: eventId,
      },
    })

    if (event.listing.bpProductId) {
      await this.bookingPalService.createAvailable(
        Number(event.listing.bpProductId),
        [event.fromDate, event.toDate],
        event.listing.propertyOwnerId
      )
    }
  }

  async respondToRequestToBook(requestToBookResponse: RequestToBookResponse) {
    const reservation = await this.prismaReservation.findUnique({
      where: { id: requestToBookResponse.reservationId },
      include: {
        calendarEvent: {
          include: { listing: true },
        },
      },
    })

    if (!reservation?.calendarEvent) {
      throw new Error('Reservation not found.')
    }

    if (reservation.calendarEvent.listing.bpProductId) {
      await this.bookingPalService.respondToRequestToBook(
        Number(reservation.bpReservationId),
        requestToBookResponse.approve,
        requestToBookResponse.denyReason ??
          RequestToBookDeclineReasonType.Waiting,
        requestToBookResponse.denyMessage,
        reservation.calendarEvent.listing.propertyOwnerId
      )
    }
  }

  async getAll(organizationId: string, startDate: Date, endDate: Date) {
    const calendarEvents = await this.prismaCalendarEvent.findMany({
      where: {
        listing: { organizationId: organizationId },
        OR: getPrismaBetweenDatesOrClause(startDate, endDate),
        NOT: {
          reservation: {
            status: 'CANCELLED',
          },
        },
      },
      include: {
        listing: {
          include: {
            propertyOwner: true,
            content: true,
          },
        },
        reservation: { include: { guest: true, revenue: true } },
      },
    })

    const events: ICalendarEvent[] = await Promise.all(
      calendarEvents.map(async (event) => {
        let messageThreadId = ''
        if (event.reservation?.channel) {
          const messageThread = await this.messagingService.getThreadbyListing(
            event.listingId,
            event.reservation?.guestId || '',
            event.reservation?.channel
          )
          messageThreadId = messageThread?.id || ''
        }

        return {
          id: event.id,
          listingId: event.listing.id,
          listingName: event.listing.name,
          listingOwner: event.listing.propertyOwner?.name ?? 'None',
          listingPhoto: event.listing.content?.photos[0] ?? '',
          listingTimeZone: event.listing.timeZone,
          type: event.type,
          fromDate: event.fromDate,
          toDate: event.toDate,
          notes: event.notes ?? undefined,
          reservation: event.reservation
            ? {
                id: event.reservation.id,
                adults: event.reservation?.adults ?? 0,
                children: event.reservation?.children ?? 0,
                name: event.reservation?.guest.name ?? '',
                email: event.reservation?.guest.email ?? '',
                channel: event.reservation?.channel ?? '',
                guests: getGuests(
                  event.reservation?.adults,
                  event.reservation?.children
                ),
                nights: getNightsText(event.fromDate, event.toDate),
                status: event.reservation?.status,
                confirmationCode: event.reservation?.confirmationCode || '',
                hasRevenue: event.reservation?.revenue ? true : false,
                messageThreadId: messageThreadId,
              }
            : undefined,
        }
      })
    )

    const listings = await this.prismaListing.findMany({
      where: {
        organizationId,
      },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    })

    const prices = (
      await Promise.all(
        listings.flatMap(async (listing) =>
          (
            await this.rateService.getPrices(
              listing.id,
              DateString.fromDate(startDate),
              DateString.fromDate(endDate)
            )
          ).map((price) => ({
            date: price.date.toString(),
            price: price.price,
            minStay: price.minStay,
            listingId: listing.id,
          }))
        )
      )
    ).flat()

    return Promise.all([events, listings]).then(([events, listings]) => {
      return {
        events,
        listings,
        prices,
      }
    })
  }

  async getById(organizationId: string, calendarEventId: string) {
    const event = await this.prismaCalendarEvent.findFirst({
      where: {
        id: calendarEventId,
        listing: { organizationId: organizationId },
      },
      include: {
        listing: { include: { propertyOwner: true, content: true } },
        reservation: {
          include: {
            scheduledMessages: {
              select: {
                scheduledAt: true,
                status: true,
                messageTemplate: {
                  select: {
                    title: true,
                  },
                },
              },
              orderBy: { scheduledAt: 'asc' },
            },
            guest: true,
          },
        },
      },
    })

    if (!event) {
      return null
    }

    const scheduledMessages = event.reservation?.scheduledMessages.map((sm) => {
      return {
        scheduledAt: sm.scheduledAt,
        status: sm.status,
        title: sm.messageTemplate.title,
      }
    })

    const reservation: ICalendarEvent = {
      id: event.id,
      listingId: event.listing.id,
      listingName: event.listing.name,
      listingOwner: event.listing.propertyOwner?.name ?? 'None',
      listingPhoto: event.listing.content?.photos[0] ?? '',
      listingTimeZone: event.listing.timeZone,
      listingAddress: formatAddress({
        line1: event.listing.line1,
        line2: event.listing.line2,
        city: event.listing.city,
        state: event.listing.state,
        zip: event.listing.zip,
        country: event.listing.country,
      }),
      listingUnitType: event.listing.unitType,
      listingWifiName: event.listing.wifiName ?? '',
      listingWifiPassword: event.listing.wifiPassword ?? '',
      listingNotes: event.listing.notes ?? '',
      listingDoorCode: event.listing.doorCode ?? '',
      listingGuests: event.listing.guests ?? '',
      listingBeds: event.listing.beds ?? '',
      listingBaths: event.listing.baths ?? '',
      type: event.type,
      fromDate: event.fromDate,
      toDate: event.toDate,
      notes: event.notes ?? undefined,
      reservation: event.reservation
        ? {
            id: event.reservation.id,
            adults: event.reservation?.adults ?? 0,
            children: event.reservation?.children ?? 0,
            name: event.reservation?.guest.name ?? '',
            email: event.reservation?.guest.email ?? '',
            channel: event.reservation?.channel ?? '',
            guests: getGuests(
              event.reservation?.adults,
              event.reservation?.children
            ),
            nights: getNightsText(event.fromDate, event.toDate),
            scheduledMessages: scheduledMessages,
            status: event.reservation?.status,
            confirmationCode: event.reservation?.confirmationCode || '',
          }
        : undefined,
    }
    return reservation
  }

  async getAllByListing(
    organizationId: string,
    listingId: string,
    startDate: Date,
    endDate: Date
  ) {
    const calendarEvents = await this.prismaCalendarEvent.findMany({
      where: {
        listing: { organizationId, id: listingId },
        OR: getPrismaBetweenDatesOrClause(startDate, endDate),
        NOT: {
          reservation: {
            status: 'CANCELLED',
          },
        },
      },
      include: {
        listing: {
          include: { propertyOwner: true, content: true },
        },
        reservation: {
          include: {
            guest: true,
            revenue: true,
          },
        },
      },
    })
    const events: ICalendarEvent[] = await Promise.all(
      calendarEvents.map(async (event) => {
        let messageThreadId = ''
        if (event.reservation?.channel) {
          const messageThread = await this.messagingService.getThreadbyListing(
            event.listingId,
            event.reservation?.guestId || '',
            event.reservation?.channel
          )
          messageThreadId = messageThread?.id || ''
        }

        return {
          id: event.id,
          listingId: event.listing.id,
          listingName: event.listing.name,
          listingOwner: event.listing.propertyOwner?.name ?? 'None',
          listingPhoto: event.listing.content?.photos[0] ?? '',
          listingTimeZone: event.listing.timeZone,
          type: event.type,
          fromDate: event.fromDate,
          toDate: event.toDate,
          notes: event.notes ?? undefined,
          reservation: event.reservation
            ? {
                id: event.reservation.id,
                adults: event.reservation?.adults ?? 0,
                children: event.reservation?.children ?? 0,
                name: event.reservation?.guest.name ?? '',
                email: event.reservation?.guest.email ?? '',
                channel: event.reservation?.channel ?? '',
                guests: getGuests(
                  event.reservation?.adults,
                  event.reservation?.children
                ),
                nights: getNightsText(event.fromDate, event.toDate),
                status: event.reservation?.status,
                confirmationCode: event.reservation?.confirmationCode || '',
                hasRevenue: event.reservation?.revenue ? true : false,
                messageThreadId: messageThreadId,
              }
            : undefined,
        }
      })
    )

    const prices = (
      await this.rateService.getPrices(
        listingId,
        DateString.fromDate(startDate),
        DateString.fromDate(endDate)
      )
    )
      .map((price) => ({
        date: price.date.toString(),
        price: price.price,
        minStay: price.minStay,
        listingId,
      }))
      .flat()

    return Promise.all([events, prices]).then(([events, prices]) => {
      return {
        events,
        prices,
      }
    })
  }

  async getBlockedDatesForCalendar(listingId: string) {
    const prices = await this.rateService.getFuturePrices(listingId)
    return this.getBlockedDatesByListing(listingId, prices)
  }

  private async getBlockedDatesByListing(listingId: string, prices: Price[]) {
    const calendarEvents = await this.prismaCalendarEvent.findMany({
      where: {
        listing: { id: listingId },
        NOT: {
          reservation: {
            status: 'CANCELLED',
          },
        },
      },
      orderBy: { fromDate: 'asc' },
    })
    const eventDates: [Date, Date][] = calendarEvents.map((event) => {
      return [event.fromDate, event.toDate]
    })
    const blockedDates = getBlockedDates(eventDates, prices)
    return {
      ...blockedDates,
      prices: prices.map((price) => ({
        date: price.date.toString(),
        price: price.price,
        minStay: price.minStay,
      })),
    }
  }

  async getAvailabilitiesByListing(listingId: string) {
    const blockedDates = await this.getBlockedDatesByListing(listingId, [])
    const availabilities = getAvailabilititesForNextThreeYears(blockedDates)

    return availabilities
  }

  // TODO: Use by PriceLabs. Could use a better name
  // TODO: Update to use 'DateString' instead of 'DateTime'
  async getCalendarForDynamicPricingSync(
    listingId: string,
    startDate: DateTime,
    endDate: DateTime
  ): Promise<{ blockedDates: BookedDates; prices: Price[] }> {
    const calendarEvents = await this.prismaCalendarEvent.findMany({
      where: {
        listing: { id: listingId },
        NOT: {
          reservation: {
            status: 'CANCELLED',
          },
        },
        fromDate: {
          gte: startDate.toJSDate(),
        },
        toDate: {
          lte: endDate.toJSDate(),
        },
      },
      orderBy: { fromDate: 'asc' },
    })
    const eventDates: [Date, Date][] = calendarEvents.map((event) => {
      return [event.fromDate, event.toDate]
    })

    const prices = (
      await this.rateService.getPrices(
        listingId,
        DateString.fromDate(startDate.toJSDate()),
        DateString.fromDate(endDate.toJSDate())
      )
    )
      .flat()
      .map((rate) => ({
        date: rate.date,
        price: rate.price,
        minStay: rate.minStay,
      }))

    const blockedDates = getBlockedDates(eventDates, [])
    return { blockedDates, prices }
  }

  async generateICal(iCalKey: string) {
    const listing = await this.prismaListing.findUnique({
      where: { iCalKey },
    })
    const startDate = DateTime.now()
      .minus({ months: 3 })
      .startOf('month')
      .toJSDate()
    const endDate = DateTime.now()
      .plus({ months: 24 })
      .endOf('month')
      .toJSDate()
    const calendarEvents = await this.prismaCalendarEvent.findMany({
      where: {
        listing: { id: listing?.id },
        OR: getPrismaBetweenDatesOrClause(startDate, endDate),
        NOT: {
          reservation: {
            status: 'CANCELLED',
          },
        },
      },
      orderBy: { fromDate: 'asc' },
      include: {
        reservation: { include: { guest: true } },
      },
    })
    const calendarTitle = `${listing?.name ?? ''} Reservations Calendar`
    const calendar = ical({ name: calendarTitle })
    calendarEvents.forEach((event) => {
      calendar.createEvent({
        start: event.fromDate,
        end: event.toDate,
        summary: !!event.reservation
          ? `Reservation for ${event.reservation?.guest.name}`
          : 'Unavailable',
      })
    })

    return calendar
  }

  async getUpcoming() {
    const today = DateTime.fromJSDate(new Date()).startOf('day').toJSDate()
    const calendarEvents = await this.prismaCalendarEvent.findMany({
      where: {
        listing: { organizationId: this.organizationId },
        type: CalendarEventType.Reservation,
        OR: [
          {
            fromDate: {
              gte: today,
            },
            toDate: {
              gte: today,
            },
          },
        ],
        NOT: {
          reservation: {
            status: 'CANCELLED',
          },
        },
      },
      include: {
        listing: {
          select: {
            id: true,
            name: true,
            timeZone: true,
          },
        },
        reservation: { include: { guest: true } },
      },
    })

    const events = calendarEvents.map((event) => {
      return {
        listingName: event.listing.name,
        listingTimeZone: event.listing.timeZone,
        fromDate: event.fromDate,
        toDate: event.toDate,
        guestName: event.reservation?.guest.name ?? '',
        numGuests: getGuests(
          event.reservation?.adults ?? 0,
          event.reservation?.children ?? 0
        ),
      }
    })

    return {
      checkins: events
        .filter((event) => event.fromDate >= today)
        .sort((a, b) => (a.fromDate > b.fromDate ? 1 : -1)),
      checkouts: events
        .filter((event) => event.toDate >= today)
        .sort((a, b) => (a.toDate > b.toDate ? 1 : -1)),
    }
  }
}

export default CalendarService
