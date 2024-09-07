#!/bin/bash

if [ -z "$1" ]
  then echo "Please provide a SQL dump file to load"
  exit 1
fi

DUMP_FILE=$1

if [ ! -f $DUMP_FILE ]; then
  echo "SQL dump file could not be found: $DUMP_FILE"
  exit 1
fi

docker compose stop
docker compose rm -f
docker compose up --no-start
docker compose start

sleep 2

docker compose exec --no-TTY postgres /bin/bash -c "PGPASSWORD=vesta psql --username vesta postgres -c 'CREATE DATABASE vesta_db TEMPLATE template0'"
docker compose exec --no-TTY postgres /bin/bash -c "PGPASSWORD=vesta psql --username vesta vesta_db" < $DUMP_FILE


