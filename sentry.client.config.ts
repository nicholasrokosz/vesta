// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs'

let sentryEnv = process.env.NODE_ENV as string
if (!!process.env.NEXT_PUBLIC_SENTRY_ENV) {
  sentryEnv = process.env.NEXT_PUBLIC_SENTRY_ENV
}

Sentry.init({
  dsn: 'https://f69c3470c332471a9c81b03621a0a11b@o4504889795674112.ingest.sentry.io/4504889797181440',

  environment: sentryEnv,

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 0.1,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  replaysOnErrorSampleRate: 1.0,

  // This sets the sample rate to be 10%. You may want this to be 100% while
  // in development and sample at a lower rate in production
  replaysSessionSampleRate: sentryEnv === 'production' ? 1.0 : 0,

  // You can remove this option if you're not planning to use the Sentry Session Replay feature:
  integrations: [
    new Sentry.Replay({
      // Additional Replay configuration goes in here, for example:
      maskAllText: false,
      maskAllInputs: false,
      blockAllMedia: false,
    }),
  ],
})
