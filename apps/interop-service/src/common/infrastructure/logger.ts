/**
 * Logger Infrastructure with Pino
 * Centralized logger that can be injected into services
 */

import pino from "pino";
import type { Env } from "../../config/env";

export type LogLevel = "debug" | "info" | "warn" | "error" | "fatal" | "silent";

/**
 * Create a Pino logger instance configured based on the environment
 * In development: Pretty-prints logs for readability
 * In production: JSON logs for aggregation
 */
export function createLogger(env: Env) {
  const isDevelopment = env.NODE_ENV === "development";
  const logLevel = env.LOG_LEVEL || (isDevelopment ? "debug" : "info");

  const baseConfig = {
    level: logLevel,
    timestamp: pino.stdTimeFunctions.isoTime,
    // Add request/trace context via mixin if available
    mixin() {
      return {
        environment: env.NODE_ENV,
        service: "interop-service",
        version: "1.0.0",
      };
    },
  };

  // Provide logs/interop-service.log" in env file,pino-roll then produces: logs/interop-service.2026-02-26.log
  const logFileBase = env.LOG_FILE?.replace(/\.log$/i, "");

  const fileTransport: pino.TransportTargetOptions | null = logFileBase
    ? {
        target: "pino-roll",
        level: logLevel,
        options: {
          file: logFileBase,
          frequency: "daily", // rotate at midnight
          extension: ".log", // suffix added after the date
          dateFormat: "yyyy-MM-dd",
          mkdir: true, // create the logs/ directory if absent
        },
      }
    : null;

  // pretty print logs in development
  if (isDevelopment) {
    const targets: pino.TransportTargetOptions[] = [
      {
        target: "pino-pretty",
        level: logLevel,
        options: {
          colorize: true,
          translateTime: "SYS:standard",
          ignore: "pid,hostname",
          singleLine: false,
        },
      },
    ];

    if (fileTransport) targets.push(fileTransport);

    return pino({ ...baseConfig, transport: { targets } });
  }

  // Production: JSON to stdout, plus rotating file if configured
  const targets: pino.TransportTargetOptions[] = [
    {
      target: "pino/file",
      level: logLevel,
      options: { destination: 1 }, // stdout
    },
  ];

  if (fileTransport) targets.push(fileTransport);

  return pino({ ...baseConfig, transport: { targets } });
}

// Creates a child logger with additional context for adding request-specific context to logs
export function createChildLogger(
  logger: ReturnType<typeof createLogger>,
  context: Record<string, unknown>,
) {
  return logger.child(context);
}

// Helper to create a contextual logger for a specific domain/module for creating loggers in repositories, services, etc.
export function createModuleLogger(
  baseLogger: ReturnType<typeof createLogger>,
  moduleName: string,
) {
  return baseLogger.child({ module: moduleName });
}
