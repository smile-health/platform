# smile-encore

An exploratory rewrite of the SMILE platform's backend on [Encore.ts](https://encore.dev), covering the basics:
login and CRUD, wired to the **real, existing SMILE infrastructure** rather than fresh sandboxed infra.

- `auth/` — login against the existing SMILE Keycloak realm, plus an Encore `authHandler` that verifies
  access tokens locally via Keycloak's JWKS (no per-request network round trip).
- `materials/` — CRUD against the **real, existing** `materials` table in the shared `dev_smile_health`
  MySQL database (the same one `apps/core` / `apps/main` use) — not a fresh table. See "About the materials
  table" below.
- `frontend/` — a plain Vite + React app (Encore itself is backend-only; there's no "Encore frontend"). It
  talks to the backend through Encore's generated typed client (`frontend/src/lib/client.ts`).

## Why this isn't a from-scratch Postgres/sqldb setup

Encore.ts's built-in `sqldb` package only provisions/manages Postgres. Since SMILE runs on MySQL, this app
bypasses `sqldb` entirely and talks to MySQL directly via `mysql2` + `Kysely` (`materials/db.ts`), the same
combination `packages/lib` already uses elsewhere in the monorepo.

Likewise, Encore's auth story is just an `authHandler` you implement yourself — there's no bundled identity
provider. `auth/keycloak.ts` calls the existing Keycloak realm's password grant for login, and verifies
tokens against that realm's JWKS for every authenticated request.

## About the materials table

The `materials` table in `dev_smile_health` is **live data used by the real warehouse/inventory system**
(1,300+ rows as of writing), not a demo table — it has a much richer schema than a typical CRUD example
(material levels, units of consumption/distribution, pricing, soft-delete, audit columns, etc.). This app's
CRUD:

- Only exposes `name`, `description`, `code` and `status` as editable — other reference columns
  (`material_level_id`, `unit_of_consumption_id`, etc.) get sensible defaults on create and are left alone
  on update.
- Soft-deletes via `deleted_at`/`deleted_by`, matching the table's existing convention — it never hard-deletes.
- Resolves `created_by`/`updated_by` from the logged-in Keycloak user via `users.keycloak_uuid` (falls back
  to `0` if no matching SMILE user row exists).
- Paginates `list` (default 25, max 100 per page) since the table isn't small.

Treat this as a real integration, not a sandbox — anything created through this app's UI is a real row in
that table.

## Environment

Copy `.env.example` to `.env` and fill in the same values used by `apps/core/.env` (DB) and
`apps/auth-service/.env` (Keycloak) — this app is meant to share those, not stand up its own instances.

## Running locally

```bash
# Backend (from this directory)
pnpm install
encore run                 # serves the API at http://localhost:4000, dev dashboard at :9400

# Frontend (in another terminal, from frontend/)
pnpm install
pnpm dev                   # serves the app at http://localhost:5173

# Regenerate the typed client after changing any backend API shape:
pnpm run gen-client        # (from frontend/, requires `encore run` to be running)
```

Log in with any existing SMILE / Keycloak account for the `smile-health` realm.
