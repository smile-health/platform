# SMILE Core Service

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Bun](https://img.shields.io/badge/Bun-1.3-black?logo=bun&logoColor=white)](https://bun.sh/)
[![Hono](https://img.shields.io/badge/Hono-4.x-E36002?logoColor=white)](https://hono.dev/)
[![Unit Tests](https://img.shields.io/badge/unit%20tests-64%20passing-brightgreen?logo=checkmarx&logoColor=white)](src/tests/unit)
[![Coverage](https://img.shields.io/badge/coverage-99.62%25-brightgreen?logo=codecov&logoColor=white)](coverage/lcov.info)

> Authentication, file storage, and shared utilities for the SMILE platform. Port **3000**, proxied through Nginx.

---

## SonarQube badges

Replace `<SONAR_HOST_URL>` and `<PROJECT_BADGE_TOKEN>` with your instance values.
Badge tokens are generated in **SonarQube → Project → Project Information → Get project badges**.

Once configured, swap the static badges above with these live SonarQube badges:

```markdown
[![Quality Gate Status](<SONAR_HOST_URL>/api/project_badges/measure?project=smile-core&metric=alert_status&token=<PROJECT_BADGE_TOKEN>)](<SONAR_HOST_URL>/dashboard?id=smile-core)
[![Coverage](<SONAR_HOST_URL>/api/project_badges/measure?project=smile-core&metric=coverage&token=<PROJECT_BADGE_TOKEN>)](<SONAR_HOST_URL>/dashboard?id=smile-core)
[![Bugs](<SONAR_HOST_URL>/api/project_badges/measure?project=smile-core&metric=bugs&token=<PROJECT_BADGE_TOKEN>)](<SONAR_HOST_URL>/dashboard?id=smile-core)
[![Security Rating](<SONAR_HOST_URL>/api/project_badges/measure?project=smile-core&metric=security_rating&token=<PROJECT_BADGE_TOKEN>)](<SONAR_HOST_URL>/dashboard?id=smile-core)
```

---

## Available scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start in watch mode |
| `pnpm build` | Regenerate Kysely DB types |
| `pnpm test` | Integration tests (requires database) |
| `pnpm test:unit` | **Pure unit tests — no infrastructure needed** |
| `pnpm test:unit:coverage` | Unit tests + LCOV coverage report (`coverage/lcov.info`) |
| `pnpm sonar` | Run SonarQube scanner (requires `SONAR_HOST_URL` + `SONAR_TOKEN`) |
| `pnpm lint` | ESLint |
| `pnpm format` | Prettier |
| `pnpm db:migrate` | Apply pending DB migrations |
| `pnpm db:rollback` | Rollback last migration |

---

## Unit test coverage

Run without any running infrastructure:

```bash
pnpm test:unit           # 64 tests, ~100ms
pnpm test:unit:coverage  # + generates coverage/lcov.info for SonarQube
```

| File | Functions | Lines |
|------|-----------|-------|
| `src/common/constants/material.ts` | 100% | 100% |
| `src/common/constants/users.ts` | 100% | 100% |
| `src/modules/account/account.schema.ts` | 85.71% | 100% |
| `src/modules/asset-inventory/asset-inventory.error.ts` | 100% | 100% |
| `src/modules/patient/utils/date.ts` | 100% | 100% |
| `src/modules/patient/utils/encryption.ts` | 100% | 95.45% |
| **All files** | **98.81%** | **99.62%** |

---

## SonarQube setup

1. Generate coverage:
   ```bash
   pnpm test:unit:coverage
   ```
2. Set environment variables:
   ```bash
   export SONAR_HOST_URL=https://sonarqube.your-domain.com
   export SONAR_TOKEN=your_token_here
   ```
3. Run the scanner:
   ```bash
   pnpm sonar
   ```
SMILE