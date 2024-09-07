import type { StripeConnection } from '@prisma/client'
import { createTRPCRouter, orgProtectedProcedure } from '../trpc'
import { Stripe } from 'stripe'

export type StripeAuthorizationConfirmation = { success: boolean } & (
  | {
      success: true
      connection: StripeConnection
    }
  | {
      success: false
      error: string
      connection: StripeConnection
    }
)

export const stripeRouter = createTRPCRouter({
  getConnection: orgProtectedProcedure.query(async ({ ctx }) => {
    const organization = ctx.organization

    return await ctx.prisma.stripeConnection.findFirst({
      where: {
        organizationId: organization.id,
      },
    })
  }),

  authorize: orgProtectedProcedure.mutation(async ({ ctx }) => {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
      apiVersion: '2023-10-16',
    })

    const organization = ctx.organization

    try {
      let stripeConnection = await ctx.prisma.stripeConnection.findFirst({
        where: {
          organizationId: organization.id,
        },
      })

      if (!stripeConnection) {
        const account = await stripe.accounts.create({
          type: 'standard',
        })

        stripeConnection = await ctx.prisma.stripeConnection.create({
          data: {
            organizationId: organization.id,
            accountId: account.id,
            detailsSubmitted: account.details_submitted,
          },
        })
      }

      if (!stripeConnection.detailsSubmitted) {
        const appUrl = process.env.APP_URL || ''
        const accountLink = await stripe.accountLinks.create({
          account: stripeConnection.accountId,
          refresh_url: `${appUrl}/admin/stripe`,
          return_url: `${appUrl}/admin/stripe/confirmation`,
          type: 'account_onboarding',
        })

        return accountLink
      } else {
        return {
          url: 'Account successfully connected',
        }
      }
    } catch (e) {
      const error = e as Error
      console.error(
        'An error occurred when calling the Stripe API to create an account session',
        error.message
      )
      throw error
    }
  }),

  confirmAuthorization: orgProtectedProcedure.query(
    async ({ ctx }): Promise<StripeAuthorizationConfirmation> => {
      const { prisma, organization } = ctx
      const stripeConnection = await prisma.stripeConnection.findFirst({
        where: {
          organizationId: organization.id,
        },
      })

      if (!stripeConnection) {
        throw new Error(
          `No Stripe connection found for organization ${organization.name} [${organization.id}]. Can't complete onboarding.`
        )
      }

      try {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
          apiVersion: '2023-10-16',
        })

        // Retrieve the user's Stripe account and check if they have finished onboarding
        const account = await stripe.accounts.retrieve(
          stripeConnection.accountId
        )
        if (account.details_submitted) {
          const updatedStripeConnection = await prisma.stripeConnection.update({
            where: {
              id: stripeConnection.id,
            },
            data: {
              detailsSubmitted: account.details_submitted,
            },
          })

          return {
            success: true,
            connection: updatedStripeConnection,
          }
        } else {
          return {
            success: false,
            error:
              'The onboarding process was not completed. Please try again.',
            connection: stripeConnection,
          }
        }
      } catch (e) {
        const error = e as Error
        console.error(
          'An error occurred trying to complete Stripe onboarding',
          error.message
        )
        throw error
      }
    }
  ),
})
