#!/bin/bash

# Export secrets from file on Render
set -o allexport
source /etc/secrets/.env-api
set +o allexport

echo "**** Seeding database..."
yarn prisma db seed
yarn tsx --tsconfig tsconfig.cli.json src/server/scripts/seed/seedRates.ts
yarn tsx --tsconfig tsconfig.cli.json src/server/scripts/seed/seedReconciliation.ts
echo "**** Finished seeding database."
