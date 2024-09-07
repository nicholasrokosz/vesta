# Vesta App

![Build status](https://github.com/Vesta-Software/vesta/actions/workflows/main.yml/badge.svg)

## Prequisites

- Install `nvm` and `yarn`

  ```bash
  # For Macs
  brew install nvm
  npm install -g yarn
  ```

- Install [Docker](https://www.docker.com/) on your system
- Install [Ngrok](https://ngrok.com/) on your system

## Get started

- Clone the repository and `cd` into project directory
- Run `yarn` to install dependencies
- Run `cp .env.example .env.local` to copy necessary environment variables
- Set the `AUTH0_SECRET` and `NEXTAUTH_SECRET` in your `.env.local` file.
  - The Auth0 secret will be provided.
  - There are instructions for generating a Next secret, which is unique to your instance.
- Set the `POSTMARK_API_KEY` in your `.env.local` file.
  - The Postmark apiKey will be provided.
- Set the `GOOGLE_API_KEY` in your `.env.local` file.
  - The Google apiKey will be provided.
- Set the `APP_URL` in your `.env.local` file to `http://localhost:3000`
- Set up your local database server with Docker

  ```bash
  ./scripts/local-setup-db.sh
  ```

- Run `yarn db:migrate` to migrate and seed your local database database
  - You can also run `yarn db:reset` to blow away your existing database schema and regenerate it from scratch
- Run `yarn dev` to start your [development server](http://localhost:3000)
- Run `yarn dev:processScheduledMessages` (in a separate terminal) to process any scheduled messages
- Run `yarn dev:processReservationAvailability` (in a separate terminal) to process any pending availability requests
- Run `yarn dev:processGetMessageThreads` (in a separate terminal) to check BP messages for all orgs
- Run `yarn dev:processGetPlaidTransactions` (in a separate terminal) to get Plaid transactions for all orgs

## Testing

## Unit tests

Unit tests are used to test business logic within the application.

- Run unit tests with `yarn test`

## Integration tests

Integration tests utilize Playwright to test the application from the perspective of a user. The tests require your server to be running and are designed to work against the seed data defined in `prisma/seed.ts`.

- If this is your first time running: `npx playwright install`
- Run integration tests with `yarn test:integration`
- Run the Playwright UI `yarn test:integration:ui`

## Receiving inbound email messages locally

In order to receive inbound email messages locally, you must first expose a tunnel via ngrok.

- Run `yarn ngrok` to start a tunnel
- Copy the "Forwarding" url that ngrok returns

Switch over to the Postmark sandbox.

- Modify the Default Inbound Stream, pointing the Webhook to the ngrok url + "/api/webhooks/email/incoming".

## Architecture decisions

[Major technical design decisions](./doc/adr/decisions.md) are recorded as [architecture decision records](https://adr.github.io/) in the project repository. They are managed with [adr-tools](https://github.com/meza/adr-tools).

<br>
<br>
<br>

**NB:** Everything below is what's included by the CT3A CLI

## Create T3 App

This is a [T3 Stack](https://create.t3.gg/) project bootstrapped with `create-t3-app`.

### What's next? How do I make an app with this?

We try to keep this project as simple as possible, so you can start with just the scaffolding we set up for you, and add additional things later when they become necessary.

If you are not familiar with the different technologies used in this project, please refer to the respective docs. If you still are in the wind, please join our [Discord](https://t3.gg/discord) and ask for help.

- [Next.js](https://nextjs.org)
- [NextAuth.js](https://next-auth.js.org)
- [Prisma](https://prisma.io)
- [tRPC](https://trpc.io)

### Learn More

To learn more about the [T3 Stack](https://create.t3.gg/), take a look at the following resources:

- [Documentation](https://create.t3.gg/)
- [Learn the T3 Stack](https://create.t3.gg/en/faq#what-learning-resources-are-currently-available) — Check out these awesome tutorials

You can check out the [create-t3-app GitHub repository](https://github.com/t3-oss/create-t3-app) — your feedback and contributions are welcome!

### How do I deploy this?

Follow our deployment guides for [Vercel](https://create.t3.gg/en/deployment/vercel), [Netlify](https://create.t3.gg/en/deployment/netlify) and [Docker](https://create.t3.gg/en/deployment/docker) for more information.
# vesta
