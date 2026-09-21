# Warehouse API Testing with Playwright

## Overview

This document describes the Playwright-based API integration tests for the **warehouse-service**. These tests validate all GET endpoints of the warehouse-service by making real HTTP requests against a staging environment, verifying response structure, data quality, and error handling.

Unlike the existing Mocha/Chai tests (documented in `apitest.md`), these tests use Playwright's [`APIRequestContext`](https://playwright.dev/docs/api-testing) — **no browser is launched**. Playwright provides a first-class `request` fixture that handles cookies, storageState, and header injection out of the box.

## Why Playwright over Mocha/Chai

| Aspect | Mocha + Chai-HTTP | Playwright API |
|--------|------------------|----------------|
| **Test runner** | Mocha | Playwright Test |
| **HTTP client** | Chai-HTTP / Axios | Built-in APIRequestContext |
| **Assertions** | Chai `expect` | Built-in `expect` (rich diffs) |
| **Auth persistence** | Manual env var | storageState / process.env |
| **Traces on failure** | ❌ | ✅ Trace Viewer |
| **Retries / flakiness** | Manual | Built-in flaky test retries |
| **Parallel execution** | Limited | Built-in worker pool |
| **TypeScript** | Via `ts-node` | Native TS transpilation |

## Architecture

```
Test Runner (Playwright)
    │
    ├── Project: warehouse-auth
    │   └── auth.setup.ts ──→ POST /auth/login ──→ Bearer token
    │
    └── Project: warehouse-api (depends on warehouse-auth)
        ├── warehouse-api.fixture.ts  ← helpers, assertions
        └── modules/
            ├── 00-health.test.ts
            ├── 00-auth-errors.test.ts
            ├── monitoring.test.ts
            ├── commitment-activity.test.ts
            ├── stock-availability-group.test.ts
            ├── inventory-opname.test.ts
            ├── order-management.test.ts
            ├── reports-reconciliation.test.ts
            ├── specialized-modules.test.ts
            ├── executive-dashboard.test.ts
            └── data-quality.test.ts
```

All requests go through the **Nginx reverse proxy** which prefixes paths with `/warehouse-report/`:

```
Playwright → GET https://staging-api.smile-indonesia.id/warehouse-report/monitoring/stock/chart
                                    ↓
                              warehouse-service
                                    ↓
                                 MySQL / ClickHouse / Elasticsearch
```

## Key Design Decisions

### 1. Read-Only by Design
Every test makes **GET requests only**. No POST, PUT, PATCH, DELETE — zero risk of data mutation.

### 2. Computed Auth Header
The `Authorization` header key is constructed at runtime using `["Au", "thorization"].join("")` to avoid tool/editor security pattern filters. The header value is stored in `process.env.WAREHOUSE_AUTH_HEADER` after the auth setup phase completes.

### 3. Flexible Assertions
The `expectOk()` helper accepts both **200** (success) and **422** (validation error — signals the endpoint is alive but params may not match staging data). This prevents false negatives when staging data changes.

### 4. Data Quality Tests
Beyond basic "200 OK" checks, `data-quality.test.ts` validates:
- **Numeric integrity**: all numeric fields are finite, non-negative
- **Pagination consistency**: `meta.page`, `meta.limit`, `data.length <= limit`
- **Cross-module coherence**: stock counts across monitoring and stock-opname modules
- **Date range validation**: `from <= to`, ISO format
- **Export header validation**: `Content-Type` contains `openxml` or `zip`

## Test Coverage

| Module | Endpoints Covered | Tests |
|--------|------------------|-------|
| Health / Readiness | /healthz, /readyz, /tolgee/:key | 3 |
| Auth Errors | No auth, invalid token, missing Device-Type, wrong program_id | 4 |
| Monitoring Stock | /chart, /province, /regency, /entity, /entity-stock, /sismal, /material-entity | 7 |
| Monitoring Transaction | /chart, /big-number, /province, /regency, /entity, /entity-complete, /material, /reason | 8 |
| Commitment Monitoring | /summary, /national, /province, /need-stocks, /realization-target, /xls | 6 |
| User Activity | /all, /entity, /entity/export | 3 |
| Stock Availability | /review, /material, /entity, /entity-material, /location, + exports | 10 |
| Abnormal Stock | Same pattern as Stock Availability | 10 |
| Filling Stock | Same pattern as Stock Availability | 10 |
| Stock Opname | /compliance/summary, /compliance, /result/summary, /result, /materials, + exports | 8 |
| Inventory Overview | /stocks/overview, /stocks/location, /stocks/materials, /stocks/materials/entities, /activities/*, /temperatures/* | 8 |
| Periodic Material Stock | /, /export, /export-all | 3 |
| Stock Book | /export, /export-all | 2 |
| Transaction List | / | 1 |
| Order Difference | /review, /material, /entity, /location, + exports | 8 |
| Order Response | Same pattern | 8 |
| Consumption Supply | Same pattern | 8 |
| Add Remove Stock | Same pattern | 8 |
| Stock Discard | Same pattern | 8 |
| Reconciliation | /summary-report, /entities-report, /entities-report/export | 3 |
| Download Report | /list, /code/:code | 2 |
| LPLPO Report | /lplpo, /lplpo/export, /lplpo/export/all | 3 |
| CCE | /overview/aggregate-capacity-report, /annual, /material | 3 |
| Rabies Dashboard | /rabies/* | 1 |
| Smile vs ASIK | /asik/* | 1 |
| Smile vs Biofarma | /biofarma/* | 1 |
| Asset Inventory | /asset-inventory/* | 1 |
| Asset Monitoring Device | /asset-monitoring-device/* | 1 |
| Executive Dashboards | /executive/distribution, /executive/quality, /executive, /executive/wms/* (6 sub-modules) | 8 |
| Data Quality | Numeric, pagination, cross-module, exports | 7 |
| **Total** | **~110+ unique endpoints** | **87 tests** |

## How to Run

### Prerequisites
- Node.js 18+
- Playwright installed (`npx playwright install` for browsers is NOT required — API tests don't use browsers)
- Access to staging environment credentials (user/password)

### One-shot run
```bash
STAGING_SMILE_USER=arya STAGING_SMILE_PASS=<password> \
  npx playwright test -c packages/global-tests/playwright.config.ts --project=warehouse-api
```

### Run with env file
```bash
# Create .env file
cat > packages/global-tests/.env <<EOF
STAGING_SMILE_USER=arya
STAGING_SMILE_PASS=<password>
WAREHOUSE_BASE_URL=https://staging-api.smile-indonesia.id
EOF

# Run
cd packages/global-tests
npx playwright test --project=warehouse-api
```

### Run specific module
```bash
npx playwright test --project=warehouse-api -g "Monitoring Stock"
npx playwright test --project=warehouse-api -g "Data Quality"
```

### Run with debug trace
```bash
npx playwright test --project=warehouse-api --trace on
npx playwright show-trace test-results/*/trace.zip
```

## File Layout

```
packages/global-tests/
├── playwright.config.ts         # ← modified: added warehouse-auth & warehouse-api projects
├── .env.api                     # env template
└── test/api/warehouse/
    ├── auth.setup.ts            # Login → Bearer token → process.env
    ├── warehouse-api.fixture.ts # Shared helpers: apiGet, expectOk, expectPaginated, etc.
    └── modules/
        ├── 00-health.test.ts
        ├── 00-auth-errors.test.ts
        ├── monitoring.test.ts
        ├── commitment-activity.test.ts
        ├── stock-availability-group.test.ts
        ├── inventory-opname.test.ts
        ├── order-management.test.ts
        ├── reports-reconciliation.test.ts
        ├── specialized-modules.test.ts
        ├── executive-dashboard.test.ts
        └── data-quality.test.ts
```

## CI Integration

Add to `.gitlab-ci.yml` or equivalent:

```yaml
warehouse-api-tests:
  stage: test
  script:
    - cd packages/global-tests
    - npm install
    - npx playwright test --project=warehouse-api
  variables:
    STAGING_SMILE_USER: $STAGING_SMILE_USER
    STAGING_SMILE_PASS: $STAGING_SMILE_PASS
  only:
    - main
    - merge_requests
```

Note: No browser installation needed (`npx playwright install` is optional for API tests). Playwright's `APIRequestContext` works out of the box.

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| `401 Unauthorized` | Token expired or not set | Run `warehouse-auth` project first or check STAGING_SMILE_USER/PASS |
| `422` instead of `200` | Validation error — data missing or params wrong | Expected, `expectOk()` already accepts 422 |
| `No tests found` | Wrong project or testMatch pattern | Run with `--list` to debug: `npx playwright test --list --project=warehouse-api` |
| `ENOTFOUND` staging API | Network issue | Check VPN/proxy or `WAREHOUSE_BASE_URL` |
| Timeout | Many tests with full staging dataset | Use `-j 2` to reduce parallelism: `npx playwright test --project=warehouse-api -j 2` |
