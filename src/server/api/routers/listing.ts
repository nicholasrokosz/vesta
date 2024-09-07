import { z } from 'zod'
import { prisma } from 'server/db'
import {
  createTRPCRouter,
  orgProtectedProcedure,
  protectedProcedure,
} from '../trpc'
import ListingService from 'server/services/listing'
import { RulesCreateSchema } from 'types'
import AmenityModel from 'server/models/amenities'
import { ListingUncheckedUpdateInputSchema } from '../../../../prisma/generated/zod'
import { PricingCreateSchema } from 'types/pricing'
import ContentModel from 'server/models/content'

import FeeModel from 'server/models/fees'
import {
  ContentCreateSchema,
  ListingSchema,
  BusinessModelSchema,
  NotesUpdateSchema,
  AvailabilitySchema,
} from 'types/listings'
import { TRPCError } from '@trpc/server'
import ServiceFactory from 'server/services/serviceFactory'
import { quickAddJob } from 'graphile-worker'
import type { ListingPayload } from 'server/tasks/types'

const listingService = new ListingService()

export const listingRouter = createTRPCRouter({
  getOne: orgProtectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return await listingService.getOne(input.id)
    }),

  getAll: orgProtectedProcedure.query(async ({ ctx }) => {
    return await listingService.getAllByOrganization(ctx.organization.id)
  }),

  getDetails: orgProtectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return await listingService.getDetails(input.id)
    }),

  getReview: orgProtectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return await listingService.getReview(input.id)
    }),

  upsertListing: orgProtectedProcedure
    .input(ListingSchema)
    .mutation(async (req) => {
      const result = await listingService.upsertListing(
        req.input,
        req.ctx.organization.id
      )

      if (req.input.id) {
        const factory = new ServiceFactory(prisma, req.ctx.organization.id)
        const bpService = factory.getBookingPalService()
        const bpProductId = await bpService.getProductId(req.input.id)

        if (!!bpProductId) {
          try {
            return listingService.publishPropertyInBookingPal(req.input.id)
          } catch (error: unknown) {
            if (error instanceof Error) {
              throw new TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: error.message,
              })
            }
          }
        }
      }

      return result
    }),

  upsertRules: orgProtectedProcedure
    .input(RulesCreateSchema)
    .mutation(async (req) => {
      await req.ctx.prisma.rules.upsert({
        where: {
          listingId: req.input.listingId,
        },
        update: req.input,
        create: req.input,
      })

      const factory = new ServiceFactory(prisma, req.ctx.organization.id)
      const bpService = factory.getBookingPalService()
      const bpProductId = await bpService.getProductId(req.input.listingId)

      if (!!bpProductId) {
        try {
          return listingService.publishPropertyInBookingPal(req.input.listingId)
        } catch (error: unknown) {
          if (error instanceof Error) {
            throw new TRPCError({
              code: 'INTERNAL_SERVER_ERROR',
              message: error.message,
            })
          }
        }
      }
    }),

  upsertAvailability: orgProtectedProcedure
    .input(AvailabilitySchema)
    .mutation(async (req) => {
      await req.ctx.prisma.availability.upsert({
        where: {
          listingId: req.input.listingId,
        },
        update: req.input,
        create: req.input,
      })

      const factory = new ServiceFactory(prisma, req.ctx.organization.id)
      const bpService = factory.getBookingPalService()
      const bpProductId = await bpService.getProductId(req.input.listingId)

      if (!!bpProductId) {
        try {
          return listingService.publishAvailability(req.input.listingId)
        } catch (error: unknown) {
          if (error instanceof Error) {
            throw new TRPCError({
              code: 'INTERNAL_SERVER_ERROR',
              message: error.message,
            })
          }
        }
      }
    }),

  getRules: protectedProcedure
    .input(z.object({ listingId: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.prisma.rules.findUnique({
        where: {
          listingId: input.listingId,
        },
      })
    }),

  getAvailability: protectedProcedure
    .input(z.object({ listingId: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.prisma.availability.findUnique({
        where: {
          listingId: input.listingId,
        },
      })
    }),

  // ## Uses models ##

  upsertAmenity: orgProtectedProcedure
    .input(ListingUncheckedUpdateInputSchema)
    .mutation(async (req) => {
      await AmenityModel.upsert(req.input, req.ctx.prisma)

      const listingId = req.input.id as string | undefined
      if (listingId && req.ctx.organization?.id) {
        const factory = new ServiceFactory(prisma, req.ctx.organization?.id)
        const bpService = factory.getBookingPalService()
        const bpProductId = await bpService.getProductId(listingId)

        if (!!bpProductId) {
          try {
            return listingService.publishAvailability(listingId)
          } catch (error: unknown) {
            if (error instanceof Error) {
              throw new TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: error.message,
              })
            }
          }
        }
      }
    }),
  getAmenities: protectedProcedure
    .input(z.object({ listingId: z.string() }))
    .query(async ({ ctx, input }) => {
      return await AmenityModel.getByListingId(input.listingId, ctx.prisma)
    }),

  upsertContent: orgProtectedProcedure
    .input(ContentCreateSchema)
    .mutation(async (req) => {
      await ContentModel.upsert(req.input, req.ctx.prisma)

      const factory = new ServiceFactory(prisma, req.ctx.organization?.id)
      const bpService = factory.getBookingPalService()
      const bpProductId = await bpService.getProductId(req.input.listingId)

      if (!!bpProductId) {
        try {
          await listingService.publishPropertyInBookingPal(req.input.listingId)
        } catch (error: unknown) {
          if (error instanceof Error) {
            throw new TRPCError({
              code: 'INTERNAL_SERVER_ERROR',
              message: error.message,
            })
          }
        }
        try {
          await quickAddJob(
            {},
            'bookingpal-photos-publish',
            { listingId: req.input.listingId } as ListingPayload,
            { maxAttempts: 7 }
          )
        } catch (error: unknown) {
          if (error instanceof Error) {
            throw new TRPCError({
              code: 'INTERNAL_SERVER_ERROR',
              message: error.message,
            })
          }
        }
      }
    }),

  getContent: protectedProcedure
    .input(z.object({ listingId: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ContentModel.getByListingId(input.listingId, ctx.prisma)
    }),

  upsertPricing: orgProtectedProcedure
    .input(PricingCreateSchema)
    .mutation(async (req) => {
      const factory = new ServiceFactory(prisma, req.ctx.organization.id)

      try {
        await factory.getRatesService().upsertPricing(req.input)
      } catch (error: unknown) {
        if (error instanceof Error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: error.message,
          })
        }
      }
    }),

  getPricing: orgProtectedProcedure
    .input(z.object({ listingId: z.string() }))
    .query(async ({ ctx, input }) => {
      const factory = new ServiceFactory(ctx.prisma, ctx.organization.id)
      return await factory.getRatesService().getPricing(input.listingId)
    }),

  getSecretMessage: protectedProcedure.query(() => {
    return 'you can now see this secret message!'
  }),

  upsertFees: protectedProcedure
    .input(ListingUncheckedUpdateInputSchema)
    .mutation(async (req) => {
      await FeeModel.upsert(req.input, req.ctx.prisma)
    }),

  getFees: protectedProcedure
    .input(z.object({ listingId: z.string() }))
    .query(async ({ ctx, input }) => {
      return await FeeModel.getByListingId(input.listingId, ctx.prisma)
    }),

  upsertBusinessModel: orgProtectedProcedure
    .input(BusinessModelSchema)
    .mutation(async (req) => {
      const listingService = new ListingService()

      await listingService.upsertBusinessModel(req.input)

      if (req.input.listingId) {
        const factory = new ServiceFactory(prisma, req.ctx.organization.id)
        const bpService = factory.getBookingPalService()
        const bpProductId = await bpService.getProductId(req.input.listingId)

        if (!!bpProductId) {
          try {
            return await listingService.publishFeesAndTaxes(req.input.listingId)
          } catch (error: unknown) {
            if (error instanceof Error) {
              throw new TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: error.message,
              })
            }
          }
        }
      }
    }),

  getBusinessModel: protectedProcedure
    .input(z.object({ listingId: z.string().nullable() }))
    .query(async ({ input }) => {
      if (!input.listingId) return

      const listingService = new ListingService()

      return await listingService.getBusinessModel(input.listingId)
    }),

  upsertNotes: orgProtectedProcedure
    .input(NotesUpdateSchema)
    .mutation(async (req) => {
      const listingService = new ListingService()

      return await listingService.upsertNotes(req.input)
    }),

  publishPropertyInBookingPal: orgProtectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async (req) => {
      try {
        return await listingService
          .publishPropertyInBookingPal(req.input.id)
          .then(async () => {
            await listingService.publishPhotos(req.input.id)
          })
          .then(async () => {
            await listingService.publishFeesAndTaxes(req.input.id)
          })
          .then(async () => {
            await listingService.publishPricing(req.input.id)
          })
          .then(async () => {
            await listingService.publishLengthOfStayDiscounts(req.input.id)
          })
          .then(async () => {
            await listingService.publishAvailability(req.input.id)
          })
      } catch (error: unknown) {
        if (error instanceof Error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: error.message,
          })
        }
      }
    }),

  publishPhotos: orgProtectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async (req) => {
      try {
        return await listingService.publishPhotos(req.input.id)
      } catch (error: unknown) {
        if (error instanceof Error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: error.message,
          })
        }
      }
    }),

  publishFeesAndTaxes: orgProtectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async (req) => {
      try {
        return await listingService.publishFeesAndTaxes(req.input.id)
      } catch (error: unknown) {
        if (error instanceof Error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: error.message,
          })
        }
      }
    }),

  publishPricing: orgProtectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async (req) => {
      try {
        await listingService.publishPricing(req.input.id)
      } catch (error: unknown) {
        if (error instanceof Error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: error.message,
          })
        }
      }
    }),

  publishLengthOfStayDiscounts: orgProtectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async (req) => {
      try {
        await listingService.publishLengthOfStayDiscounts(req.input.id)
      } catch (error: unknown) {
        if (error instanceof Error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: error.message,
          })
        }
      }
    }),

  publishAvailability: orgProtectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async (req) => {
      try {
        return await listingService.publishAvailability(req.input.id)
      } catch (error: unknown) {
        if (error instanceof Error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: error.message,
          })
        }
      }
    }),

  activate: orgProtectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async (req) => {
      try {
        await listingService.activateProperty(req.input.id)
      } catch (error: unknown) {
        if (error instanceof Error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: error.message,
          })
        }
      }
    }),

  validate: orgProtectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async (req) => {
      try {
        await listingService.validateProperty(req.input.id)
      } catch (error: unknown) {
        if (error instanceof Error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: error.message,
          })
        }
      }
    }),

  publishToPriceLabs: orgProtectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const listing = await listingService.getOne(input.id)
        if (!listing) {
          throw new Error('Listing not found')
        }

        const connection = await prisma.priceLabsConnection.findUnique({
          where: {
            organizationId: listing.organizationId,
          },
        })
        if (!connection) {
          throw new Error('PriceLabs connection not setup')
        }

        const priceLabsService = new ServiceFactory(
          prisma,
          listing.organizationId
        ).getPriceLabsService()

        const result = await priceLabsService.syncListing(
          listing.id,
          connection
        )
        return result
      } catch (error: unknown) {
        if (error instanceof Error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: error.message,
          })
        }
      }
    }),

  syncPriceLabsCalendar: orgProtectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const listing = await listingService.getOne(input.id)
        if (!listing) {
          throw new Error('Listing not found')
        }

        await quickAddJob({}, 'pricelabs-sync-calendar', {
          listingId: listing.id,
        } as ListingPayload)

        return { message: 'PriceLabs calendar sync queued' }
      } catch (error: unknown) {
        if (error instanceof Error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: error.message,
          })
        }
      }
    }),

  syncPriceLabsReservations: orgProtectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const listing = await listingService.getOne(input.id)
        if (!listing) {
          throw new Error('Listing not found')
        }

        await quickAddJob({}, 'pricelabs-sync-reservations', {
          listingId: listing.id,
        } as ListingPayload)

        return { message: 'PriceLabs calendar sync queued' }
      } catch (error: unknown) {
        if (error instanceof Error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: error.message,
          })
        }
      }
    }),

  getListingsWithDirectBookingKeys: orgProtectedProcedure.query(
    async ({ ctx }) => {
      return await listingService.getListingsWithDirectBookingKeys(
        ctx.organization
      )
    }
  ),
})

// type AsyncAction<T> = () => Promise<T>

// async function handleErrors<T>(action: AsyncAction<T>): Promise<T | undefined> {
//   try {
//     const result = await action()
//     if ((result as any).success === false) {
//       throw new Error((result as any).message)
//     }
//     return result
//   } catch (error) {
//     if (error instanceof Error) {
//       throw new TRPCError({
//         code: 'INTERNAL_SERVER_ERROR',
//         message: error.message,
//       })
//     }
//   }
// }
