/**
 * Audit Log Repository, Data access layer for audit logs
 */

import type { Kysely } from "kysely";
import type { Logger } from "pino";
import type {
  Database,
  ExecutionLogTable,
} from "../../common/infrastructure/database";

// MySQL `text` column limit is 65,535 bytes (not characters).
const MAX_TEXT_COLUMN_BYTES = 65_535;
const TRUNCATION_MARKER = "...[TRUNCATED]";
const TRUNCATION_MARKER_BYTES = Buffer.byteLength(TRUNCATION_MARKER, "utf8");

// Truncates a string to fit within a MySQL `text` column (65,535 bytes).
// Uses byte length (UTF-8) rather than character count, which is what MySQL enforces.
// Appends a clear marker.
function truncateToTextColumn(value: string | null | undefined): string | null {
  if (value == null) return null;
  if (Buffer.byteLength(value, "utf8") <= MAX_TEXT_COLUMN_BYTES) return value;
  const targetBytes = MAX_TEXT_COLUMN_BYTES - TRUNCATION_MARKER_BYTES;
  // subarray at a byte boundary; toString("utf8") safely drops any incomplete
  // multi-byte sequence at the cut point rather than producing mojibake.
  const truncated = Buffer.from(value, "utf8")
    .subarray(0, targetBytes)
    .toString("utf8");
  return truncated + TRUNCATION_MARKER;
}

// Audit log entry to be recorded
export interface AuditLogEntry {
  rabbitmq_topic: string;
  order_id?: string | null;
  program_id?: string | null;
  openhim_channel_id: string;
  openhim_endpoint: string;
  status: "success" | "failure" | "retry";
  http_status_code?: number | null;
  execution_time_ms?: number | null;
  attempt_number: number;
  request_payload?: string | null;
  response_payload?: string | null;
  error_message?: string | null;
  user_id?: string | null;
  user_email?: string | null;
  request_id?: string | null;
  trace_id?: string | null;
}

export interface LogSuccessOptions {
  topic: string;
  channelId: string;
  endpoint: string;
  httpStatusCode: number;
  executionTimeMs: number;
  payload: string;
  attemptNumber: number;
  traceId?: string;
  orderId?: string;
  programId?: string;
  userId?: string;
  userEmail?: string;
  requestId?: string;
}

export interface LogFailureOptions {
  topic: string;
  channelId: string;
  endpoint: string;
  error: string;
  attemptNumber?: number;
  httpStatusCode?: number;
  executionTimeMs?: number;
  payload?: string;
  traceId?: string;
  orderId?: string;
  programId?: string;
  userId?: string;
  userEmail?: string;
  requestId?: string;
  response?: string;
}

// Repository for managing audit logs
export class AuditLogRepository {
  private logger: Logger;

  constructor(
    private db: Kysely<Database>,
    logger: Logger,
  ) {
    this.logger = logger;
  }

  // Logs an event execution
  async log(entry: AuditLogEntry): Promise<void> {
    try {
      const now = new Date().toISOString();

      await this.db
        .insertInto("openhim_route_execution_logs")
        .values({
          rabbitmq_topic: entry.rabbitmq_topic,
          order_id: entry.order_id || null,
          program_id: entry.program_id || null,
          openhim_channel_id: entry.openhim_channel_id,
          openhim_endpoint: entry.openhim_endpoint,
          status: entry.status,
          http_status_code: entry.http_status_code || null,
          execution_time_ms: entry.execution_time_ms || null,
          attempt_number: entry.attempt_number,
          request_payload: truncateToTextColumn(entry.request_payload),
          response_payload: truncateToTextColumn(entry.response_payload),
          error_message: entry.error_message || null,
          user_id: entry.user_id || null,
          user_email: entry.user_email || null,
          request_id: entry.request_id || null,
          trace_id: entry.trace_id || null,
          created_at: now,
        } as ExecutionLogTable)
        .execute();

      this.logger.debug(
        {
          topic: entry.rabbitmq_topic,
          status: entry.status,
          channelId: entry.openhim_channel_id,
        },
        "Audit log entry recorded",
      );
    } catch (error) {
      this.logger.error({ error, entry }, "Failed to record audit log entry");
      // Don't throw - logging failure shouldn't block message processing
    }
  }

  // Logs a successful routing.
  // Response payload is intentionally NOT stored for successes
  async logSuccess(options: LogSuccessOptions): Promise<void> {
    await this.log({
      rabbitmq_topic: options.topic,
      openhim_channel_id: options.channelId,
      openhim_endpoint: options.endpoint,
      status: "success",
      http_status_code: options.httpStatusCode,
      execution_time_ms: options.executionTimeMs,
      attempt_number: options.attemptNumber,
      request_payload: options.payload,
      trace_id: options.traceId,
      order_id: options.orderId,
      program_id: options.programId,
      user_id: options.userId,
      user_email: options.userEmail,
      request_id: options.requestId,
    });
  }

  // Logs a failed routing attempt.
  // Pass `response` when the failure came back from OpenHIM (i.e. an unexpected HTTP status).
  async logFailure(options: LogFailureOptions): Promise<void> {
    await this.log({
      rabbitmq_topic: options.topic,
      openhim_channel_id: options.channelId,
      openhim_endpoint: options.endpoint,
      status: "failure",
      http_status_code: options.httpStatusCode || null,
      execution_time_ms: options.executionTimeMs,
      attempt_number: options.attemptNumber ?? 1,
      request_payload: options.payload,
      response_payload: options.response,
      error_message: options.error,
      trace_id: options.traceId,
      order_id: options.orderId,
      program_id: options.programId,
      user_id: options.userId,
      user_email: options.userEmail,
      request_id: options.requestId,
    });
  }

  // Queries logs for a specific topic
  async findByTopic(
    topic: string,
    limit: number = 100,
  ): Promise<ExecutionLogTable[]> {
    try {
      return await this.db
        .selectFrom("openhim_route_execution_logs")
        .selectAll()
        .where("rabbitmq_topic", "=", topic)
        .orderBy("created_at", "desc")
        .limit(limit)
        .execute();
    } catch (error) {
      this.logger.error({ error, topic }, "Failed to query logs by topic");
      return [];
    }
  }

  // Queries logs for a specific channel
  async findByChannel(
    channelId: string,
    limit: number = 100,
  ): Promise<ExecutionLogTable[]> {
    try {
      return await this.db
        .selectFrom("openhim_route_execution_logs")
        .selectAll()
        .where("openhim_channel_id", "=", channelId)
        .orderBy("created_at", "desc")
        .limit(limit)
        .execute();
    } catch (error) {
      this.logger.error(
        { error, channelId },
        "Failed to query logs by channel",
      );
      return [];
    }
  }

  // Counts failed executions for a topic in the last N minutes
  async countFailures(topic: string, minutesAgo: number = 60): Promise<number> {
    try {
      const cutoffTime = new Date(
        Date.now() - minutesAgo * 60 * 1000,
      ).toISOString();

      const result = await this.db
        .selectFrom("openhim_route_execution_logs")
        .select((db) => db.fn.count("id").as("count"))
        .where("rabbitmq_topic", "=", topic)
        .where("status", "=", "failure")
        .where("created_at", ">=", cutoffTime)
        .executeTakeFirst();

      return result ? Number(result.count) : 0;
    } catch (error) {
      this.logger.error({ error, topic }, "Failed to count failures");
      return 0;
    }
  }
}

// Factory function to create a repository instance
export function createAuditLogRepository(
  db: Kysely<Database>,
  logger: Logger,
): AuditLogRepository {
  return new AuditLogRepository(db, logger);
}
