# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SMILE Platform Backend — a healthcare supply chain management system built as a **Turborepo monorepo** using **Bun**, **TypeScript**, and **Hono.js**. Services communicate via RabbitMQ and expose HTTP APIs proxied through Nginx.

## Commands

### Root (all services)
```bash
pnpm install              # Install dependencies
pnpm dev                  # Start all services in watch mode
pnpm build                # Build all packages (includes kysely-codegen for DB types)
pnpm lint                 # ESLint across all packages
pnpm lint:fix             # Auto-fix ESLint issues
pnpm format               # Prettier formatting
pnpm test                 # Run tests (warehouse-service by default)
```

### Per-service (cd into apps/<service>)
```bash
pnpm dev                  # Watch mode for that service
pnpm build                # Compile + regenerate DB types
pnpm test                 # Run service tests
pnpm test:coverage        # Coverage report

# Warehouse-service uses vitest:
dotenvx run -f .env.test -- vitest run
dotenvx run -f .env.test -- vitest run src/path/to/test.ts   # Single test file

# Other services use Mocha + NYC:
npm run test:mocha
npm run test:api
```

### Database migrations (per-service)
```bash
npm run db:migrate        # Apply pending migrations
npm run db:rollback       # Rollback last migration
npm run db:seed           # Seed data
```

### Environment management (Makefile)
```bash
make env-dev              # Switch all services to .env.test.local
make env-staging          # Switch to .env.staging.local
make env-prod             # Switch to .env.production.local
make env-status           # Show current environment
```

### Infrastructure
```bash
docker-compose -f infra/compose-database.yml up -d    # MySQL + Redis
docker-compose -f infra/compose-message.yml up -d     # RabbitMQ
docker-compose -f infra/compose-storage.yml up -d     # MinIO
docker-compose up -d                                   # All app services
```

## Architecture

### Services

| Service | Port | Purpose |
|---------|------|---------|
| `apps/core` | 3000 | Auth, file storage, shared utilities |
| `apps/platform` | 3001/3002 | Multi-workspace service instances |
| `apps/auth-service` | 3003 | JWT authentication & user management |
| `apps/main` | 3004 | Core business logic, analytics |
| `apps/warehouse-service` | 3006 | Inventory & warehouse management |
| `apps/sync-service` | — | Data migration (SMILE 3.0→5.0) |
| `apps/interop-service` | — | External system interoperability |
| `apps/3.0/main-api` | 3007 | Legacy v3.0 API (backward compat) |
| `apps/3.0/warehouse-api` | 3009 | Legacy warehouse API |
| `apps/3.0/notification` | — | Push notifications |

All services sit behind **Nginx** (port 8080) for routing.

### Shared Library

`packages/lib` (imported as `@smile-health/lib`) exports:
- Database client (Kysely + MySQL)
- Error handling utilities
- Excel processing
- i18n helpers
- Pino logging with Loki integration
- OpenTelemetry tracing (OTLP export)
- MinIO client
- RabbitMQ client
- Feature flags (GrowthBook)

### Data Layer

- **MySQL 8** — transactional data (primary)
- **ClickHouse** — analytics/data warehouse (datamart + read replica)
- **Redis 7** — caching, sessions, rate limiting
- **Elasticsearch** — full-text search (main & warehouse services)
- **MinIO** — S3-compatible object storage (core service)

### Key Patterns

**Framework:** Hono.js for HTTP routing
**ORM:** Kysely (type-safe query builder) — DB types are auto-generated via `kysely-codegen` into `src/common/infrastructure/database/types/db.d.ts`
**Validation:** Zod schemas at all API boundaries
**Messaging:** RabbitMQ for inter-service events and background jobs
**Testing:** vitest (warehouse-service), Mocha + Chai + NYC (other services)

### Database Type Generation

Running `pnpm build` in any service regenerates the Kysely type definitions from the live database. Always regenerate after schema migrations before writing queries.

## Documentation

ADRs and architecture docs are in `adr/`:
- `PLATFORM_ARCHITECTURE_OVERVIEW.md` — full system design
- `databaseModels.md` — schema reference
- `authentication.md` — auth implementation
- `cursor-pagination-guide.md` — pagination patterns
- `lib-documentation.md` — `@smile-health/lib` reference
