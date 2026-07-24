import type { Logger } from "pino";
import {
  createDatabase,
  validateRequiredTables,
} from "./common/infrastructure/database";
import {
  createRabbitMQConnection,
  createChannel,
  createEventConsumer,
} from "./common/infrastructure/rabbitmq";
import { OpenHIMClient } from "./common/infrastructure/http/openhim-client";
import { createLogger } from "./common/infrastructure/logger";
import {
  HealthCheckService,
  createHealthCheckService,
} from "./common/infrastructure/health";
import { createTransformerRegistry } from "./modules/transformers/registry";
import { createRouteMappingRepository } from "./modules/route-mapping/route-mapping.repository";
import { createAuditLogRepository } from "./modules/audit/audit-log.repository";
import { createRouterService } from "./modules/router/router.service";
import { EventConsumer } from "./common/infrastructure/rabbitmq";
import { validateEnv, env } from "./config/env";
import type { Env } from "./config/env";
import type { Kysely } from "kysely";
import type { Connection, Channel } from "amqplib";
import type { Database } from "./common/infrastructure/database";
import { RouterService } from "./modules/router/router.service";
import { RouteMappingRepository } from "./modules/route-mapping/route-mapping.repository";

/**
 * Complete dependency container
 * Holds all initialized dependencies
 */
export interface Dependencies {
  env: Env;
  logger: Logger;
  db: Kysely<Database>;
  rabbitmqConnection: Connection;
  rabbitmqChannel: Channel;
  openHIMClient: OpenHIMClient;
  routerService: RouterService;
  routeMappingRepository: RouteMappingRepository;
  eventConsumer: EventConsumer;
  healthCheck: HealthCheckService;
}

/**
 * Initializes all dependencies with health checks
 */
export async function setupDependencies(): Promise<Dependencies> {
  // Validate environment and create logger
  const validatedEnv = validateEnv();
  const logger = createLogger(validatedEnv);

  logger.info("Initializing interop-service dependencies...");

  try {
    // Database
    logger.info("Initializing database connection...");
    const db = await createDatabase(validatedEnv, logger);

    // Validate that required tables exist
    logger.info("Validating database tables...");
    const tablesExist = await validateRequiredTables(db, logger);
    if (!tablesExist) {
      throw new Error(
        "Required database tables do not exist. Please run schema.sql manually. " +
          "See DATABASE_SETUP.md for instructions.",
      );
    }

    // RabbitMQ connection
    logger.info("Initializing RabbitMQ connection...");
    const rabbitmqConnection = await createRabbitMQConnection(
      validatedEnv,
      logger,
    );

    // RabbitMQ channel
    logger.info("Creating RabbitMQ channel...");
    const rabbitmqChannel = await createChannel(rabbitmqConnection, logger);

    // OpenHIM client
    logger.info("Initializing OpenHIM client...");
    const openHIMClient = new OpenHIMClient(
      {
        apiEndpoint: validatedEnv.OPENHIM_API_ENDPOINT,
        clientId: validatedEnv.OPENHIM_CLIENT_ID,
        clientSecret: validatedEnv.OPENHIM_CLIENT_SECRET,
        requestTimeoutMs: validatedEnv.OPENHIM_REQUEST_TIMEOUT_MS,
        rejectUnauthorized: validatedEnv.OPENHIM_REJECT_UNAUTHORIZED,
        maxRetries: validatedEnv.OPENHIM_MAX_RETRIES,
        retryBackoffMs: validatedEnv.OPENHIM_RETRY_BACKOFF_MS,
        retryBackoffMultiplier: validatedEnv.OPENHIM_RETRY_BACKOFF_MULTIPLIER,
      },
      logger,
    );

    // Transformer registry
    logger.info("Initializing transformer registry...");
    const transformerRegistry = createTransformerRegistry(validatedEnv, logger);

    // Route mapping repository
    logger.info("Initializing route mapping repository...");
    const routeMappingRepository = createRouteMappingRepository(db, logger);
    await routeMappingRepository.loadMappings();
    routeMappingRepository.startAutoRefresh(validatedEnv.ROUTE_MAPPING_REFRESH_INTERVAL_MS);

    // Audit log repository
    logger.info("Initializing audit log repository...");
    const auditLogRepository = createAuditLogRepository(db, logger);

    // Router service
    logger.info("Initializing router service...");
    const routerService = createRouterService(
      validatedEnv,
      openHIMClient,
      transformerRegistry,
      routeMappingRepository,
      auditLogRepository,
      logger,
    );

    // Event consumer: Load exchange list from DB — only subscribe to enabled route mappings.
    // Adding or disabling a topic in openhim_route_mappings takes effect on next service restart
    const exchanges = routeMappingRepository
      .getEnabledMappings()
      .map((m) => m.rabbitmq_topic);

    logger.info(
      { exchanges },
      "Initializing event consumer with DB-driven exchange list",
    );

    const eventConsumer = await createEventConsumer(
      rabbitmqChannel,
      {
        exchange: exchanges,
        exchangeType: "fanout",
        queue: "interop-queue",
        prefetch: 1,
        autoAck: false,
        maxRetries: validatedEnv.RABBITMQ_MAX_RETRIES,
      },
      logger,
    );

    // Health check service
    logger.info("Initializing health check service...");
    const healthCheck = createHealthCheckService(logger);

    logger.info("*** All dependencies initialized ***");

    const dependencies: Dependencies = {
      env: validatedEnv,
      logger,
      db,
      rabbitmqConnection,
      rabbitmqChannel,
      openHIMClient,
      routerService,
      routeMappingRepository,
      eventConsumer,
      healthCheck,
    };

    return dependencies;
  } catch (error) {
    logger.error({ error }, "xxx Failed to initialize dependencies xxx");
    throw error;
  }
}

/**
 * Performs health checks on all dependencies
 *
 * @param deps Dependencies container
 */
export async function performHealthCheck(deps: Dependencies) {
  deps.logger.info("Running health checks...");

  const health = await deps.healthCheck.check(
    deps.db,
    deps.rabbitmqConnection,
    deps.openHIMClient,
    deps.routeMappingRepository.isLoaded(),
  );

  if (health.status === "unhealthy") {
    deps.logger.error(
      { health },
      "XXX CRITICAL: Health check failed - service cannot start",
    );
    throw new Error("Health check failed: Critical services unavailable");
  }

  if (health.status === "degraded") {
    deps.logger.warn(
      { health },
      "WARNING: Health check degraded - some services may be unavailable",
    );
  }

  return health;
}

/**
 * Closes all connections gracefully
 *
 * @param deps Dependencies to close
 */
export async function closeDependencies(deps: Dependencies): Promise<void> {
  deps.logger.info("Closing dependencies...");

  try {
    // Stop auto-refresh and consumer first
    deps.routeMappingRepository.stopAutoRefresh();
    if (deps.eventConsumer.isActive()) {
      await deps.eventConsumer.stop();
    }

    // Close channel, connection and DB
    await deps.rabbitmqChannel.close();
    await deps.rabbitmqConnection.close();
    const { closeDatabase } = await import("./common/infrastructure/database");
    await closeDatabase(deps.db, deps.logger);

    deps.logger.info("All dependencies closed");
  } catch (error) {
    deps.logger.error({ error }, "Error closing dependencies");
    throw error;
  }
}

/**
 * Signal handler for graceful shutdown
 *
 * @param deps Dependencies to close
 */
export async function handleShutdown(deps: Dependencies): Promise<void> {
  deps.logger.info("Received shutdown signal, closing gracefully...");

  try {
    await closeDependencies(deps);
    deps.logger.info("Shutdown complete");
    process.exit(0);
  } catch (error) {
    deps.logger.error({ error }, "xxx Error during shutdown");
    process.exit(1);
  }
}
