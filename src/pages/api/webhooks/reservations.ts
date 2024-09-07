import { type ReservationStatus } from '@prisma/client'
import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from 'server/db'
import { mapChannel } from 'server/integrations/bookingpal/mappers'
import ListingService from 'server/services/listing'
import ServiceFactory from 'server/services/serviceFactory'
import DateString from 'types/dateString'
import * as Sentry from '@sentry/node'

interface ReservationWebhookRequest {
  reservationNotificationRequest: {
    reservationId: string
    productId: string
    supplierId: string
    channelName: string
    confirmationId: string
    uniqueKey: string
    newState: string
    customerName: string
    fromDate: string
    toDate: string
    adult: number
    child: number
    email: string
    phone: string
    total: number
    commission: { channelCommission: number; commission: number }
    fees: { id: string; name: string; value: number }[]
    rate: {
      netRate: number
      newPublishedRackRate: number
      originalRackRate: number
    }
    taxes: { id: string; name: string; value: number }[]
  }
  action: 'CREATE' | 'UPDATE' | 'CANCEL' | 'RESERVATION_REQUEST'
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{
    altId: string
    is_error: boolean
    code: string
    message: string
  }>
) {
  const data = req.body as ReservationWebhookRequest
  console.log(JSON.stringify({ bpReservationsWebhook: `${data.action}`, data }))

  const reservationRequest = data.reservationNotificationRequest
  const webhookUniqueKey = process.env.BOOKING_PAL_WEBHOOK_UNIQUE_KEY
  if (reservationRequest.uniqueKey !== webhookUniqueKey) {
    errorResponse('Invalid key.', res)
    return
  }

  try {
    switch (data.action) {
      case 'CREATE':
        await handleCreate(data, res)
        break
      case 'UPDATE':
        await handleUpdate(data, res)
        break
      case 'CANCEL':
        await handleCancel(data, res)
        break
      // NOTE: Supposedly RESERVATION_REQUEST shouldn't happen, but it occurred creating
      //    provisional reservations that failed when trying to confirm later. Ignore and handle
      //    via message inquiry, for now.
      // case 'RESERVATION_REQUEST':
      //   await handleRequestToBook(data, res)
      //   break
    }
  } catch (e) {
    let errorMessage = 'Error processing reservation webhook'
    if (e instanceof Error) {
      errorMessage = `${errorMessage}: ${e.message}`
      Sentry.captureException(e.cause ? e.cause : e)
    } else if (typeof e === 'string') {
      errorMessage = `${errorMessage}: ${e}`
    }

    console.error(errorMessage)
    errorResponse(errorMessage, res)
  }
}

const handleCreate = async (
  request: ReservationWebhookRequest,
  res: NextApiResponse
) => {
  const data = request.reservationNotificationRequest
  const channel = mapChannel(data.channelName)

  const listingService = new ListingService()
  const listing = await listingService.getByBpProductId(data.productId)
  if (!listing) {
    console.log('Listing not found.')
    errorResponse('Listing not found.', res)
    return
  }

  const factory = new ServiceFactory(prisma, listing.organizationId)
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

  await prisma.reservationBpRequest.create({
    data: {
      organizationId: listing.organizationId,
      listingId: listing.id,
      reservationId: reservation.id,
      fromDate: new Date(data.fromDate),
      toDate: new Date(data.toDate),
      available: false,
    },
  })

  try {
    // Revenue
    const factory = new ServiceFactory(prisma, listing.organizationId)

    await factory
      .getRevenueService()
      .processBpRevenue(channel, listing, reservation.id, {
        taxes: data.taxes,
        fees: data.fees,
        commission: data.commission.channelCommission,
        accommodationRevenue: data.rate.newPublishedRackRate,
      })
  } catch (e) {
    let message = 'Error processing reservation revenue.'
    if (e instanceof Error) {
      message = `${message}: ${e.message}`
    }
    console.error(message)
    Sentry.captureException(e)
  }

  successResponse('Reservation is processed.', reservation.id, res)
}

const handleUpdate = async (
  data: ReservationWebhookRequest,
  res: NextApiResponse
) => {
  const reservation = await prisma.reservation.findUnique({
    where: {
      bpReservationId: data.reservationNotificationRequest.reservationId,
    },
    include: { calendarEvent: { include: { listing: true } } },
  })

  if (!reservation) {
    errorResponse('Reservation not found.', res)
    return
  }

  const factory = new ServiceFactory(
    prisma,
    reservation.calendarEvent.listing.organizationId
  )
  await factory.getCalendarService().updateReservation({
    id: reservation.id,
    listingId: reservation.calendarEvent.listingId,
    channel: mapChannel(data.reservationNotificationRequest.channelName),
    adults: data.reservationNotificationRequest.adult,
    children: data.reservationNotificationRequest.child,
    name: data.reservationNotificationRequest.customerName,
    email: data.reservationNotificationRequest.email,
    phone: data.reservationNotificationRequest.phone,
    fromDate: new DateString(data.reservationNotificationRequest.fromDate),
    toDate: new DateString(data.reservationNotificationRequest.toDate),
    confirmationCode: data.reservationNotificationRequest.confirmationId,
    status:
      data.reservationNotificationRequest.newState.toUpperCase() as ReservationStatus,
  })

  successResponse('Reservation is processed.', reservation.id, res)
}

const handleCancel = async (
  data: ReservationWebhookRequest,
  res: NextApiResponse
) => {
  const reservation = await prisma.reservation.findUnique({
    where: {
      bpReservationId: data.reservationNotificationRequest.reservationId,
    },
    include: { calendarEvent: { include: { listing: true } } },
  })

  if (!reservation) {
    errorResponse('Reservation not found.', res)
    return
  }

  const factory = new ServiceFactory(
    prisma,
    reservation.calendarEvent.listing.organizationId
  )
  await factory.getCalendarService().cancelReservation(reservation.id)

  await prisma.reservationBpRequest.create({
    data: {
      organizationId: reservation.calendarEvent.listing.organizationId,
      listingId: reservation.calendarEvent.listingId,
      reservationId: reservation.id,
      fromDate: reservation.calendarEvent.fromDate,
      toDate: reservation.calendarEvent.toDate,
      available: true,
    },
  })

  successResponse('Reservation is processed.', reservation.id, res)
}

const _handleRequestToBook = async (
  data: ReservationWebhookRequest,
  res: NextApiResponse
) => {
  const listing = await prisma.listing.findFirst({
    where: { bpProductId: data.reservationNotificationRequest.productId },
  })

  if (!listing) {
    errorResponse('Listing not found.', res)
    return
  }

  const factory = new ServiceFactory(prisma, listing.organizationId)

  const reservation = await factory.getCalendarService().createBpReservation({
    listingId: listing.id,
    bpReservationId: data.reservationNotificationRequest.reservationId,
    fromDate: new DateString(data.reservationNotificationRequest.fromDate),
    toDate: new DateString(data.reservationNotificationRequest.toDate),
    adults: data.reservationNotificationRequest.adult,
    children: data.reservationNotificationRequest.child,
    name: data.reservationNotificationRequest.customerName,
    email: data.reservationNotificationRequest.email,
    phone: data.reservationNotificationRequest.phone,
    channel: mapChannel(data.reservationNotificationRequest.channelName),
    status: 'PROVISIONAL',
    confirmationCode: data.reservationNotificationRequest.confirmationId,
  })

  successResponse('Reservation is processed.', reservation.id, res)
}

const errorResponse = (message: string, res: NextApiResponse) => {
  res.status(500).json({
    altId: '',
    is_error: true,
    code: '',
    message,
  })
}

const successResponse = (message: string, id: string, res: NextApiResponse) => {
  res.status(200).json({
    altId: id,
    is_error: false,
    code: '',
    message,
  })
}
