// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
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
  tracesSampleRate: 1,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
})
