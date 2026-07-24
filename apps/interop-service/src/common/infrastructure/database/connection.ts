/**
 * Database Connection Module that Creates and manages Kysely ORM connection to MySQL
 *
 * This module exports a factory function (unlike singleton in core service) to support dependency injection.
 * The database instance is created in wire.ts and injected into services/repositories via their constructors.
 */

import { Kysely, MysqlDialect } from "kysely";
import { createPool } from "mysql2";
import type { Logger } from "pino";
import type { Env } from "../../../config/env";

// Database schema definition
export interface Database {
  openhim_route_mappings: RouteMappingTable;
  openhim_route_execution_logs: ExecutionLogTable;
}

// openhim_route_mappings table schema.
// Table stores routing config map of RabbitMQ topics to OpenHIM channels
export interface RouteMappingTable {
  id: number;
  rabbitmq_topic: string;
  enabled: boolean;
  openhim_channel_id: string;
  openhim_channel_name: string;
  http_method: string;
  request_path: string;
  headers_json: string | null;
  include_context: boolean;
  auth_type: string;
  auth_config_json: string | null;
  max_retries: number;
  retry_backoff_ms: number;
  retry_backoff_multiplier: number;
  expected_status_codes: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

// openhim_route_execution_logs table schema
// Table stores Audit trail - logs every message sent to OpenHIM
export interface ExecutionLogTable {
  id: number;
  rabbitmq_topic: string;
  order_id: string | null;
  program_id: string | null;
  openhim_channel_id: string;
  openhim_endpoint: string;
  status: string;
  http_status_code: number | null;
  execution_time_ms: number | null;
  attempt_number: number;
  request_payload: string | null;
  response_payload: string | null;
  error_message: string | null;
  user_id: string | null;
  user_email: string | null;
  request_id: string | null;
  trace_id: string | null;
  created_at: string;
}

// Ensures the database exists, creating it if necessary
export async function ensureDatabaseExists(
  env: Env,
  logger: Logger
): Promise<void> {
  logger.info(
    {
      host: env.DB_HOST,
      port: env.DB_PORT,
      database: env.DB_NAME,
    },
    "Ensuring database exists"
  );

  const pool = createPool({
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    // Note: No database specified here - connects to MySQL root
    waitForConnections: true,
    connectionLimit: 1,
    queueLimit: 0,
  });

  try {
    const connection = await pool.promise().getConnection();
    try {
      // Create database if it doesn't exist with default charset and collation
      await connection.query(
        `CREATE DATABASE IF NOT EXISTS \`${env.DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;`
      );
      logger.info(
        { database: env.DB_NAME },
        "Database ensured (created or already exists)"
      );
    } finally {
      await connection.release();
    }
  } catch (error) {
    logger.error(
      { error, database: env.DB_NAME },
      "Failed to ensure database exists"
    );
    throw new Error(
      `Failed to ensure database exists: ${error instanceof Error ? error.message : String(error)}`
    );
  } finally {
    await pool.end();
  }
}

/**
 * Factory function to create a Kysely database instance
 * In practice, wire.ts calls this once at startup and injects the instance where needed
 *
 * @examples
 * // In wire.ts
 * const db = await createDatabase(env, logger)
 *
 * // In repository (constructor injection)
 * class RouteMappingRepository {
 *   constructor(private db: Kysely<Database>) {}
 *   async getMapping(topic: string) {
 *     return await this.db.selectFrom('openhim_route_mappings')
 *       .where('rabbitmq_topic', '=', topic)
 *       .selectAll()
 *       .executeTakeFirst()
 *   }
 * }
 *
 * // In tests (easy to mock)
 * const mockDb = mock<Kysely<Database>>()
 * const repo = new RouteMappingRepository(mockDb)
 */
export async function createDatabase(
  env: Env,
  logger: Logger
): Promise<Kysely<Database>> {
  logger.info(
    {
      host: env.DB_HOST,
      port: env.DB_PORT,
      database: env.DB_NAME,
    },
    "Creating database connection"
  );

  try {
    // Create connection pool - using minimal config like core service
    const pool = createPool({
      host: env.DB_HOST,
      port: env.DB_PORT,
      user: env.DB_USER,
      password: env.DB_PASSWORD,
      database: env.DB_NAME,
      connectionLimit: 10,
      timezone: "Z",
    });

    // Handle pool errors
    pool.on("error", (error) => {
      logger.error({ error, code: error.code }, "Database pool error");
    });

    pool.on("connection", (connection) => {
      logger.debug(
        { threadId: connection.threadId },
        "Database connection established"
      );
    });

    const dialect = new MysqlDialect({
      pool: pool as any,
    });

    // Create and return Kysely instance with query logging
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
            "Database query error"
          );
        } else if (event.level === "query") {
          logger.debug(
            {
              query: event.query.sql,
              parameters: event.query.parameters,
              durationMs: event.queryDurationMillis,
            },
            "Database query executed"
          );
        }
      },
    });

    logger.info("Database connection created successfully");
    return db;
  } catch (error) {
    logger.error({ error }, "Failed to create database connection");
    throw new Error(
      `Database connection failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

// Verifies database connectivity
export async function checkDatabaseHealth(
  db: Kysely<Database>,
  logger: Logger
): Promise<boolean> {
  try {
    // Simple health check - just test connection with SELECT 1
    await db.selectNoFrom((eb) => eb.val(1).as("health")).execute();
    return true;
  } catch (error) {
    logger.error({ error }, "Database health check failed");
    return false;
  }
}

// Closes the database connection gracefully
export async function closeDatabase(
  db: Kysely<Database>,
  logger: Logger
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

// Validates that required database tables exist
// Called during startup to ensure database is properly set up
export async function validateRequiredTables(
  db: Kysely<Database>,
  logger: Logger
): Promise<boolean> {
  const requiredTables = [
    "openhim_route_mappings",
    "openhim_route_execution_logs",
  ];

  try {
    logger.info("Validating required database tables exist...");

    for (const tableName of requiredTables) {
      try {
        // Try to query table with timeout
        const queryPromise = db
          .selectFrom(tableName as any)
          .select(db.fn.count("id").as("count"))
          .limit(1)
          .execute();
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(
            () =>
              reject(new Error(`Table validation timeout for ${tableName}`)),
            5000
          );
        });

        await Promise.race([queryPromise, timeoutPromise]);
        logger.debug({ table: tableName }, "Table exists");
      } catch (error) {
        logger.error(
          { table: tableName, error },
          `Required table '${tableName}' does not exist or query timeout`
        );
        return false;
      }
    }

    logger.info("All required database tables exist");
    return true;
  } catch (error) {
    logger.error({ error }, "Failed to validate database tables");
    return false;
  }
}
