/**
 * Database Connection Module for rule-router
 * Adds the integration_routing_rules table to the Database interface.
 */

import { Kysely, MysqlDialect } from "kysely";
import { createPool } from "mysql2/promise";
import type { Logger } from "pino";
import type { Env } from "../../../config/env";

// integration_routing_rules table schema
export interface RoutingRuleTable {
  id: number;
  topic: string;
  filter_key: string;
  filter_operator: string;
  filter_value: string;
  target_url: string;
  target_name: string;
  is_default: boolean;
  priority: number;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

// Database schema — only the tables this service needs
export interface Database {
  integration_routing_rules: RoutingRuleTable;
}

export async function createDatabase(
  env: Env,
  logger: Logger,
): Promise<Kysely<Database>> {
  logger.info(
    { host: env.DB_HOST, port: env.DB_PORT, database: env.DB_NAME },
    "Creating database connection",
  );

  try {
    const pool = createPool({
      host: env.DB_HOST,
      port: env.DB_PORT,
      user: env.DB_USER,
      password: env.DB_PASSWORD,
      database: env.DB_NAME,
      connectionLimit: 10,
      timezone: "Z",
      connectTimeout: 5000,
    });

    // Note: pool event handlers removed - connection issues will surface on query execution

    const dialect = new MysqlDialect({
      pool: pool as any,
    });

    const db = new Kysely<Database>({
      dialect,
      log(event) {
        if (event.level === "error") {
          logger.error(
            {
              query: event.query.sql,
              parameters: event.query.parameters,
              error: event.error,
              durationMs: event.queryDurationMillis,
            },
            "Database query error",
          );
        } else if (event.level === "query" && env.NODE_ENV === "development") {
          logger.debug(
            {
              query: event.query.sql,
              parameters: event.query.parameters,
              durationMs: event.queryDurationMillis,
            },
            "Database query executed",
          );
        }
      },
    });

    logger.info("Database connection created successfully");
    return db;
  } catch (error) {
    logger.error({ error }, "Failed to create database connection");
    throw new Error(
      `Database connection failed: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

export async function checkDatabaseHealth(
  db: Kysely<Database>,
  logger: Logger,
): Promise<boolean> {
  try {
    await db.selectNoFrom((eb) => eb.val(1).as("health")).execute();
    return true;
  } catch (error) {
    logger.error({ error }, "Database health check failed");
    return false;
  }
}

export async function closeDatabase(
  db: Kysely<Database>,
  logger: Logger,
): Promise<void> {
  try {
    logger.info("Closing database connection");
    await db.destroy();
    logger.info("Database connection closed");
  } catch (error) {
    logger.error({ error }, "Error closing database connection");
    throw error;
  }
}

export async function validateRequiredTables(
  db: Kysely<Database>,
  logger: Logger,
): Promise<boolean> {
  try {
    logger.info("Validating required database tables exist...");
    await db
      .selectFrom("integration_routing_rules")
      .select(db.fn.count("id").as("count"))
      .limit(1)
      .execute();
    logger.info("Required table integration_routing_rules exists");
    return true;
  } catch (error) {
    logger.error(
      { error },
      "Required table integration_routing_rules does not exist or is unreachable. Run db-scripts/schema.sql first.",
    );
    return false;
  }
}
