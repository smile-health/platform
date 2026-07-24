// Health Check Service to monitor connectivity to external dependencies

import type { Kysely } from "kysely";
import type { Connection } from "amqplib";
import type { Logger } from "pino";
import type { Database } from "./database";
import { OpenHIMClient } from "./http/openhim-client";
import { checkDatabaseHealth } from "./database";
import https from "https";
import http from "http";

export interface ServiceHealth {
  name: string;
  status: "healthy" | "unhealthy";
  responseTimeMs: number;
  error?: string;
}

export interface HealthCheckResult {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  services: ServiceHealth[];
  summary: string;
}

// Health Check Service
export class HealthCheckService {
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  /**
   * Run all health checks
   *
   * @param db Database connection
   * @param rabbitmqConnection RabbitMQ connection
   * @param openHIMClient OpenHIM HTTP client
   * @param routeMappingsLoaded Whether route mappings are loaded
   * @returns Health check result
   */
  async check(
    db: Kysely<Database>,
    rabbitmqConnection: Connection,
    openHIMClient: OpenHIMClient,
    routeMappingsLoaded: boolean
  ): Promise<HealthCheckResult> {
    const startTime = Date.now();
    const services: ServiceHealth[] = [];

    // Check Database
    const dbHealth = await this.checkDatabase(db);
    services.push(dbHealth);

    // Check RabbitMQ
    const rabbitmqHealth = await this.checkRabbitMQ(rabbitmqConnection);
    services.push(rabbitmqHealth);

    // Check OpenHIM
    const openHIMHealth = await this.checkOpenHIM(openHIMClient);
    services.push(openHIMHealth);

    // Check Route Mappings
    const mappingsHealth: ServiceHealth = {
      name: "Route Mappings",
      status: routeMappingsLoaded ? "healthy" : "unhealthy",
      responseTimeMs: 0,
      error: routeMappingsLoaded ? undefined : "Route mappings not loaded",
    };
    services.push(mappingsHealth);

    const totalTimeMs = Date.now() - startTime;

    // Determine overall status
    const unhealthyServices = services.filter((s) => s.status === "unhealthy");
    const overallStatus =
      unhealthyServices.length === 0
        ? "healthy"
        : unhealthyServices.length < services.length
          ? "degraded"
          : "unhealthy";

    const result: HealthCheckResult = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      services,
      summary: this.createSummary(services, totalTimeMs),
    };

    // Log results
    this.logHealthCheck(result);

    return result;
  }

  // Check database connectivity
  private async checkDatabase(db: Kysely<Database>): Promise<ServiceHealth> {
    const startTime = Date.now();

    try {
      const isHealthy = await checkDatabaseHealth(db, this.logger);
      const responseTimeMs = Date.now() - startTime;

      return {
        name: "SMILE Interop Database (MySQL)",
        status: isHealthy ? "healthy" : "unhealthy",
        responseTimeMs,
        error: isHealthy ? undefined : "Database query failed",
      };
    } catch (error) {
      const responseTimeMs = Date.now() - startTime;
      return {
        name: "SMILE Interop Database (MySQL)",
        status: "unhealthy",
        responseTimeMs,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  // Check RabbitMQ connectivity
  private async checkRabbitMQ(connection: Connection): Promise<ServiceHealth> {
    const startTime = Date.now();

    try {
      // Try to create a channel - this tests the connection
      const channel = await connection.createChannel();
      await channel.close();

      const responseTimeMs = Date.now() - startTime;

      return {
        name: "RabbitMQ",
        status: "healthy",
        responseTimeMs,
      };
    } catch (error) {
      const responseTimeMs = Date.now() - startTime;
      return {
        name: "RabbitMQ",
        status: "unhealthy",
        responseTimeMs,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  // Check OpenHIM API connectivity
  private async checkOpenHIM(client: OpenHIMClient): Promise<ServiceHealth> {
    const startTime = Date.now();

    try {
      // Send a health check request to OpenHIM heartbeat endpoint
      const config = client.getConfig();
      const url = new URL(config.apiEndpoint);
      url.pathname = "/heartbeat";

      const response = await this.makeHealthRequest(url.toString());

      const responseTimeMs = Date.now() - startTime;

      // Accept 200, 401 (auth error is ok - means service is up), or other 2xx/4xx
      // 5xx would indicate service is down
      const isHealthy = response.status < 500;

      return {
        name: "OpenHIM API",
        status: isHealthy ? "healthy" : "unhealthy",
        responseTimeMs,
        error: isHealthy ? undefined : `HTTP ${response.status}`,
      };
    } catch (error) {
      const responseTimeMs = Date.now() - startTime;
      return {
        name: "OpenHIM API",
        status: "unhealthy",
        responseTimeMs,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Makes a health request to a URL
   *
   * @private
   */
  private makeHealthRequest(baseUrl: string): Promise<{ status: number }> {
    return new Promise((resolve, reject) => {
      const url = new URL(baseUrl);
      const protocol = url.protocol === "https:" ? https : http;

      const request = protocol.request(
        {
          hostname: url.hostname,
          port: url.port,
          path: url.pathname || "/",
          method: "GET",
          timeout: 5000,
          // Allow self-signed certificates in development
          rejectUnauthorized: false,
        },
        (response: any) => {
          resolve({ status: response.statusCode || 0 });
        }
      );

      request.on("error", reject);
      request.on("timeout", () => {
        request.destroy();
        reject(new Error("Request timeout"));
      });

      request.end();
    });
  }

  // Create summary of health check results
  private createSummary(
    services: ServiceHealth[],
    totalTimeMs: number
  ): string {
    const healthy = services.filter((s) => s.status === "healthy").length;
    const total = services.length;

    const details = services
      .map((s) => {
        const icon = s.status === "healthy" ? "✅" : "❌";
        const time = s.responseTimeMs > 0 ? ` (${s.responseTimeMs}ms)` : "";
        const error = s.error ? ` - ${s.error}` : "";
        return `  ${icon} ${s.name}${time}${error}`;
      })
      .join("\n");

    return `${healthy}/${total} services healthy (${totalTimeMs}ms total)\n${details}`;
  }

  // Logs health check results
  private logHealthCheck(result: HealthCheckResult): void {
    const statusEmoji = {
      healthy: "✅",
      degraded: "⚠️",
      unhealthy: "❌",
    };

    if (result.status === "healthy") {
      this.logger.info(
        {
          status: result.status,
          services: result.services,
          timestamp: result.timestamp,
        },
        `${statusEmoji[result.status]} HEALTH CHECK PASSED - All dependencies healthy`
      );
    } else if (result.status === "degraded") {
      this.logger.warn(
        {
          status: result.status,
          services: result.services,
          timestamp: result.timestamp,
        },
        `${statusEmoji[result.status]} HEALTH CHECK DEGRADED - Some services may be unavailable`
      );
    } else {
      this.logger.error(
        {
          status: result.status,
          services: result.services,
          timestamp: result.timestamp,
        },
        `${statusEmoji[result.status]} HEALTH CHECK FAILED - Critical services unavailable`
      );
    }

    // Also log the detailed summary
    this.logger.info(result.summary);
  }

  // Returns a health check object suitable for HTTP responses
  toJSON(result: HealthCheckResult) {
    return {
      status: result.status,
      timestamp: result.timestamp,
      services: result.services.map((s) => ({
        name: s.name,
        status: s.status,
        responseTimeMs: s.responseTimeMs,
        error: s.error,
      })),
    };
  }
}

// Factory function to create health check service
export function createHealthCheckService(logger: Logger): HealthCheckService {
  return new HealthCheckService(logger);
}
