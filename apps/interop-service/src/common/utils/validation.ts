// Validation Schemas and Helpers

import { z } from "zod";

// Schema for RabbitMQ message envelope, validates incoming messages from the queue
export const messageEnvelopeSchema = z.object({
  topic: z.string().min(1, "Topic is required"),
  payload: z.unknown(),
  timestamp: z.number().int().positive("Timestamp must be positive"),
  headers: z.record(z.string()).optional(),
  messageId: z.string().optional(),
  context: z
    .object({
      program_id: z.string().optional(),
      workspace_id: z.string().optional(),
      user_id: z.string().optional(),
      user_email: z.string().email().optional(),
      request_id: z.string().optional(),
      trace_id: z.string().optional(),
      client_key: z.string().optional(),
    })
    .optional(),
});

// Schema for message context
export const messageContextSchema = z.object({
  program_id: z.string().optional(),
  workspace_id: z.string().optional(),
  user_id: z.string().optional(),
  user_email: z.string().email().optional(),
  request_id: z.string().optional(),
  trace_id: z.string().optional(),
  client_key: z.string().optional(),
});

// Schema for CloudEvent validation
export const cloudEventSchema = z.object({
  specversion: z.literal("1.0"),
  type: z.string().min(1, "Type is required"),
  source: z.string().min(1, "Source is required"),
  id: z.string().uuid("ID must be a valid UUID"),
  time: z.string().datetime("Time must be ISO 8601 format"),
  datacontenttype: z.string().default("application/json"),
  dataschema: z.string().optional(),
  subject: z.string().optional(),
  traceparent: z.string().optional(),
  data: z.unknown(),
});

// Schema for route mapping configuration from database
export const routeMappingSchema = z.object({
  id: z.number().int().positive(),
  rabbitmq_topic: z.string().min(1),
  enabled: z.coerce.boolean(),
  openhim_channel_id: z.string().min(1),
  openhim_channel_name: z.string().min(1),
  http_method: z.enum(["POST", "PUT", "PATCH"]),
  request_path: z.string().default("/"),
  // mysql2 auto-parses JSON columns to objects — stringify back to string
  headers_json: z.preprocess(
    (val) => (val !== null && val !== undefined && typeof val !== "string" ? JSON.stringify(val) : val),
    z.string().nullable().optional()
  ),
  include_context: z.coerce.boolean(),
  auth_type: z.string(),
  // mysql2 auto-parses JSON columns to objects — stringify back to string
  auth_config_json: z.preprocess(
    (val) => (val !== null && val !== undefined && typeof val !== "string" ? JSON.stringify(val) : val),
    z.string().nullable().optional()
  ),
  max_retries: z.number().int().nonnegative(),
  retry_backoff_ms: z.number().int().positive(),
  retry_backoff_multiplier: z.number().positive(),
  expected_status_codes: z.string(),
  // mysql2 returns Date objects for DATETIME columns — convert to ISO string
  created_at: z.preprocess(
    (val) => (val instanceof Date ? val.toISOString() : val),
    z.string().datetime()
  ),
  updated_at: z.preprocess(
    (val) => (val instanceof Date ? val.toISOString() : val),
    z.string().datetime()
  ),
  created_by: z.string().nullable().optional(),
});

// Schema for audit log entry
export const auditLogSchema = z.object({
  rabbitmq_topic: z.string().min(1),
  order_id: z.string().optional().nullable(),
  program_id: z.string().optional().nullable(),
  openhim_channel_id: z.string().min(1),
  openhim_endpoint: z.string().min(1),
  status: z.enum(["success", "failure", "retry"]),
  http_status_code: z.number().int().optional().nullable(),
  execution_time_ms: z.number().int().nonnegative(),
  attempt_number: z.number().int().positive(),
  request_payload: z.string().optional().nullable(),
  response_payload: z.string().optional().nullable(),
  error_message: z.string().optional().nullable(),
  user_id: z.string().optional().nullable(),
  user_email: z.string().optional().nullable(),
  request_id: z.string().optional().nullable(),
  trace_id: z.string().optional().nullable(),
});

// Schema for expected status codes as array of numbers
export const expectedStatusCodesSchema = z
  .string()
  .transform((val) => val.split(",").map((code) => parseInt(code.trim(), 10)))
  .refine((codes) => codes.every((code) => !isNaN(code)), {
    message: "Expected status codes must be valid numbers",
  });

// Helper function to validate an object against a schema
export function validate<T>(schema: z.ZodSchema<T>, data: unknown): T {
  return schema.parse(data);
}

// Helper function to safely validate without throwing
export function safeValidate<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: z.ZodError } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error };
}

// Type exports for convenience
export type ValidatedMessage = z.infer<typeof messageEnvelopeSchema>;
export type ValidatedMessageContext = z.infer<typeof messageContextSchema>;
export type ValidatedCloudEvent = z.infer<typeof cloudEventSchema>;
export type ValidatedRouteMapping = z.infer<typeof routeMappingSchema>;
export type ValidatedAuditLog = z.infer<typeof auditLogSchema>;
