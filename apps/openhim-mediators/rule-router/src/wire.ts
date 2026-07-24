/**
 * Dependency injection wiring for rule-router.
 */

import type { Logger } from "pino";
import type { Kysely } from "kysely";
import {
  createDatabase,
  closeDatabase,
  validateRequiredTables,
} from "./common/infrastructure/database/connection";
import type { Database } from "./common/infrastructure/database/connection";
import { createLogger } from "./common/infrastructure/logger";
import { createRoutingRepository } from "./modules/routing/routing.repository";
import { createRoutingService } from "./modules/routing/routing.service";
import { registerWithOpenHIM } from "./modules/registration/mediator-registration";
import { validateEnv } from "./config/env";
import type { Env } from "./config/env";
import type { RoutingRepository } from "./modules/routing/routing.repository";
import type { RoutingService } from "./modules/routing/routing.service";

export interface Dependencies {
  env: Env;
  logger: Logger;
  db: Kysely<Database>;
  routingRepository: RoutingRepository;
  routingService: RoutingService;
  heartbeatIntervalId: number | null;
}

export async function setupDependencies(): Promise<Dependencies> {
  const env = validateEnv();
  const logger = createLogger(env);

  logger.info("Initializing rule-router dependencies...");

  try {
    // Database
    logger.info("Initializing database connection...");
    const db = await createDatabase(env, logger);

    // Validate tables
    // logger.info("Validating database tables...");
    // const tablesExist = await validateRequiredTables(db, logger);
    // if (!tablesExist) {
    //   throw new Error(
    //     "Required database table integration_routing_rules does not exist. " +
    //       "Run db-scripts/schema.sql to create it.",
    //   );
    // }

    // Routing repository
    logger.info("Initializing routing repository...");
    const routingRepository = createRoutingRepository(db, logger);
    try {
      await routingRepository.loadRules();
    } catch (error) {
      logger.error({ error }, "Failed to load routing rules - cannot start");
      throw error;
    }
    routingRepository.startAutoRefresh(env.ROUTING_RULES_REFRESH_INTERVAL_MS);

    // Routing service
    logger.info("Initializing routing service...");
    const routingService = createRoutingService(env, routingRepository, logger);

    // Register mediator with OpenHIM and start heartbeat (non-fatal if it fails)
    logger.info("Registering mediator with OpenHIM...");
    const heartbeatIntervalId = await registerWithOpenHIM(env, logger);

    logger.info("*** All dependencies initialized ***");

    return {
      env,
      logger,
      db,
      routingRepository,
      routingService,
      heartbeatIntervalId,
    };
  } catch (error) {
    logger.error({ error }, "xxx Failed to initialize dependencies xxx");
    throw error;
  }
}

export async function closeDependencies(deps: Dependencies): Promise<void> {
  deps.logger.info("Closing dependencies...");

  try {
    deps.routingRepository.stopAutoRefresh();

    if (deps.heartbeatIntervalId !== null) {
      clearInterval(deps.heartbeatIntervalId);
      deps.logger.info("Mediator heartbeat stopped");
    }

    await closeDatabase(deps.db, deps.logger);
    deps.logger.info("All dependencies closed");
  } catch (error) {
    deps.logger.error({ error }, "Error closing dependencies");
    throw error;
  }
}

export async function handleShutdown(deps: Dependencies): Promise<void> {
  deps.logger.info("Received shutdown signal, closing gracefully...");

  try {
    await closeDependencies(deps);
    deps.logger.info("Shutdown complete");
    process.exit(0);
  } catch (error) {
    deps.logger.error({ error }, "Error during shutdown");
    process.exit(1);
  }
}
