import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
  // Application
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.coerce.number().default(4005),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
  // Optional path for writing logs to a file (in addition to console/stdout).
  // When not set, logs are only written to the console/stdout.
  LOG_FILE: z.string().optional(),

  // Database (same DB as interop-service)
  DB_HOST: z.string(),
  DB_PORT: z.coerce.number().default(3306),
  DB_NAME: z.string().default("smile_interop"),
  DB_USER: z.string(),
  DB_PASSWORD: z.string(),

  // OpenHIM admin credentials (same instance as interop-service)
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

  OPENHIM_REJECT_UNAUTHORIZED: z
    .enum(["true", "false"])
    .default("true")
    .transform((val) => val === "true"),

  // The hostname/IP OpenHIM uses to reach this mediator
  SERVICE_HOST: z.string().default("localhost"),

  // Timeout in ms for each outbound HTTP request to a routing target (default: 30s)
  TARGET_REQUEST_TIMEOUT_MS: z.coerce.number().int().positive().default(30000),

  // How often (ms) to check DB for routing rule changes. 0 = disabled. Default: disabled.
  // Uses change-detection (MAX(updated_at)+COUNT) — only reloads when something actually changed.
  ROUTING_RULES_REFRESH_INTERVAL_MS: z.coerce.number().int().nonnegative().default(0),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(): Env {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error("Invalid environment variables:", result.error.flatten());
    throw new Error("Environment validation failed");
  }

  return result.data;
}

export const env = validateEnv();
