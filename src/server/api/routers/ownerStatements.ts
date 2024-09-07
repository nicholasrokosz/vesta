import { z } from 'zod'
import { createTRPCRouter, orgProtectedProcedure } from '../trpc'
import ServiceFactory from 'server/services/serviceFactory'

export const ownerStatementRouter = createTRPCRouter({
  getAllForOrg: orgProtectedProcedure.query(async ({ ctx }) => {
    const factory = new ServiceFactory(ctx.prisma, ctx.organization.id)
    const statementService = factory.getOwnerStatementService()
    return await statementService.getAllForOrg()
  }),

  getDraft: orgProtectedProcedure
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

  getLocked: orgProtectedProcedure
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

  lockStatement: orgProtectedProcedure
    .input(
      z.object({
        listingId: z.string(),
        month: z.number(),
        year: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const factory = new ServiceFactory(ctx.prisma, ctx.organization.id)
      const statementService = factory.getOwnerStatementService()
      return await statementService.lockStatement(
        input.listingId,
        input.month,
        input.year
      )
    }),
})
