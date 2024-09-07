import AutomationsService from 'server/services/automations'
import { MessageTemplateCreateSchema } from 'types/automations'
import { z } from 'zod'
import { createTRPCRouter, orgProtectedProcedure } from '../trpc'

export const automationsRouter = createTRPCRouter({
  upsertMessageTemplate: orgProtectedProcedure
    .input(MessageTemplateCreateSchema)
    .mutation(async (req) => {
      const automationsService = new AutomationsService()
      await automationsService.upsertMessageTemplate(
        req.input,
        req.ctx.organization.id
      )
    }),

  setEnabled: orgProtectedProcedure
    .input(
      z.object({
        id: z.string(),
        enabled: z.boolean(),
      })
    )
    .mutation(async (req) => {
      const automationsService = new AutomationsService()
      await automationsService.setEnabled(req.input)
    }),

  getOne: orgProtectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const automationsService = new AutomationsService()
      return await automationsService.getOne(input.id)
    }),

  getAll: orgProtectedProcedure.query(async ({ ctx }) => {
    const automationsService = new AutomationsService()
    return await automationsService.getAll(ctx.organization.id)
  }),

  getCanned: orgProtectedProcedure
    .input(z.object({ messageThreadId: z.string() }))
    .query(async ({ input }) => {
      const automationsService = new AutomationsService()

      return await automationsService.getRenderedCannedMessages(
        input.messageThreadId
      )
    }),
})
