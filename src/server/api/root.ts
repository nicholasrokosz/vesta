import { createTRPCRouter, publicProcedure, unprotectedProcedure } from './trpc'
import { listingRouter } from './routers/listing'
import { calendarRouter } from './routers/calendar'
import { messagesRouter } from './routers/messages'
import { automationsRouter } from './routers/automations'
import { userRouter } from './routers/user'
import { organizationsRouter } from './routers/organizations'
import { addressesRouter } from './routers/addresses'
import { revenueRouter } from './routers/revenue'
import { ownerStatementRouter } from './routers/ownerStatements'
import { expenseRouter } from './routers/expenses'
import { plaidRouter } from './routers/plaid'
import { guestRouter } from './routers/guest'
import { directRouter } from './routers/direct'
import { stripeRouter } from './routers/stripe'
import { ownerRouter } from './routers/owner'
import { reconciliationRouter } from './routers/reconciliation'

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here
 */
export const appRouter = createTRPCRouter({
  addresses: addressesRouter,
  automations: automationsRouter,
  calendar: calendarRouter,
  direct: directRouter,
  health: publicProcedure.query(() => 'operational'),
  error: unprotectedProcedure.query(() => {
    throw new Error(`[${process.env.NODE_ENV}] Catch this?`)
  }),
  expenses: expenseRouter,
  guest: guestRouter,
  listing: listingRouter,
  messages: messagesRouter,
  organizations: organizationsRouter,
  owner: ownerRouter,
  ownerStatements: ownerStatementRouter,
  plaid: plaidRouter,
  revenue: revenueRouter,
  stripe: stripeRouter,
  user: userRouter,
  reconciliation: reconciliationRouter,
})

// export type definition of API
export type AppRouter = typeof appRouter
