import { z } from 'zod'
import { createTRPCRouter, orgProtectedProcedure } from '../trpc'
import ServiceFactory from 'server/services/serviceFactory'
import { PlaidLinkOnSuccessMetadataSchema } from 'server/services/plaid/types'
import type { PlaidImportStatus } from '@prisma/client'

export const plaidRouter = createTRPCRouter({
  createLinkToken: orgProtectedProcedure.query(async ({ ctx }) => {
    const plaidService = new ServiceFactory(
      ctx.prisma,
      ctx.organization.id
    ).getPlaidService()

    return await plaidService.createLinkToken(ctx.user)
  }),

  getItems: orgProtectedProcedure.query(async ({ ctx }) => {
    const plaidService = new ServiceFactory(
      ctx.prisma,
      ctx.organization.id
    ).getPlaidService()

    return await plaidService.getItems()
  }),

  getCreditCardTransactions: orgProtectedProcedure
    .input(
      z.object({
        status: z.string(),
        accountId: z.string().optional(),
        page: z.number(),
      })
    )
    .query(async ({ input, ctx }) => {
      const plaidService = new ServiceFactory(
        ctx.prisma,
        ctx.organization.id
      ).getPlaidService()

      return await plaidService.getCreditCardTransactions(
        input.status as PlaidImportStatus,
        input.page,
        input.accountId
      )
    }),

  getBankTransactions: orgProtectedProcedure.query(async ({ ctx }) => {
    const plaidService = new ServiceFactory(
      ctx.prisma,
      ctx.organization.id
    ).getPlaidService()

    return await plaidService.getBankTransactions()
  }),

  syncTransactions: orgProtectedProcedure.mutation(async ({ ctx }) => {
    const plaidService = new ServiceFactory(
      ctx.prisma,
      ctx.organization.id
    ).getPlaidService()

    await plaidService.syncTransactions()
  }),

  getTransaction: orgProtectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const plaidService = new ServiceFactory(
        ctx.prisma,
        ctx.organization.id
      ).getPlaidService()

      return await plaidService.getTransaction(input.id)
    }),

  updateTransaction: orgProtectedProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.string(),
        expenseId: z.string().optional().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const plaidService = new ServiceFactory(
        ctx.prisma,
        ctx.organization.id
      ).getPlaidService()

      await plaidService.updateTransaction(
        input.id,
        input.status as PlaidImportStatus
      )
    }),

  saveItem: orgProtectedProcedure
    .input(PlaidLinkOnSuccessMetadataSchema)
    .mutation(async ({ ctx, input }) => {
      const plaidService = new ServiceFactory(
        ctx.prisma,
        ctx.organization.id
      ).getPlaidService()

      await plaidService.saveLinkItem(input, ctx.user)
    }),
})
