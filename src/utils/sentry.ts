import * as Sentry from '@sentry/node'

export const initSentry = (() => {
  let hasRun = false

  return () => {
    if (!hasRun) {
      console.log('Initializing Sentry...')
      let sentryEnv = process.env.NODE_ENV as string
      if (!!process.env.NEXT_PUBLIC_SENTRY_ENV) {
        sentryEnv = process.env.NEXT_PUBLIC_SENTRY_ENV
      }

      Sentry.init({
        dsn: 'https://f69c3470c332471a9c81b03621a0a11b@o4504889795674112.ingest.sentry.io/4504889797181440',
        environment: sentryEnv,
        // We recommend adjusting this value in production, or using tracesSampler
        // for finer control
        tracesSampleRate: 1.0,
      })
      hasRun = true
      console.log('Sentry initialized.')
    } else {
      console.log('Sentry has already been initialized')
    }
  }
})()

export const captureErrorsInSentry = function <T>(promise: Promise<T>) {
  promise.catch((error) => {
    initSentry()
    Sentry.captureException(error)
  })

  return promise
}
