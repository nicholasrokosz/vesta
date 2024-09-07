import {
  MessageCreateSchema,
  MessageThreadUpdateArchivedSchema,
  MessageThreadUpdateReadSchema,
  OpenAIChatSchema,
} from 'types/messages'
import { createTRPCRouter, orgProtectedProcedure } from '../trpc'
import ServiceFactory from 'server/services/serviceFactory'
import { z } from 'zod'

export const messagesRouter = createTRPCRouter({
  createMessage: orgProtectedProcedure
    .input(MessageCreateSchema)
    .mutation(async (req) => {
      await req.ctx.prisma.$transaction(async (tx) => {
        if (tx) {
          const factory = new ServiceFactory(tx, req.ctx.organization.id)
          await factory.getMessagingService().createMessage(req.input)
        }
      })
    }),

  getAll: orgProtectedProcedure.query(async ({ ctx }) => {
    const factory = new ServiceFactory(ctx.prisma, ctx.organization.id)
    return await factory.getMessagingService().getAll()
  }),

  getOne: orgProtectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const factory = new ServiceFactory(ctx.prisma, ctx.organization.id)
      return await factory.getMessagingService().getOne(input.id)
    }),

  getUnreadOverdue: orgProtectedProcedure.query(async ({ ctx }) => {
    const factory = new ServiceFactory(ctx.prisma, ctx.organization.id)
    return await factory.getMessagingService().getUnreadOverdue()
  }),

  updateMessageThreadReadStatus: orgProtectedProcedure
    .input(MessageThreadUpdateReadSchema)
    .mutation(async (req) => {
      await req.ctx.prisma.$transaction(async (tx) => {
        if (tx) {
          const factory = new ServiceFactory(tx, req.ctx.organization.id)
          await factory
            .getMessagingService()
            .updateMessageThreadReadStatus(req.input)
        }
      })
    }),

  updateMessageThreadArchivedStatus: orgProtectedProcedure
    .input(MessageThreadUpdateArchivedSchema)
    .mutation(async (req) => {
      await req.ctx.prisma.$transaction(async (tx) => {
        if (tx) {
          const factory = new ServiceFactory(tx, req.ctx.organization.id)
          await factory
            .getMessagingService()
            .updateMessageThreadArchivedStatus(req.input)
        }
      })
    }),

  dismissMessageThreadReminder: orgProtectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async (req) => {
      await req.ctx.prisma.$transaction(async (tx) => {
        if (tx) {
          const factory = new ServiceFactory(tx, req.ctx.organization.id)
          await factory
            .getMessagingService()
            .dismissMessageThreadReminder(req.input.id)
        }
      })
    }),

  getGPTChatResponse: orgProtectedProcedure
    .input(OpenAIChatSchema)
    .query(async (req) => {
      const factory = new ServiceFactory(
        req.ctx.prisma,
        req.ctx.organization.id
      )

      const messagingService = factory.getMessagingService()

      const messageThread = await messagingService.getOne(
        req.input.messageThreadId
      )
      if (messageThread === null) {
        throw new Error('Message thread not found')
      }

      return await factory
        .getMessagingService()
        .getGPTChatResponse(
          req.input.listingId,
          req.input.prompts,
          messageThread
        )
    }),
})
