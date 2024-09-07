#!/bin/bash

# Export secrets from file on Render
set -o allexport
source /etc/secrets/.env-api
set +o allexport

echo "**** Installing dependencies..."
yarn install
echo "**** Finished installing dependencies."

echo "**** Building application..."
yarn build
echo "**** Finished building application."

echo "**** Pushing database migrations..."
yarn prisma migrate deploy
echo "**** Finished pushing database migrations."
