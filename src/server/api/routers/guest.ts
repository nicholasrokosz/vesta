import { createTRPCRouter, orgProtectedProcedure } from '../trpc'
import ServiceFactory from 'server/services/serviceFactory'
import { z } from 'zod'

export const guestRouter = createTRPCRouter({
  updateEmail: orgProtectedProcedure
    .input(z.object({ threadId: z.string(), email: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const factory = new ServiceFactory(ctx.prisma, ctx.organization.id)
      const thread = await factory
        .getMessagingService()
        .getMessageThread(input.threadId)
      await factory.getGuestService().updateEmail(thread.guestId, input.email)
    }),
})
