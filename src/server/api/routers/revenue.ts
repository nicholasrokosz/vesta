import { z } from 'zod'
import { createTRPCRouter, orgProtectedProcedure } from '../trpc'
import ServiceFactory from 'server/services/serviceFactory'
import DateString from 'types/dateString'
import { RevenueFiltersSchema } from 'types/revenue'

export const revenueRouter = createTRPCRouter({
  calculateRevenue: orgProtectedProcedure
    .input(
      z.object({
        listingId: z.string(),
        startDate: z.string(),
        endDate: z.string(),
        feeIds: z.string().array(),
        guests: z.number(),
        discount: z.number().optional(),
      })
    )

    .query(async ({ input, ctx }) => {
      const factory = new ServiceFactory(ctx.prisma, ctx.organization.id)

      const fees = await ctx.prisma.fee.findMany({
        where: { id: { in: input.feeIds } },
      })

      return await factory.getRevenueService().calculateRevenue(
        input.listingId,
        // TODO: calculateRevenue shuld accept DateStrings instead of dates
        // Until then, the double conversion is the best way to ensure timezone safety
        DateString.fromString(input.startDate).toDate(),
        DateString.fromString(input.endDate).toDate(),
        input.guests,
        fees.map((fee) => {
          return {
            name: fee.name,
            value: fee.value,
            unit: fee.unit,
            taxable: fee.taxable,
            pmcShare: fee.share,
          }
        }),
        input.discount || 0,
        true
      )
    }),

  getReservationRevenue: orgProtectedProcedure
    .input(z.object({ reservationId: z.string() }))
    .query(async ({ input, ctx }) => {
      const factory = new ServiceFactory(ctx.prisma, ctx.organization.id)
      return await factory
        .getRevenueService()
        .getReservationRevenue(input.reservationId)
    }),

  getAllReservationRevenue: orgProtectedProcedure
    .input(RevenueFiltersSchema)
    .query(async ({ input, ctx }) => {
      const factory = new ServiceFactory(ctx.prisma, ctx.organization.id)
      return await factory.getRevenueService().getAllReservationRevenue(input)
    }),

  getFeesForDirectBooking: orgProtectedProcedure
    .input(
      z.object({
        listingId: z.string(),
        guests: z.number(),
        pets: z.boolean(),
      })
    )
    .query(async ({ input, ctx }) => {
      if (!input.listingId) return []

      const factory = new ServiceFactory(ctx.prisma, ctx.organization.id)
      return await factory
        .getRevenueService()
        .getFeesForDirectBooking(input.listingId, input.guests, input.pets)
    }),
})
