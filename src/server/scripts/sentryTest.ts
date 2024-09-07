import * as Sentry from '@sentry/node'

Sentry.init({
  dsn: 'https://538324063f7241bd8172b66c30d1fde8@o4504889795674112.ingest.sentry.io/4505150354292736',
  environment: process.env.NODE_ENV,

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
})

const transaction = Sentry.startTransaction({
  op: 'test',
  name: 'My First Test Transaction',
})

function foo() {
  console.log('foo')
}

setTimeout(() => {
  try {
    foo()
    throw new Error(`${process.env.NODE_ENV} Catch this?`)
  } catch (e) {
    Sentry.captureException(e)
  } finally {
    transaction.finish()
  }
}, 99)
