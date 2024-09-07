import { z } from 'zod'
import {
  createTRPCRouter,
  superAdminProtectedProcedure,
  orgProtectedProcedure,
} from '../trpc'
import OrganizationsService from 'server/services/organizations'
import { TRPCError } from '@trpc/server'

export const organizationsRouter = createTRPCRouter({
  getAll: superAdminProtectedProcedure.query(async ({}) => {
    return await new OrganizationsService().getAll()
  }),

  getOne: superAdminProtectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return await new OrganizationsService().getOne(input.id)
    }),

  getOwners: orgProtectedProcedure.query(async ({ ctx }) => {
    return await new OrganizationsService().getOwners(ctx.organization.id)
  }),

  getCurrent: orgProtectedProcedure.query(({ ctx }) => ctx.organization),

  getDirectBookingStatus: orgProtectedProcedure.query(
    async ({ ctx }) =>
      await new OrganizationsService().getDirectBookingStatus(
        ctx.organization.id
      )
  ),

  enableDirectBooking: orgProtectedProcedure.mutation(
    async ({ ctx }) =>
      await new OrganizationsService().enableDirectBooking(ctx.organization.id)
  ),

  getWizardUrl: superAdminProtectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return await new OrganizationsService().getWizardUrl(input.id)
    }),

  connectToBookingPal: superAdminProtectedProcedure
    .input(z.object({ id: z.string() }))

    .mutation(async (req) => {
      const organizationsService = new OrganizationsService()

      const organization = await organizationsService.getOne(req.input.id)

      if (organization == null) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Organization not found',
        })
      }

      return organizationsService.publishOrganziation(organization)
    }),
})
