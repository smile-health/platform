import { Hono } from "hono";
import { serve as honoServe } from "@hono/node-server";
import { setupDependencies, handleShutdown } from "./wire";
import type { Dependencies } from "./wire";
import { checkDatabaseHealth } from "./common/infrastructure/database/connection";

function createServer(deps: Dependencies) {
  const app = new Hono();
  const logger = deps.logger;

  // --- Main mediator endpoint ---
  app.post("/route", async (c) => {
    return deps.routingService.handleRoute(c);
  });

  // --- Health check ---
  app.get("/health", async (c) => {
    try {
      const dbHealthy = await checkDatabaseHealth(deps.db, logger);

      const status = dbHealthy ? "healthy" : "unhealthy";
      const statusCode = dbHealthy ? 200 : 503;

      return c.json(
        {
          status,
          timestamp: new Date().toISOString(),
          checks: {
            database: dbHealthy ? "ok" : "error",
            rulesLoaded: deps.routingRepository.isLoaded(),
          },
        },
        statusCode
      );
    } catch (error) {
      logger.error({ error }, "Health check endpoint error");
      return c.json({ status: "unhealthy", error: "Health check failed" }, 503);
    }
  });

  // --- Liveness probe ---
  app.get("/live", (c) => {
    return c.json({ alive: true, timestamp: new Date().toISOString() }, 200);
  });

  // --- Readiness probe ---
  app.get("/ready", (c) => {
    const isReady = deps.routingRepository.isLoaded();
    return c.json(
      { ready: isReady, timestamp: new Date().toISOString() },
      isReady ? 200 : 503
    );
  });

  // --- Admin: reload routing rules from DB ---
  app.post("/admin/refresh-rules", async (c) => {
    try {
      logger.info("Refreshing routing rules from database...");
      await deps.routingRepository.refresh();
      const rules = deps.routingRepository.getAllEnabledRules();

      return c.json({
        success: true,
        message: "Routing rules refreshed",
        count: rules.length,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error({ error }, "Failed to refresh routing rules");
      return c.json(
        {
          success: false,
          error: "Failed to refresh routing rules",
          message: error instanceof Error ? error.message : "Unknown error",
        },
        500
      );
    }
  });

  // --- Admin: list all enabled rules ---
  app.get("/admin/rules", (c) => {
    try {
      const rules = deps.routingRepository.getAllEnabledRules();
      return c.json({
        success: true,
        count: rules.length,
        rules,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error({ error }, "Failed to list routing rules");
      return c.json({ success: false, error: "Failed to list rules" }, 500);
    }
  });

  return app;
}

async function startServer() {
  try {
    console.log("[START] Starting rule-router...");

    console.log("[STEP 1] Calling setupDependencies()...");
    const deps = await setupDependencies();
    console.log("[STEP 2] setupDependencies() returned successfully");

    // Log connection status after setup
    console.log("[STEP 3] Logging connection status...");
    deps.logger.info("=== Connection Status ===");
    deps.logger.info({
      database: {
        host: deps.env.DB_HOST,
        port: deps.env.DB_PORT,
        database: deps.env.DB_NAME,
        status: "connected",
      },
      routingRules: {
        loaded: deps.routingRepository.isLoaded(),
        count: deps.routingRepository.getAllEnabledRules().length,
      },
      openhim: {
        apiEndpoint: deps.env.OPENHIM_API_ENDPOINT,
        mediatorId: deps.env.OPENHIM_CLIENT_ID,
        heartbeatActive: deps.heartbeatIntervalId !== null,
      },
    });

    const app = createServer(deps);
    const port = deps.env.PORT;

    console.log("[STEP 4] Creating HTTP server...");
    const server = honoServe({
      fetch: app.fetch,
      port,
    });
    console.log("[STEP 5] HTTP server created");

    deps.logger.info(`*** HTTP server listening on port ${port}`);
    deps.logger.info("=== Available Endpoints ===");
    deps.logger.info(`   POST  /route          - Route event to downstream adapter`);
    deps.logger.info(`   GET   /health         - Health check (DB + rules status)`);
    deps.logger.info(`   GET   /live           - Liveness probe`);
    deps.logger.info(`   GET   /ready          - Readiness probe (rules loaded?)`);
    deps.logger.info(`   POST  /admin/refresh-rules - Reload rules from DB`);
    deps.logger.info(`   GET   /admin/rules    - List all enabled rules`);
    deps.logger.info("========================");

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
