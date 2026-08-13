#!/usr/bin/env bash
# Seed reference/master data into the wms-encore database.
#
# Runs each db/seeds/*.sql file (in filename order) through `encore db shell`, the same
# mechanism scripts/smoke-test.sh uses to talk to the local Postgres instance Encore manages —
# there is no standalone DATABASE_URL to hand to a plain `psql`/tsx script outside of `encore run`.
#
# Each seed file is plain, idempotent SQL (ON CONFLICT / NOT EXISTS guards), mirroring the old
# apps/wms-service Sequelize seeders it replaces. Safe to run multiple times.
set -euo pipefail

DB_NAME="${DB_NAME:-wms}"
DB_ENV="${DB_ENV:-local}"
SEEDS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/db/seeds"

echo "Seeding database '$DB_NAME' (env: $DB_ENV) from $SEEDS_DIR"

for file in "$SEEDS_DIR"/*.sql; do
  echo "== Applying $(basename "$file") =="
  encore db shell "$DB_NAME" --env="$DB_ENV" < "$file"
done

echo "Seeding complete."
