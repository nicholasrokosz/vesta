/* eslint-disable @typescript-eslint/ban-ts-comment */
import { z } from 'zod'

/**
 * Specify your server-side environment variables schema here.
 * This way you can ensure the app isn't built with invalid env vars.
 */
const server = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']),
  DATABASE_URL: z.string().url(),
  APP_URL: z.string().url(),

  NEXTAUTH_SECRET:
    process.env.NODE_ENV === 'production'
      ? z.string().min(1)
      : z.string().min(1).optional(),
  NEXTAUTH_URL: z.preprocess(
    // This makes Vercel deployments not fail if you don't set NEXTAUTH_URL
    // Since NextAuth.js automatically uses the VERCEL_URL if present.
    (str) => process.env.VERCEL_URL ?? str,
    // VERCEL_URL doesn't include `https` so it cant be validated as a URL
    process.env.VERCEL ? z.string().min(1) : z.string().url()
  ),
  // Add `.min(1) on ID and SECRET if you want to make sure they're not empty
  AUTH0_ID: z.string(),
  AUTH0_SECRET: z.string(),
  AUTH0_ISSUER: z.string(),

  BOOKING_PAL_USERNAME: z.string(),
  BOOKING_PAL_PASSWORD: z.string(),
  BOOKING_PAL_API_KEY: z.string(),
  BOOKING_PAL_BASE_URI: z.string(),
  BOOKING_PAL_WEBHOOK_UNIQUE_KEY: z.string(),

  POSTMARK_API_KEY: z.string(),
  POSTMARK_FROM_ADDRESS: z.string().default('help@getvesta.io'),

  GOOGLE_API_KEY: z.string(),

  OPENAI_API_KEY: z.string(),

  TWILIO_ACCOUNT_SID: z.string(),
  TWILIO_AUTH_TOKEN: z.string(),
  TWILIO_PHONE_NUMBER: z.string(),

  PLAID_CLIENT_ID: z.string(),
  PLAID_CLIENT_SECRET: z.string(),
  PLAID_ENV: z.string(),

  PRICELABS_API_BASE_URL: z.string(),
  PRICELABS_API_NAME: z.string(),
  PRICELABS_API_TOKEN: z.string(),

  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string(),
  STRIPE_SECRET_KEY: z.string(),
})

/**
 * Specify your client-side environment variables schema here.
 * This way you can ensure the app isn't built with invalid env vars.
 * To expose them to the client, prefix them with `NEXT_PUBLIC_`.
 */
const client = z.object({
  // NEXT_PUBLIC_CLIENTVAR: z.string().min(1),
})

/**
 * You can't destruct `process.env` as a regular object in the Next.js
 * edge runtimes (e.g. middlewares) or client-side so we need to destruct manually.
 * @type {Record<keyof z.infer<typeof server> | keyof z.infer<typeof client>, string | undefined>}
 */
const processEnv = {
  NODE_ENV: process.env.NODE_ENV,
  DATABASE_URL: process.env.DATABASE_URL,
  APP_URL: process.env.APP_URL,

  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  // NEXT_PUBLIC_CLIENTVAR: process.env.NEXT_PUBLIC_CLIENTVAR,

  AUTH0_ID: process.env.AUTH0_ID,
  AUTH0_SECRET: process.env.AUTH0_SECRET,
  AUTH0_ISSUER: process.env.AUTH0_ISSUER,

  BOOKING_PAL_USERNAME: process.env.BOOKING_PAL_USERNAME,
  BOOKING_PAL_PASSWORD: process.env.BOOKING_PAL_PASSWORD,
  BOOKING_PAL_API_KEY: process.env.BOOKING_PAL_API_KEY,
  BOOKING_PAL_BASE_URI: process.env.BOOKING_PAL_BASE_URI,
  BOOKING_PAL_WEBHOOK_UNIQUE_KEY: process.env.BOOKING_PAL_WEBHOOK_UNIQUE_KEY,

  POSTMARK_API_KEY: process.env.POSTMARK_API_KEY,
  POSTMARK_FROM_ADDRESS: process.env.POSTMARK_FROM_ADDRESS,
  POSTMARK_INBOUND_ADDRESS: process.env.POSTMARK_INBOUND_ADDRESS,

  GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,

  TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
  TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER,

  PLAID_CLIENT_ID: process.env.PLAID_CLIENT_ID,
  PLAID_CLIENT_SECRET: process.env.PLAID_CLIENT_SECRET,
  PLAID_ENV: process.env.PLAID_ENV,

  PRICELABS_API_BASE_URL: process.env.PRICELABS_API_BASE_URL,
  PRICELABS_API_TOKEN: process.env.PRICELABS_API_TOKEN,
  PRICELABS_API_NAME: process.env.PRICELABS_API_NAME,

  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
}

// Don't touch the part below
// --------------------------

const merged = server.merge(client)
/** @type z.infer<merged>
 *  @ts-ignore - can't type this properly in jsdoc */
let env = process.env

if (!!process.env.SKIP_ENV_VALIDATION == false) {
  const isServer = typeof window === 'undefined'

  const parsed = isServer
    ? merged.safeParse(processEnv) // on server we can validate all env vars
    : client.safeParse(processEnv) // on client we can only validate the ones that are exposed

  if (parsed.success === false) {
    console.error(
      '❌ Invalid environment variables:',
      parsed.error.flatten().fieldErrors
    )
    throw new Error('Invalid environment variables')
  }

  /** @type z.infer<merged>
   *  @ts-ignore - can't type this properly in jsdoc */
  env = new Proxy(parsed.data, {
    get(target, prop) {
      if (typeof prop !== 'string') return undefined
      // Throw a descriptive error if a server-side env var is accessed on the client
      // Otherwise it would just be returning `undefined` and be annoying to debug
      if (!isServer && !prop.startsWith('NEXT_PUBLIC_'))
        throw new Error(
          process.env.NODE_ENV === 'production'
            ? '❌ Attempted to access a server-side environment variable on the client'
            : `❌ Attempted to access server-side environment variable '${prop}' on the client`
        )
      /*  @ts-ignore - can't type this properly in jsdoc */
      return target[prop]
    },
  })
}

export { env }
