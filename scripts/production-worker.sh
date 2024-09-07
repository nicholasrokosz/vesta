#!/bin/bash

# Export secrets from file on Render
set -o allexport
source /etc/secrets/.env-api
set +o allexport

yarn start:worker
