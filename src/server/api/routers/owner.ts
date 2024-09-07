import { z } from 'zod'
import { createTRPCRouter, ownerProtectedProcedure } from '../trpc'
import ServiceFactory from 'server/services/serviceFactory'
import { DateTime } from 'luxon'

export const ownerRouter = createTRPCRouter({
  getEventsForListing: ownerProtectedProcedure
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

  getListings: ownerProtectedProcedure.query(async ({ ctx }) => {
    const factory = new ServiceFactory(ctx.prisma, ctx.organization.id)
    return await factory.getListingService().getAllByOwner(ctx.user.id)
  }),

  getStatements: ownerProtectedProcedure.query(async ({ ctx }) => {
    const factory = new ServiceFactory(ctx.prisma, ctx.organization.id)
    const statementService = factory.getOwnerStatementService()
    return await statementService.getAllForOwner(ctx.user.id, ctx.user.name)
  }),

  getStatement: ownerProtectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const factory = new ServiceFactory(ctx.prisma, ctx.organization.id)
      const statementService = factory.getOwnerStatementService()
      const statement = await statementService.getLocked(input.id)

      const listing = await factory
        .getListingService()
        .getOne(statement.statement.listingId)

      if (!listing) {
        throw new Error('Invalid listing id')
      }

      return {
        ...statement,
        listing,
      }
    }),

  getDraftStatement: ownerProtectedProcedure
    .input(
      z.object({
        listingId: z.string(),
        month: z.number(),
        year: z.number(),
      })
    )
    .query(async ({ ctx, input }) => {
      const factory = new ServiceFactory(ctx.prisma, ctx.organization.id)
      const statementService = factory.getOwnerStatementService()
      const statement = await statementService.getDraft(
        input.listingId,
        input.month,
        input.year
      )

      const listing = await factory.getListingService().getOne(input.listingId)
      if (!listing) {
        throw new Error('Invalid listing id')
      }

      return {
        ...statement,
        listing,
      }
    }),
})
