/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1).
 * 2. You want to create a new middleware or type of procedure (see Part 3).
 *
 * tl;dr - This is where all the tRPC server stuff is created and plugged in.
 * The pieces you will need to use are documented accordingly near the end.
 */

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the
 * database, the session, etc.
 */
import { type CreateNextContextOptions } from '@trpc/server/adapters/next'
import { type Session } from 'next-auth'

import { getServerAuthSession } from '../auth'
import { prisma } from '../db'

type CreateContextOptions = {
  session: Session | null
  user: User | null
  organization: Organization | null
}

/**
 * This helper generates the "internals" for a tRPC context. If you need to use
 * it, you can export it from here.
 *
 * Examples of things you may need it for:
 * - testing, so we don't have to mock Next.js' req/res
 * - tRPC's `createSSGHelpers`, where we don't have req/res
 *
 * @see https://create.t3.gg/en/usage/trpc#-servertrpccontextts
 */
const createInnerTRPCContext = (opts: CreateContextOptions) => {
  return {
    ...opts,
    prisma,
  }
}

/**
 * This is the actual context you will use in your router. It will be used to
 * process every request that goes through your tRPC endpoint.
 *
 * @see https://trpc.io/docs/context
 */
export const createTRPCContext = async (opts: CreateNextContextOptions) => {
  const { req, res } = opts

  // Get the session from the server using the getServerSession wrapper function
  const session = await getServerAuthSession({ req, res })

  return createInnerTRPCContext({
    session: session,
    user: null,
    organization: null,
  })
}

/**
 * 2. INITIALIZATION
 *
 * This is where the tRPC API is initialized, connecting the context and
 * transformer.
 */
import { initTRPC, TRPCError } from '@trpc/server'
import superjson from 'superjson'
import {
  GlobalRole,
  OrganizationRole,
  type Organization,
  type User,
} from '@prisma/client'
import { z } from 'zod'
import ServiceFactory from 'server/services/serviceFactory'

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape }) {
    return shape
  },
})

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these
 * a lot in the "/src/server/api/routers" directory.
 */

/**
 * This is how you create new routers and sub-routers in your tRPC API.
 *
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router

// import * as Sentry from '@sentry/node'
// const sentryMiddleware = t.middleware(
//   Sentry.Handlers.trpcMiddleware({
//     attachRpcInput: true,
//   })
// )

const accessLogger = t.middleware(async ({ path, type, next }) => {
  const start = Date.now()
  const result = await next()
  const durationMs = Date.now() - start

  let userInfo = {}
  let orgInfo = {}
  if ('ctx' in result) {
    const ctx = result.ctx as CreateContextOptions

    if (!!ctx.user) {
      userInfo = { user: ctx.user.id }
    }

    if (!!ctx.organization) {
      orgInfo = { organization: ctx.organization.id }
    }
  }

  console.log(
    JSON.stringify({
      statusOk: result.ok,
      ...userInfo,
      ...orgInfo,
      path,
      type,
      durationMs,
    })
  )

  return result
})

/**
 * Reusable middleware that enforces users are logged in before running the
 * procedure.
 */
const userAuthMiddleware = t.middleware(async ({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }

  // Loading User model from DB, which is different that the session's User model (from NextAuth)
  const user = await ctx.prisma.user.findUnique({
    where: {
      id: ctx.session.user.id,
    },
    include: {
      organization: true,
    },
  })

  return next({
    ctx: {
      user: user,
    },
  })
})

const userInOrgMiddleware = userAuthMiddleware.unstable_pipe(
  async ({ ctx, next }) => {
    const user = ctx.user

    if (
      !user ||
      !user.organization ||
      user.organizationRole === OrganizationRole.PROPERTY_OWNER
    ) {
      throw new TRPCError({ code: 'UNAUTHORIZED' })
    }

    return next({
      ctx: {
        user: user,
        organization: user.organization,
      },
    })
  }
)

const superAdminMiddleware = t.middleware(async ({ ctx, next }) => {
  const user = ctx.user

  if (!user || user.globalRole !== GlobalRole.SUPERADMIN) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }

  return next({
    ctx: {},
  })
})

const listingKeyMiddleware = t.middleware(async ({ ctx, next, rawInput }) => {
  const inputSchema = z.object({ key: z.string() })
  const result = inputSchema.safeParse(rawInput)
  if (!result.success) throw new TRPCError({ code: 'BAD_REQUEST' })
  const listingKey = result.data.key

  const factory = await ServiceFactory.fromListingKey(ctx.prisma, listingKey)
  const listing = await factory.getListingService().getByKey(listingKey)

  if (!listing || !listing.organization) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }

  return next({
    ctx: {
      organization: listing.organization,
      listing: listing,
    },
  })
})

const ownerInOrgMiddleware = userAuthMiddleware.unstable_pipe(
  async ({ ctx, next }) => {
    const user = ctx.user

    if (
      !user ||
      !user.organization ||
      user.organizationRole !== OrganizationRole.PROPERTY_OWNER
    ) {
      throw new TRPCError({ code: 'UNAUTHORIZED' })
    }

    return next({
      ctx: {
        user: user,
        organization: user.organization,
      },
    })
  }
)

/**
 * Public (unauthenticated) procedure
 *
 * This is the base piece you use to build new queries and mutations on your
 * tRPC API. It does not guarantee that a user querying is authorized, but you
 * can still access user session data if they are logged in.
 */
export const publicProcedure = t.procedure

export const unprotectedProcedure = publicProcedure
  // .use(sentryErrorMiddleware)
  .use(accessLogger)

/**
 * Protected (authenticated) procedure
 *
 * If you want a query or mutation to ONLY be accessible to logged in users, use
 * this. It verifies the session is valid and guarantees `ctx.session.user` is
 * not null.
 *
 * @see https://trpc.io/docs/procedures
 */
export const protectedProcedure = unprotectedProcedure.use(userAuthMiddleware)
export const orgProtectedProcedure = protectedProcedure.use(userInOrgMiddleware)
export const superAdminProtectedProcedure =
  protectedProcedure.use(superAdminMiddleware)
export const listingKeyProtectedProcedure =
  unprotectedProcedure.use(listingKeyMiddleware)
export const ownerProtectedProcedure =
  protectedProcedure.use(ownerInOrgMiddleware)
