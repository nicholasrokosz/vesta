import type { Task } from 'graphile-worker'
import { run } from 'graphile-worker'
import { join, parse, resolve } from 'path'
import { initSentry } from 'utils/sentry'
// import { server } from './mocks/node'

const tasks = [
  'bookingpal-photos-publish',
  'bookingpal-photos-verify',
  'bookingpal-publish-pricing',
  'bookingpal-sync-all-availabilities',
  'bookingpal-sync-listing-availabilities',
  'pricelabs-sync-calendar',
  'pricelabs-sync-prices',
  'pricelabs-sync-reservations',
  'pricelabs-sync-all-listing-reservations',
  'revenue-reconcile-transaction',
  'bookingpal-sync-all-reservations',
  'bookingpal-sync-listing-reservations',
]

async function main() {
  // // To enable MSW (mock server), uncomment
  // // This will intercept requests made by the worker and return the mocked response,
  // // when there is one defined in the handlers.ts file
  // // For more information see https://mswjs.io/docs/integrations/node
  // server.listen()
  // // This just adds some extra logging
  // // server.events.on('request:start', ({ request }) => {
  // //   console.log('MSW intercepted:', request.method, request.url)
  // // })
  // // End mock server

  initSentry()

  // Graphile Worker doens't load TS files, so we need to load them manually
  //     https://github.com/graphile/worker/issues/197
  const taskDirectory = resolve(__dirname, '../tasks')
  const taskList = Object.fromEntries(
    tasks.map((taskFile) => [
      parse(taskFile).name,

      // eslint-disable-next-line @typescript-eslint/no-var-requires
      require(join(taskDirectory, taskFile)) as Task,
    ])
  )

  const databaseUrl = process.env.DATABASE_URL

  if (!databaseUrl) {
    throw new Error('You must provide the DATABASE_URL environment variable!')
  }

  const concurrency = parseInt(process.env.WORKER_CONCURRENCY || '5')
  console.log(`Running with concurrency of ${concurrency}`)

  const runner = await run({
    connectionString: databaseUrl,
    concurrency: concurrency,
    noHandleSignals: false,
    pollInterval: 1000,
    taskList: taskList,
    crontabFile: join(taskDirectory, 'crontab'),
  })

  await runner.promise
}

main().catch((err: Error) => {
  console.error(err)
  process.exit(1)
})
