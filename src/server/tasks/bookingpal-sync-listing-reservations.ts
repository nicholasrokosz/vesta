import { prisma } from 'server/db'
import type { Task } from 'graphile-worker'
import { ListingPayloadSchema } from './types'
import ServiceFactory from 'server/services/serviceFactory'
import * as Sentry from '@sentry/node'
import type { BpReservationModel } from 'server/integrations/bookingpal/types'
import { mapChannel } from 'server/integrations/bookingpal/mappers'
import DateString from 'types/dateString'
import type { Listing } from '@prisma/client'

const task: Task = async (payload, { logger }) => {
  const { listingId } = ListingPayloadSchema.parse(payload)
  logger.info(`Syncing reservations for listing ${listingId}...`)

  const factory = await ServiceFactory.fromListingId(prisma, listingId)
  const listing = await factory.getListingService().getOne(listingId)

  if (!listing) {
    logger.error(`No listing found for [${listingId}]`)
    return
  } else if (!listing.bpProductId) {
    logger.error(
      `No BookingPal product ID found for ${listing.name} [${listingId}]`
    )
    return
  }

  try {
    const bpReservations: BpReservationModel[] = await factory
      .getBookingPalService()
      .getReservations(listingId)

    const reservations = bpReservations.filter(
      (r: BpReservationModel) =>
        new DateString(r.toDate).compareToDate(new Date()) >= 0 &&
        (r.newState === 'Confirmed' ||
          r.newState === 'FullyPaid' ||
          r.newState === 'Provisional')
    )

    const reservationService = factory.getReservationService()

    await Promise.all(
      reservations.map(async (reservation) => {
        let existingReservation = await reservationService.getByBpReservationId(
          reservation.reservationId
        )

        if (!existingReservation) {
          existingReservation = await reservationService.getByConfirmationCode(
            reservation.confirmationId
          )

          if (!existingReservation) {
            const noMatch = `Reservation confirmationCode [${reservation.reservationId}] / bpReservationId [${reservation.confirmationId}] NOT found for listing [${listingId}]. Syncing now.`
            console.log(noMatch)
            Sentry.captureMessage(noMatch)
            await createBpReservation(listing, reservation)
          }
        }
      })
    )
  } catch (e) {
    let message = `Error syncing reservations for listing [${listingId}] .`
    if (e instanceof Error) {
      message = `${message}: ${e.message}`
    }
    console.error(message)
    Sentry.captureException(e)
  }
}
module.exports = task

const createBpReservation = async (
  listing: Listing,
  data: BpReservationModel
) => {
  const channel = mapChannel(data.channelName)

  const factory = await ServiceFactory.fromListingId(prisma, listing.id)

  const reservation = await factory.getCalendarService().createBpReservation({
    listingId: listing.id,
    bpReservationId: data.reservationId,
    fromDate: new DateString(data.fromDate),
    toDate: new DateString(data.toDate),
    adults: data.adult,
    children: data.child,
    name: data.customerName,
    email: data.email,
    phone: data.phone,
    channel,
    confirmationCode: data.confirmationId,
  })

  try {
    await factory
      .getRevenueService()
      .processBpRevenue(channel, listing, reservation.id, {
        taxes: data.taxes,
        fees: data.fees,
        commission: data.commission.channelCommission,
        accommodationRevenue: data.rate.newPublishedRackRate,
      })
  } catch (e) {
    let message = `Error processing revenue for reservation ${reservation.id}.`
    if (e instanceof Error) {
      message = `${message}: ${e.message}`
    }
    console.error(message)
    Sentry.captureException(e)
  }
}
