import { z } from 'zod'
import { createTRPCRouter, orgProtectedProcedure } from '../trpc'
import {
  CalendarEventSchema,
  RequestToBookResponseSchema,
  ReservationBulkCreateSchema,
  ReservationCreateManualAirbnbSchema,
  ReservationCreateManualDirectSchema,
} from 'types/calendar'
import { DateTime } from 'luxon'
import ServiceFactory from 'server/services/serviceFactory'

export const calendarRouter = createTRPCRouter({
  getAll: orgProtectedProcedure
    .input(
      z.object({ start: z.string().nullable(), end: z.string().nullable() })
    )
    .query(async ({ ctx, input }) => {
      const factory = new ServiceFactory(ctx.prisma, ctx.organization.id)

      const start = !!input.start
        ? DateTime.fromISO(input.start)
        : DateTime.now().startOf('month')
      const end = !!input.end
        ? DateTime.fromISO(input.end)
        : DateTime.now().endOf('month')

      return await factory
        .getCalendarService()
        .getAll(ctx.organization.id, start.toJSDate(), end.toJSDate())
    }),

  getAllByListing: orgProtectedProcedure
    .input(
      z.object({
        id: z.string(),
        start: z.string().nullable(),
        end: z.string().nullable(),
      })
    )
    .query(async ({ ctx, input }) => {
      const factory = new ServiceFactory(ctx.prisma, ctx.organization.id)

      const start = !!input.start
        ? DateTime.fromISO(input.start)
        : DateTime.now().startOf('month')
      const end = !!input.end
        ? DateTime.fromISO(input.end)
        : DateTime.now().endOf('month')

      return await factory
        .getCalendarService()
        .getAllByListing(
          ctx.organization.id,
          input.id,
          start.toJSDate(),
          end.toJSDate()
        )
    }),

  createManualAirbnbReservation: orgProtectedProcedure
    .input(ReservationCreateManualAirbnbSchema)
    .mutation(async (req) => {
      const factory = new ServiceFactory(
        req.ctx.prisma,
        req.ctx.organization.id
      )
      return await factory
        .getCalendarService()
        .createManualAirbnbResevation(req.input)
    }),

  createManualDirectReservation: orgProtectedProcedure
    .input(ReservationCreateManualDirectSchema)
    .mutation(async (req) => {
      const factory = new ServiceFactory(
        req.ctx.prisma,
        req.ctx.organization.id
      )
      const { reservation } = await factory
        .getCalendarService()
        .createDirectReservation(req.input, false)

      return reservation
    }),

  bulkCreateReservations: orgProtectedProcedure
    .input(ReservationBulkCreateSchema)
    .mutation(async (req) => {
      const factory = new ServiceFactory(
        req.ctx.prisma,
        req.ctx.organization.id
      )

      return await factory
        .getCalendarService()
        .bulkCreateReservations(req.input)
    }),

  cancelReservation: orgProtectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async (req) => {
      const factory = new ServiceFactory(
        req.ctx.prisma,
        req.ctx.organization.id
      )
      await factory.getCalendarService().cancelReservation(req.input.id)
    }),

  createEvent: orgProtectedProcedure
    .input(CalendarEventSchema)
    .mutation(async (req) => {
      const factory = new ServiceFactory(
        req.ctx.prisma,
        req.ctx.organization.id
      )
      await factory.getCalendarService().createEvent(req.input)
    }),

  deleteEvent: orgProtectedProcedure.input(z.string()).mutation(async (req) => {
    const factory = new ServiceFactory(req.ctx.prisma, req.ctx.organization.id)
    await factory.getCalendarService().deleteEvent(req.input)
  }),

  respondToRequestToBook: orgProtectedProcedure
    .input(RequestToBookResponseSchema)
    .mutation(async (req) => {
      const factory = new ServiceFactory(
        req.ctx.prisma,
        req.ctx.organization.id
      )
      await factory.getCalendarService().respondToRequestToBook(req.input)
    }),

  getById: orgProtectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const factory = new ServiceFactory(ctx.prisma, ctx.organization.id)

      return await factory
        .getCalendarService()
        .getById(ctx.organization.id, input.id)
    }),

  getBlockedDates: orgProtectedProcedure
    .input(z.object({ listingId: z.string() }))
    .query(async ({ ctx, input }) => {
      //if (!input.listingId) return Promise<[]>
      const factory = new ServiceFactory(ctx.prisma, ctx.organization.id)

      return await factory
        .getCalendarService()
        .getBlockedDatesForCalendar(input.listingId)
    }),

  getUpcoming: orgProtectedProcedure.query(async ({ ctx }) => {
    const factory = new ServiceFactory(ctx.prisma, ctx.organization.id)
    return await factory.getCalendarService().getUpcoming()
  }),
})
