# SMILE Platform Backend

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![Bun](https://img.shields.io/badge/Bun-1.3-black?logo=bun&labelColor=000000)](https://bun.sh/)
[![Turborepo](https://img.shields.io/badge/Turborepo-2.x-ef4444?logo=turborepo&labelColor=000000)](https://turbo.build/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Hono](https://img.shields.io/badge/Hono-4.x-E36002?logoColor=white)](https://hono.dev/)

<!-- apps/core unit tests — update these after each pnpm test:unit:coverage run -->
[![Unit Tests](https://img.shields.io/badge/unit%20tests-64%20passing-brightgreen?logo=checkmarx&logoColor=white)](apps/core/src/tests/unit)
[![Coverage Functions](https://img.shields.io/badge/functions-98.81%25-brightgreen?logo=codecov&logoColor=white)](apps/core/coverage/lcov.info)
[![Coverage Lines](https://img.shields.io/badge/lines-99.62%25-brightgreen?logo=codecov&logoColor=white)](apps/core/coverage/lcov.info)

<!-- SonarQube — replace <SONAR_HOST_URL> and <PROJECT_BADGE_TOKEN> with your instance values -->
<!-- [![Quality Gate](<SONAR_HOST_URL>/api/project_badges/measure?project=smile-platform-backend&metric=alert_status&token=<PROJECT_BADGE_TOKEN>)](<SONAR_HOST_URL>/dashboard?id=smile-platform-backend) -->
<!-- [![Coverage](<SONAR_HOST_URL>/api/project_badges/measure?project=smile-platform-backend&metric=coverage&token=<PROJECT_BADGE_TOKEN>)](<SONAR_HOST_URL>/dashboard?id=smile-platform-backend) -->
<!-- [![Bugs](<SONAR_HOST_URL>/api/project_badges/measure?project=smile-platform-backend&metric=bugs&token=<PROJECT_BADGE_TOKEN>)](<SONAR_HOST_URL>/dashboard?id=smile-platform-backend) -->
<!-- [![Security Rating](<SONAR_HOST_URL>/api/project_badges/measure?project=smile-platform-backend&metric=security_rating&token=<PROJECT_BADGE_TOKEN>)](<SONAR_HOST_URL>/dashboard?id=smile-platform-backend) -->

SMILE Platform Backend - A modern monorepo built with Bun, TypeScript, and Turborepo

## Apps

| App | Purpose |
|-----|---------|
| `apps/core` | Auth, file storage, shared utilities |
| `apps/platform` | Multi-workspace service instances |
| `apps/auth-service` | JWT authentication & user management |
| `apps/main` | Core business logic, analytics |
| `apps/warehouse-service` | Warehouse Management — stock, inventory, asset-inventory |
| `apps/wms-service` | Waste Management System backend — lifted from the standalone `wms` + `wms-migrations` repos (Express/Sequelize, kept as-is). Auth was cut over to call `apps/core`'s `/account/profile` internally instead of an external SSO handoff. The rest of its API calls still hit the standalone wms backend host until routing is merged in a future iteration |
| `apps/web` | Main Next.js frontend. Now also hosts the merged WMS frontend under `pages/wms/[lang]/**` (source in `apps/web/wms-module/`) — previously a separate app (`frontend-turborepo/apps/wms`) reached via `/wms/validate-token` cross-origin handoff; that handoff is gone now that it's the same session, gated instead by an inline `WmsAuthGate` |
| `apps/interop-service` | External system interoperability |
| `apps/notification` | Push notifications |

## License

This project is licensed under the GNU Affero General Public License v3.0 (AGPL-3.0). See the [LICENSE](LICENSE) file for details.

## Technology Stack

- **Runtime**: [Bun](https://bun.sh/) - Fast JavaScript runtime
- **Monorepo**: [Turborepo](https://turbo.build/) - Build system for monorepos
- **Package Manager**: pnpm 9.12.3
- **Node.js 18+** - Compatible runtime
- **TypeScript 5+** - Full type safety
- **Native ESM Modules** - Modern module system
- [tsx: Node.js enhanced to run TypeScript & ESM files](https://github.com/privatenumber/tsx)
- [tsc-alias: Import path alias using `@/` prefix](https://github.com/justkey007/tsc-alias)
- **Framework**: Hono.js
- **Database**: Kysely for query Builder & migrations
- **Logging**: Pino for logging
- **Queue**: RabbitMQ for job queue
- **Code Quality**: ESLint & Prettier — linting & formatting
- **Email**: [jsx-email](https://github.com/shellscape/jsx-email) for email templating
- **Testing**: vitest for testing
- **Environment**: znv for type safe env
- **Test Data**: Faker for generate fake data
- **Date/Time**: dayjs for handling date-time

## Quick Start

### 1. Clone repo

clone repo without commit history

```bash
git clone https://github.com/smile-platform/backend.git
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Setup .env in each apps folder

```bash
cp .env.example .env
```

> `apps/web`'s `.env` needs a few WMS-specific vars for the merged `pages/wms/**` module: `WMS_API_URL`, `WMS_STORAGE_PREFIX`, `SMILE_STORAGE_PREFIX`, `NEXT_PUBLIC_URL_FE_SMILE`, `KESLING_PATH`. See the comments above them in `apps/web/.env.development` for what each one is for and why they're kept distinct from this app's own `API_URL`/`STORAGE_PREFIX`.

### 4. Run build (will run kysely-codegen)

```bash
turbo build
```

### 5. Run the development server

```bash
turbo dev
```

## Available scripts

- `npm run dev` - Starts the application in development mode at.
- `npm run build` - Compile the application.
- `npm start` - Starts the application in production mode.
- `npm run lint` - Check code using ESLint.
- `npm run lint:fix` - Fix autofixable ESLint problem.
- `npm run format:all` - Format code using Prettier for all files.
- `npm run format:check` - Check code format using prettier.

## Kysely/migration scripts

- `npx kysely migrate:down` - Undo the last/specified migration that was run.
- `npx kysely migrate:latest` - Update the database schema to the latest version.
- `npx kysely migrate:list` - List both completed and pending migrations.

## Documentation

- [Architecture Overview](adr/PLATFORM_ARCHITECTURE_OVERVIEW.md)
- [API Documentation](adr/apitest.md)
- [Database Models](adr/databaseModels.md)
- [Infrastructure Monitoring](adr/INFRASTRUCTURE_MONITORING.md)
- [Troubleshooting](adr/TIMEOUT_TROUBLESHOOTING.md)
- [Service Statuses](adr/SERVICE_STATUSES.md)

### WMS merge notes

The Waste Management System frontend and backend, previously two separate repos
(`frontend-turborepo/apps/wms` and `wms`/`wms-migrations`), have been merged into this
monorepo:

- Backend: `apps/wms-service` (Express/Sequelize, unchanged stack), with `wms-migrations`'
  migrations/seeders under `apps/wms-service/db/`. Auth now calls `apps/core`'s
  `/account/profile` internally rather than an external SMILE_BE_URL callback. Everything
  else still targets the standalone wms backend host (`WMS_API_URL`) — full backend
  routing consolidation is a future iteration.
- Frontend: routes at `apps/web/pages/wms/[lang]/**`, source in `apps/web/wms-module/`.
  Runs its own Redux store and an isolated i18next instance (see
  `wms-module/provider/WmsProviders.tsx`), mounted only for `/wms/*` routes via
  `pages/_app.js`. The old cross-origin `/wms/validate-token` handoff is gone — replaced
  by `wms-module/components/WmsAuthGate.tsx`, which checks the shared login cookie inline.

## Contributing

We welcome contributions! Please read our [Contributing Guidelines](CONTRIBUTING.md) before submitting pull requests.

### Development Workflow

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Ensure all tests pass
6. Submit a pull request

### Code of Conduct

Please follow our [Code of Conduct](CODE_OF_CONDUCT.md) in all interactions.


## Security

If you discover a security vulnerability, please report it privately to: arya@badr-interactive.com

See our [Security Policy](SECURITY.md) for more information.

## Governance

This project is governed by the [SMILE Platform Backend Governance](GOVERNANCE.md) document.

## Support

- 📧 Email: arya@badr-interactive.com
- 📖 Documentation: See the [adr/](adr/) directory
- 🐛 Issues: [GitHub Issues](https://github.com/smile-platform/backend/issues)

## Acknowledgments

- Thanks to all [contributors](https://github.com/smile-platform/backend/graphs/contributors)
- Built with [Bun](https://bun.sh/) - Fast all-in-one JavaScript runtime
- Monorepo powered by [Turborepo](https://turbo.build/)
- Web framework: [Hono.js](https://hono.dev/)
- Database queries powered by [Kysely](https://kysely.dev/)

---



© 2024 SMILE Platform. Licensed under AGPL-3.0.
