import { createTRPCRouter, orgProtectedProcedure } from '../trpc'
import ServiceFactory from 'server/services/serviceFactory'
import { z } from 'zod'

export const reconciliationRouter = createTRPCRouter({
  reconcile: orgProtectedProcedure
    .input(
      z.object({
        plaidTransactionIds: z.array(z.string()),
        reservationIds: z.array(z.string()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const factory = new ServiceFactory(ctx.prisma, ctx.organization.id)
      if (
        input.reservationIds.length >= 1 &&
        input.plaidTransactionIds.length === 1
      ) {
        await factory.getReconciliationService().reconcileReservations({
          plaidTransactionId: input.plaidTransactionIds[0],
          reservationIds: input.reservationIds,
          userId: ctx.user.id,
        })
      } else {
        await factory.getReconciliationService().reconcileTransactions({
          plaidTransactionIds: input.plaidTransactionIds,
          reservationId: input.reservationIds[0],
          userId: ctx.user.id,
        })
      }
    }),
})
