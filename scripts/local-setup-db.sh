#!/bin/bash

# Build containers
docker compose up --no-start

# Start container in background
docker compose start

# Some time for the DB to boot up
sleep 2

yarn db:migrate
