#!/bin/sh
set -eu

for sql in /docker-entrypoint-initdb.d/app-migrations/*.sql; do
  echo "$0: running $sql"
  psql -v ON_ERROR_STOP=1 --no-password --no-psqlrc -U supabase_admin -d "${POSTGRES_DB:-postgres}" -f "$sql"
done

echo "$0: running /docker-entrypoint-initdb.d/app-seed/seed.sql"
psql -v ON_ERROR_STOP=1 --no-password --no-psqlrc -U supabase_admin -d "${POSTGRES_DB:-postgres}" -f /docker-entrypoint-initdb.d/app-seed/seed.sql
