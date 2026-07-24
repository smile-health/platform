import { Hono } from "hono";
import { serve as honoServe } from "@hono/node-server";
import { setupDependencies, performHealthCheck, handleShutdown } from "./wire";
import type { Dependencies } from "./wire";

// Creates and configures the HTTP server
function createServer(deps: Dependencies) {
  const app = new Hono();
  const logger = deps.logger;

  // Health check endpoint
  app.get("/health", async (c) => {
    try {
      const health = await deps.healthCheck.check(
        deps.db,
        deps.rabbitmqConnection,
        deps.openHIMClient,
        deps.routeMappingRepository.isLoaded()
      );

      const statusCode = health.status === "healthy" ? 200 : 503;

      return c.json(deps.healthCheck.toJSON(health), statusCode);
    } catch (error) {
      logger.error({ error }, "Health check endpoint error");
      return c.json(
        {
          status: "unhealthy",
          error: "Health check failed",
        },
        503
      );
    }
  });

  // Readiness probe (Kubernetes)
  app.get("/ready", async (c) => {
    const isReady = deps.routeMappingRepository.isLoaded();
    const statusCode = isReady ? 200 : 503;

    return c.json(
      {
        ready: isReady,
        timestamp: new Date().toISOString(),
      },
      statusCode
    );
  });

  // Liveness probe (Kubernetes)
  app.get("/live", (c) => {
    return c.json(
      {
        alive: true,
        timestamp: new Date().toISOString(),
      },
      200
    );
  });

  // Info endpoint
  app.get("/info", (c) => {
    return c.json({
      service: "interop-service",
      version: "1.0.0",
      environment: deps.env.NODE_ENV,
      topics: deps.routeMappingRepository.getTopics(),
      timestamp: new Date().toISOString(),
    });
  });

  // Admin: Refresh route mappings from database
  app.post("/admin/refresh-routes", async (c) => {
    try {
      logger.info("Refreshing route mappings from database...");

      await deps.routeMappingRepository.refresh();

      const topics = deps.routeMappingRepository.getTopics();
      const count = topics.length;

      logger.info({ count, topics }, "Route mappings refreshed successfully");

      return c.json({
        success: true,
        message: "Route mappings refreshed from database",
        count: count,
        topics: topics,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error({ error }, "Failed to refresh route mappings");
      return c.json(
        {
          success: false,
          error: "Failed to refresh route mappings",
          message: error instanceof Error ? error.message : "Unknown error",
        },
        500
      );
    }
  });

  // Admin: Get all route mappings (from cache)
  app.get("/admin/routes", (c) => {
    try {
      const routes = deps.routeMappingRepository.getEnabledMappings();

      return c.json({
        success: true,
        count: routes.length,
        routes: routes,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error({ error }, "Failed to get routes");
      return c.json(
        {
          success: false,
          error: "Failed to get routes",
        },
        500
      );
    }
  });

  return app;
}

/**
 * Starts the HTTP server
 */
async function startServer() {
  try {
    console.log("[START] Starting interop-service...");

    // Setup dependencies
    console.log("[INIT] Setting up dependencies...");
    const deps = await setupDependencies();
    console.log("[INIT] Dependencies setup complete");

    // Run health checks
    await performHealthCheck(deps);

    // Create server
    const app = createServer(deps);

    // Start listening
    const port = deps.env.PORT;
    const server = honoServe({
      fetch: app.fetch,
      port: port,
    });

    deps.logger.info(`*** HTTP server listening on port ${port}`);
    deps.logger.info(`   Health: http://localhost:${port}/health`);
    deps.logger.info(`   Ready: http://localhost:${port}/ready`);
    deps.logger.info(`   Info: http://localhost:${port}/info`);

    // Start RabbitMQ consumer (core functionality!)
    deps.logger.info("Starting RabbitMQ event consumer...");
    await deps.eventConsumer.start(
      (message) => deps.routerService.handleEvent(message),
      1,     // prefetch count
      false  // manual ack
    );
    deps.logger.info("RabbitMQ consumer ready - listening for events");

    // Setup graceful shutdown
    process.on("SIGTERM", () => handleShutdown(deps));
    process.on("SIGINT", () => handleShutdown(deps));

    return { app, server, deps };
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer().catch((err) => {
  console.error("[SERVER] Uncaught error in startServer:", err);
  process.exit(1);
});

export { createServer, startServer };
