/**
 * Logger Infrastructure with Pino + pino-roll
 */

import pino from "pino";
import type { Env } from "../../config/env";

export type LogLevel = "debug" | "info" | "warn" | "error" | "fatal" | "silent";

export function createLogger(env: Env) {
  const isDevelopment = env.NODE_ENV === "development";
  const logLevel = env.LOG_LEVEL || (isDevelopment ? "debug" : "info");

  const baseConfig = {
    level: logLevel,
    timestamp: pino.stdTimeFunctions.isoTime,
    mixin() {
      return {
        environment: env.NODE_ENV,
        service: "rule-router",
        version: "1.0.0",
      };
    },
  };

  // pino-roll produces: <base>.<yyyy-MM-dd>.log
  const logFileBase = env.LOG_FILE?.replace(/\.log$/i, "");

  const fileTransport: pino.TransportTargetOptions | null = logFileBase
    ? {
        target: "pino-roll",
        level: logLevel,
        options: {
          file: logFileBase,
          frequency: "daily",
          extension: ".log",
          dateFormat: "yyyy-MM-dd",
          mkdir: true,
        },
      }
    : null;

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

export function createModuleLogger(
  baseLogger: ReturnType<typeof createLogger>,
  moduleName: string,
) {
  return baseLogger.child({ module: moduleName });
}
