import { createNextApiHandler } from '@trpc/server/adapters/next'

import { env } from '../../../env.mjs'
import { createTRPCContext } from '../../../server/api/trpc'
import { appRouter } from '../../../server/api/root'

import * as Sentry from '@sentry/node'

import { initSentry } from 'utils/sentry'

initSentry()

// export API handler
export default createNextApiHandler({
  router: appRouter,
  createContext: createTRPCContext,
  onError(opts) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { error, type, path, input, ctx, req } = opts

    if (env.NODE_ENV === 'development') {
      console.error(
        `❌ tRPC failed on ${path ?? '<no-path>'}: ${error.message}`
      )
    } else {
      if (error.code === 'UNAUTHORIZED') {
        console.error(`Unauthorized access attempt on ${error.message}`)
      } else {
        // Only logging 500s might be too aggressive, but might use this later if
        //      we're seeing a lot of noise
        // if (error.code === 'INTERNAL_SERVER_ERROR') {
        Sentry.captureException(error.cause ? error.cause : error)
      }
    }
  },
})
