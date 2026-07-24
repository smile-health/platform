// Wire/DI
export {
  setupDependencies,
  performHealthCheck,
  closeDependencies,
  handleShutdown,
} from "./wire";
export type { Dependencies } from "./wire";

// Server
export { createServer, startServer } from "./server";

// Worker
export { startWorker } from "./worker";

// CLI
export { main } from "./cli";

// Types
export type { RabbitMQMessage, MessageContext } from "./common/types/message";
export type {
  CloudEvent,
  SmileCloudEvent,
  OrderCreatedEvent,
  OrderStatusChangeEvent,
} from "./common/types/cloudevents";
export type {
  OpenHIMConfig,
  OpenHIMRequest,
  OpenHIMResponse,
} from "./common/types/openhim";
export type {
  RouteMapping,
  RouterContext,
  ExecutionResult,
} from "./common/types/router";

// Services
export {
  RouterService,
  createRouterService,
} from "./modules/router/router.service";
export {
  RouteMappingRepository,
  createRouteMappingRepository,
} from "./modules/route-mapping/route-mapping.repository";
export {
  AuditLogRepository,
  createAuditLogRepository,
} from "./modules/audit/audit-log.repository";
export type { AuditLogEntry } from "./modules/audit/audit-log.repository";

// Infrastructure
export {
  HealthCheckService,
  createHealthCheckService,
} from "./common/infrastructure/health";
export type {
  HealthCheckResult,
  ServiceHealth,
} from "./common/infrastructure/health";
export { OpenHIMClient } from "./common/infrastructure/http/openhim-client";
export {
  EventConsumer,
  createEventConsumer,
} from "./common/infrastructure/rabbitmq/consumer";
export {
  createRabbitMQConnection,
  createChannel,
} from "./common/infrastructure/rabbitmq/connection";
export {
  createDatabase,
  validateRequiredTables,
} from "./common/infrastructure/database/connection";
export { createLogger } from "./common/infrastructure/logger";

// Transformers
export { BaseTransformer } from "./modules/transformers/transformer.base";
export {
  TransformerRegistry,
  createTransformerRegistry,
} from "./modules/transformers/registry";

// Utilities
export {
  formatAsCloudEvent,
  createTraceparent,
  extractTraceparent,
} from "./common/infrastructure/cloudevents/formatter";
export {
  safeValidate,
  messageEnvelopeSchema,
  cloudEventSchema,
} from "./common/utils/validation";
