# SMILE Platform Architecture Documentation

## Overview

This document provides a comprehensive overview of the SMILE Platform architecture, consolidating information from various architecture decision records (ADRs) and technical documentation. The platform follows a microservices architecture with multiple services working together to provide a complete healthcare supply chain management solution.

## Architecture Components

### Core Services

Port kolom **Host** adalah yang dipetakan `docker-compose.yml`; **App** adalah port yang
didengarkan proses di dalam container (`src/config/env.ts`). Keduanya tidak selalu sama.

| Service | Host | App | Purpose |
|---|---|---|---|
| `apps/core` | 3000 | 3000 | Auth, file storage, master data, shared utilities |
| `apps/auth-service` | 3003 | 3000 | JWT authentication, Keycloak integration, RBAC |
| `apps/main` | 3004 | 3000 | Core business logic, orders, transactions, analytics |
| `apps/warehouse-service` | 3006 | 3008 | Inventory & warehouse management |
| `apps/interop-service` | 4004 | 4004 | Interoperability layer — transformers, route mapping |
| `apps/openhim-mediators/rule-router` | 4005 | 4005 | OpenHIM mediator, rule-based routing |
| `apps/web` | — | — | Next.js frontend (juga menyajikan situs dokumentasi ini di `/docs`) |
| `apps/wms-encore` | — | — | Waste Management System (Encore; Sequelize + Kysely) |
| Nginx `proxy` | 8080 | 8080 | Reverse proxy di depan semua service |

#### 1. Core Service (`apps/core`)
- **Database**: MySQL, Redis
- **Infrastructure**: RabbitMQ, MinIO (object storage)
- **Key Features**: authentication & authorization, file storage, master data, shared helpers

#### 2. Auth Service (`apps/auth-service`)
- **Key Features**: JWT-based authentication, Keycloak client & realm management, user session management, role-based access control

#### 3. Main Service (`apps/main`)
- **Database**: MySQL, ClickHouse (Datamart & Slave)
- **Infrastructure**: Redis, RabbitMQ, Elasticsearch
- **Key Features**: orders, transactions, stock, annual planning, analytics & reporting

#### 4. Warehouse Service (`apps/warehouse-service`)
- **Database**: MySQL, ClickHouse
- **Infrastructure**: Redis, Elasticsearch
- **Key Features**: stock management, batch tracking, stock opname, executive dashboard, report generation

#### 5. Interop Service (`apps/interop-service`)
- **Purpose**: jembatan ke sistem eksternal — message transformer, route mapping, audit log
- **Infrastructure**: RabbitMQ, MySQL
- **Docs**: [Interop layer](./interop-layer/index.md)

#### 6. OpenHIM Rule Router (`apps/openhim-mediators/rule-router`)
- **Purpose**: mediator OpenHIM yang merutekan pesan berdasarkan aturan di database
- **Docs**: [Adding a new event](./interop-layer/adding-new-event.md)

> **Service yang sudah dihapus.** Versi dokumen sebelumnya mendaftar `apps/sync-service`,
> `apps/3.0/main-api`, `apps/3.0/warehouse-api`, `apps/3.0/iot-api`, dan `apps/3.0/notification`.
> Tidak satu pun tersisa di repo ini. Dokumen yang mendeskripsikannya dipindah ke
> [`docs/archive/`](../archive/index.md).
>
> **Catatan `docker-compose.yml`**: service `service-immunization` (host 3001) dan
> `service-medicine` (host 3002) masih `build: ./apps/platform`, padahal direktori itu
> sudah tidak ada — dua entri tersebut tidak akan bisa di-build apa adanya.

## Infrastructure Components

### Database Layer

#### MySQL
- **Primary database** for transactional data
- **Services**: Main, Warehouse
- **Connection**: Managed through Kysely query builder
- **Monitoring**: Health checks and connection pooling

#### ClickHouse
- **Analytics database** for reporting and data warehousing
- **Services**: Main, Warehouse
- **Types**: Datamart (analytics), Slave (reporting)
- **Use Cases**: Dashboard data, analytics queries

#### Redis
- **Caching layer** and session storage
- **Services**: Core, Main, Warehouse
- **Features**: Connection pooling, health monitoring

### Message Queue & Communication

#### RabbitMQ
- **Message broker** for inter-service communication
- **Services**: Core, Main, Sync
- **Features**: Reliable messaging, queue management

### Storage & File Management

#### MinIO
- **Object storage** for files and documents
- **Services**: Core
- **Features**: S3-compatible API, health monitoring

### Search & Analytics

#### Elasticsearch
- **Search engine** for advanced querying
- **Services**: Main
- **Use Cases**: Full-text search, data indexing

## Shared Libraries (`packages/lib`)

### Core Utilities (`@smile-health/lib`)

#### Database Management (`database.ts`)
- **TransactionManager**: Database transaction handling
- **DatabaseManager**: Kysely database instance management
- **Features**: Type-safe queries, connection pooling

#### Error Handling (`error.ts`, `error-excel.ts`)
- **HTTPError**: Base HTTP error classes (400, 401, 403, 404, 422)
- **ExcelError**: Excel-specific error handling
- **Features**: Standardized error responses

#### Excel Processing (`excel.ts`)
- **ExportTemplate**: Excel file generation
- **ImportTemplate**: Excel file parsing
- **Features**: Data formatting, styling, validation

#### Internationalization (`i18n.ts`)
- **i18next integration** with Tolgee API
- **Features**: Multi-language support, dynamic translation loading

#### Logging (`logger.ts`)
- **Pino-based logging** with Loki integration
- **Features**: Structured logging, HTTP request logging

#### Tracing (`tracing.ts`)
- **OpenTelemetry integration** for distributed tracing
- **Features**: Auto-instrumentation, OTLP export

#### Utilities (`utils.ts`)
- **Data manipulation functions**: group, associate, collect, merge
- **Validation functions**: string validation, date comparison
- **Type conversion**: boolean, number formatting

## API Architecture

### Authentication
- **JWT-based authentication** with refresh tokens
- **Login endpoint**: `POST /auth/login`
- **Token usage**: Bearer token in Authorization header
- **Token lifecycle**: Automatic refresh on expiration

### API Standards
- **Content-Type**: application/json
- **Error format**: Standardized error responses
- **Pagination**: Cursor-based pagination
- **Rate limiting**: Service-specific limits

### Testing Guidelines
- **Framework**: Mocha + Chai
- **Coverage**: NYC (Istanbul)
- **Principles**: API-only testing, no direct database access
- **Authentication**: Required for all protected endpoints

## Data Migration (SMILE 3.0 → 5.0)

### Migration Strategy
- **17 migration scripts** organized in 5 phases
- **Batch processing** with configurable sizes
- **Progress tracking** using Redis
- **Rollback capabilities** for failed migrations

### Migration Phases

#### Phase 1: Foundation Data (Global)
- Locations (geographic hierarchy)
- Activities (program activities)
- Manufactures (manufacturer data)
- Budget Sources (funding sources)

#### Phase 2: Core Entities
- Users (user accounts)
- Entities (business entities)
- Materials (material catalog)

#### Phase 3: Workspace Relations
- Entity Relations (business associations)
- Material Relations (product associations)
- Patients (patient records)

#### Phase 4: Operational Data
- Batches (material batches)
- Stocks (inventory data)
- Orders (order management)
- Transactions (financial data)

#### Phase 5: Supporting Data
- Stock Opnames (inventory counts)
- Reconciliations (data reconciliation)
- Transaction Reasons (metadata)

### Migration Commands
```bash
# Complete migration
npm run migrate:all

# Individual migrations
npm run migrate:location
npm run migrate:user-bulk
npm run migrate:entity-bulk
```

## Infrastructure Monitoring

### Health Checks
All services implement standardized health check endpoints:
- **Database connectivity**: MySQL, ClickHouse, Redis
- **Message queue status**: RabbitMQ
- **Storage accessibility**: MinIO
- **External service availability**: API endpoints

### Connection Status Tracking
- **Real-time monitoring** of all infrastructure components
- **Status types**: disconnected, connecting, connected, error
- **Health check functions**: Component-specific validation
- **Centralized monitoring**: InfrastructureMonitor class

### Logging & Observability
- **Structured logging** with correlation IDs
- **Distributed tracing** with OpenTelemetry
- **Metrics collection** for performance monitoring
- **Error tracking** and alerting

## Service Status Dashboard

### Environment Status
- **Staging Environment**: All services running ✅
- **Development Environment**: All services running ✅

### Infrastructure Services
| Service       | Status     |
| ------------- | ---------- |
| MySQL         | ✅ running |
| ClickHouse    | ✅ running |
| Redis         | ✅ running |
| RabbitMQ      | ✅ running |
| MinIO Storage | ✅ running |
| Keycloak      | ✅ running |
| Translation   | ✅ running |

## Development Guidelines

### Code Standards
- **TypeScript** for type safety
- **ESLint** for code quality
- **Prettier** for code formatting
- **Conventional commits** for version control

### Testing Requirements
- **Unit tests**: Minimum 80% coverage
- **Integration tests**: API endpoint validation
- **End-to-end tests**: Critical user flows
- **Performance tests**: Load and stress testing

### Deployment Process
- **Docker containerization** for all services
- **Docker Compose** for local development
- **CI/CD pipeline** with GitLab CI
- **Environment-specific** configurations

## Troubleshooting

### Common Issues
1. **Connection timeouts**: Check service availability and network
2. **Authentication failures**: Verify token validity and permissions
3. **Database errors**: Check connection strings and permissions
4. **Memory issues**: Monitor resource usage and optimize queries

### Debug Mode
```bash
# Enable debug logging
LOG_MODE=development
DEBUG=true
```

### Health Check Commands
```bash
# Test individual connections
mysql -h localhost -P 3306 -u user -p
redis-cli -h localhost -p 6379 ping
curl -u guest:guest http://localhost:15672/api/overview
```

## Security Considerations

### Authentication & Authorization
- **JWT tokens** with appropriate expiration
- **Role-based access control** (RBAC)
- **API key management** for external integrations
- **Session management** with Redis

### Data Protection
- **Encryption at rest** for sensitive data
- **HTTPS enforcement** for all communications
- **Input validation** and sanitization
- **SQL injection prevention** with parameterized queries

### Infrastructure Security
- **Network segmentation** between services
- **Secret management** with environment variables
- **Container security** best practices
- **Regular security updates** and patches

---

**Last Updated**: January 2025  
**Version**: 2.0  
**Maintainer**: Platform Team  
**Next Review**: March 2025