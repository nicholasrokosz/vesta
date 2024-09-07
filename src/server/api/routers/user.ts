import {
  createTRPCRouter,
  orgProtectedProcedure,
  superAdminProtectedProcedure,
} from '../trpc'
import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import ServiceFactory from 'server/services/serviceFactory'
import { UserCreateSchema } from 'types/users'

export const userRouter = createTRPCRouter({
  getPropertyManagers: orgProtectedProcedure.query(async ({ ctx }) => {
    const factory = new ServiceFactory(ctx.prisma, ctx.organization.id)
    return await factory.getUserService().getPropertyManagers()
  }),

  getPropertyOwners: orgProtectedProcedure.query(async ({ ctx }) => {
    const factory = new ServiceFactory(ctx.prisma, ctx.organization.id)
    return await factory.getUserService().getPropertyOwners(ctx.organization.id)
  }),

  getRole: orgProtectedProcedure.query(async ({ ctx }) => {
    const factory = new ServiceFactory(ctx.prisma, ctx.organization.id)
    return await factory.getUserService().getRole(ctx.user.id)
  }),

  getOne: orgProtectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const factory = new ServiceFactory(ctx.prisma, ctx.organization.id)
      return await factory.getUserService().getOne(input.id)
    }),

  connectToBookingPal: superAdminProtectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const factory = new ServiceFactory(ctx.prisma, ctx.organization?.id ?? '')
      const userService = factory.getUserService()
      const user = await userService.getOne(input.id)

      if (user == null || user.organization == null) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'User not found',
        })
      }

      return userService.publishOwner(user, user.organization)
    }),

  getAllCustomersInOrg: orgProtectedProcedure.query(async ({ ctx }) => {
    const factory = new ServiceFactory(ctx.prisma, ctx.organization.id)
    return await factory.getUserService().getAllCustomersInOrg()
  }),

  createUser: orgProtectedProcedure
    .input(UserCreateSchema)
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.$transaction(async (tx) => {
        if (tx) {
          const factory = new ServiceFactory(tx, ctx.organization.id)
          await factory.getUserService().createUser(input)
        }
      })
    }),

  createUserLogin: orgProtectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const factory = new ServiceFactory(ctx.prisma, ctx.organization.id)
      await factory.getUserService().createUserLogin(input.id)
    }),
})
