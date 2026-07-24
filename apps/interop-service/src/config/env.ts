import { z } from "zod";
import dotenv from "dotenv";

// Load .env file
dotenv.config();

const envSchema = z.object({
  // Application
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.coerce.number().default(4004),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
  // Optional path for writing logs to a file (in addition to console/stdout).
  // When not set, logs are only written to the console/stdout.
  LOG_FILE: z.string().optional(),

  // Database
  DB_HOST: z.string(),
  DB_PORT: z.coerce.number().default(3306),
  DB_NAME: z.string().default("smile_interop"),
  DB_USER: z.string(),
  DB_PASSWORD: z.string(),
  DATABASE_URL: z.string().optional(),

  // RabbitMQ
  RABBITMQ_HOST: z.string(),
  RABBITMQ_PORT: z.coerce.number().default(5672),
  RABBITMQ_USERNAME: z.string(),
  RABBITMQ_PASSWORD: z.string(),
  RABBITMQ_PROTOCOL: z.string().default("amqp"),
  RABBITMQ_VHOST: z.string().default("/"),
  // How many times to republish a message before permanently dropping it.
  RABBITMQ_MAX_RETRIES: z.coerce.number().int().nonnegative().default(3),

  // Redis
  REDIS_HOST: z.string(),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_PASSWORD: z.string().optional(),

  // OpenHIM
  // API endpoint for health checks and admin operations (port 8080)
  OPENHIM_API_ENDPOINT: z.string().default("https://localhost:8080"),
  OPENHIM_ADMIN_EMAIL: z.string().default("admin@openhim.local"),
  OPENHIM_ADMIN_PASSWORD: z.string().default("openhim"),

  // HTTP/HTTPS endpoint for sending transactions to channels (port 5000 for HTTPS)
  OPENHIM_HTTP_PROTOCOL: z.enum(["http", "https"]).default("https"),
  OPENHIM_HTTP_HOST: z.string().default("localhost"),
  OPENHIM_HTTP_PORT: z.coerce.number().default(5000),

  // Client credentials for channel authentication
  OPENHIM_CLIENT_ID: z.string().default("smile-app"),
  OPENHIM_CLIENT_SECRET: z.string(),

  // Request configuration
  OPENHIM_REQUEST_TIMEOUT_MS: z.coerce.number().default(30000),
  OPENHIM_REJECT_UNAUTHORIZED: z
    .enum(["true", "false"])
    .default("true")
    .transform((val) => val === "true"),
  // Global retry defaults for OpenHIM HTTP calls.
  // Per-route values in openhim_route_mappings override these when provided.
  OPENHIM_MAX_RETRIES: z.coerce.number().int().nonnegative().default(3),
  OPENHIM_RETRY_BACKOFF_MS: z.coerce.number().int().positive().default(1000),
  OPENHIM_RETRY_BACKOFF_MULTIPLIER: z.coerce.number().positive().default(2),

  // Route mapping cache auto-refresh. How often (ms) to check for DB changes. 0 = disabled. Default: 90s.
  ROUTE_MAPPING_REFRESH_INTERVAL_MS: z.coerce
    .number()
    .int()
    .nonnegative()
    .default(90000),

  // Transformation configuration
  ENABLE_PAYLOAD_TRANSFORMATION: z
    .enum(["true", "false"])
    .default("false")
    .transform((val) => val === "true"),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(): Env {
  const env = process.env;
  const result = envSchema.safeParse(env);

  if (!result.success) {
    console.error("Invalid environment variables:", result.error.flatten());
    throw new Error("Environment validation failed");
  }

  return result.data;
}

export const env = validateEnv();
