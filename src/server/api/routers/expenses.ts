import { z } from 'zod'
import { ExpenseCreateSchema, ExpenseUpdateSchema } from 'types/expenses'
import type { MonthFilter } from 'types/expenses'
import { createTRPCRouter, orgProtectedProcedure } from '../trpc'
import ServiceFactory from 'server/services/serviceFactory'

export const expenseRouter = createTRPCRouter({
  getPage: orgProtectedProcedure
    .input(
      z.object({ page: z.number(), listingId: z.string(), month: z.string() })
    )
    .query(async ({ ctx, input }) => {
      const factory = new ServiceFactory(ctx.prisma, ctx.organization.id)
      const expenseService = factory.getExpenseService()
      return await expenseService.getPage(
        input.listingId,
        input.month as MonthFilter,
        input.page
      )
    }),

  create: orgProtectedProcedure
    .input(ExpenseCreateSchema)
    .mutation(async ({ ctx, input }) => {
      const factory = new ServiceFactory(ctx.prisma, ctx.organization.id)
      const expenseService = factory.getExpenseService()
      return await expenseService.create(input)
    }),

  getOne: orgProtectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const factory = new ServiceFactory(ctx.prisma, ctx.organization.id)
      const expenseService = factory.getExpenseService()
      return await expenseService.getOne(input.id)
    }),

  update: orgProtectedProcedure
    .input(ExpenseUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const factory = new ServiceFactory(ctx.prisma, ctx.organization.id)
      const expenseService = factory.getExpenseService()
      return await expenseService.update(input)
    }),

  delete: orgProtectedProcedure
    .input(z.object({ ids: z.string().array() }))
    .mutation(async ({ ctx, input }) => {
      const factory = new ServiceFactory(ctx.prisma, ctx.organization.id)
      const expenseService = factory.getExpenseService()
      return await expenseService.delete(input.ids)
    }),
})
