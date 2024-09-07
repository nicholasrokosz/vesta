import { z } from 'zod'
import { createTRPCRouter, listingKeyProtectedProcedure } from '../trpc'
import ServiceFactory from 'server/services/serviceFactory'
import { ReservationDirectCreateSchema } from 'types/calendar'
import { RevenueFeeCreateSchema } from 'types/revenue'
import { Stripe } from 'stripe'
import DateString from 'types/dateString'
import * as Sentry from '@sentry/node'

export interface PaymentIntentPayload {
  organizationName: string
  organizationLogoUrl: string | null
  stripeAccountId: string
  paymentIntent: Stripe.Response<Stripe.PaymentIntent>
}

export const directRouter = createTRPCRouter({
  getListingByKey: listingKeyProtectedProcedure
    .input(z.object({ key: z.string() }))
    .query(async ({ ctx }) => {
      const factory = new ServiceFactory(ctx.prisma, ctx.organization.id)
      return await factory.getListingService().getOne(ctx.listing.id)
    }),

  getBlockedDatesByKey: listingKeyProtectedProcedure
    .input(z.object({ key: z.string() }))
    .query(async ({ ctx }) => {
      const factory = new ServiceFactory(ctx.prisma, ctx.organization.id)
      return await factory
        .getCalendarService()
        .getBlockedDatesForCalendar(ctx.listing.id)
    }),

  getFeesForDirectBookingByKey: listingKeyProtectedProcedure
    .input(
      z.object({
        key: z.string(),
        guests: z.number(),
        startDate: z.string(),
        endDate: z.string(),
        pets: z.boolean(),
      })
    )
    .query(async ({ input, ctx }) => {
      const factory = new ServiceFactory(ctx.prisma, ctx.organization.id)
      const fees = await factory
        .getRevenueService()
        .getFeesForDirectBooking(ctx.listing.id, input.guests, input.pets)
      return fees.filter((fee) => fee.applicable === true)
    }),

  getPricingByKey: listingKeyProtectedProcedure
    .input(z.object({ key: z.string() }))
    .query(async ({ ctx }) => {
      const factory = new ServiceFactory(ctx.prisma, ctx.organization.id)
      return await factory.getRatesService().getPricing(ctx.listing.id)
    }),

  calculateRevenueByKey: listingKeyProtectedProcedure
    .input(
      z.object({
        key: z.string(),
        startDate: z.string(),
        endDate: z.string(),
        guests: z.number(),
        fees: z.array(RevenueFeeCreateSchema),
      })
    )
    .query(async ({ ctx, input }) => {
      const factory = new ServiceFactory(ctx.prisma, ctx.organization.id)
      const revenueService = factory.getRevenueService()

      const start = DateString.fromString(input.startDate).toDate()
      const end = DateString.fromString(input.endDate).toDate()

      return await revenueService.calculateRevenue(
        ctx.listing.id,
        start,
        end,
        input.guests,
        input.fees,
        0,
        true
      )
    }),

  createReservationByKey: listingKeyProtectedProcedure
    .input(
      z.object({ key: z.string(), reservation: ReservationDirectCreateSchema })
    )
    .mutation(async (req) => {
      const factory = new ServiceFactory(
        req.ctx.prisma,
        req.ctx.organization.id
      )

      const { reservation, revenue, messageThread } = await factory
        .getCalendarService()
        .createDirectReservation(
          {
            ...req.input.reservation,
            listingId: req.ctx.listing.id,
          },
          true
        )

      try {
        await factory
          .getNotificationService()
          .sendDirectBookingNotification(reservation, messageThread)
      } catch (e) {
        Sentry.captureException(e)
      }

      try {
        await factory
          .getNotificationService()
          .sendDirectBookingGuestConfirmation(
            reservation,
            revenue,
            messageThread
          )
      } catch (e) {
        Sentry.captureException(e)
      }

      return reservation
    }),

  getReservationByIdAndKey: listingKeyProtectedProcedure
    .input(z.object({ key: z.string(), id: z.string() }))
    .query(async ({ ctx, input }) => {
      const factory = new ServiceFactory(ctx.prisma, ctx.organization.id)

      const reservation = await factory.getReservationService().get(input.id)
      if (!reservation) {
        throw new Error(`Reservation ${input.id} not found`)
      }

      const event = await factory
        .getCalendarService()
        .getById(ctx.organization.id, reservation.calendarEventId)

      const revenue = await factory
        .getRevenueService()
        .getReservationRevenue(event?.reservation?.id || '')

      return {
        event,
        revenue,
      }
    }),

  getCurrentOrgByKey: listingKeyProtectedProcedure
    .input(z.object({ key: z.string() }))
    .query(({ ctx }) => ctx.organization),

  createPaymentIntent: listingKeyProtectedProcedure
    .input(z.object({ key: z.string(), amount: z.number() }))
    .mutation(async (req): Promise<PaymentIntentPayload> => {
      const { prisma, organization } = req.ctx
      const stripeConnection = await prisma.stripeConnection.findFirst({
        where: {
          organizationId: organization.id,
        },
      })

      if (!stripeConnection) {
        throw new Error(
          `No Stripe connection found for organization ${organization.name} [${organization.id}]. Can't generate payment intent.`
        )
      }

      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
        apiVersion: '2023-10-16',
        stripeAccount: stripeConnection.accountId,
      })

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.trunc(req.input.amount * 100),
        currency: 'usd',
        metadata: {},
        automatic_payment_methods: {
          enabled: true,
          allow_redirects: 'never',
        },
      })

      const payload = {
        organizationName: organization.name,
        organizationLogoUrl: organization.logoUrl,
        stripeAccountId: stripeConnection.accountId,
        paymentIntent: paymentIntent,
      }

      return payload
    }),
})
