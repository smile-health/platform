import { serve } from "@hono/node-server";
import { swaggerUI } from "@hono/swagger-ui";
import { OpenAPIHono } from "@hono/zod-openapi";
import { httpLogger } from "@smile/lib/logger";
import { RequestMiddleware } from "@smile/lib/middlewares";
import dotenv from "dotenv";
import { cors } from "hono/cors";
import { env } from "process";
import { AuthController } from "./controllers/authController";
import { AuthExecutiveController } from "./controllers/authExecutiveController";
import { UserController } from "./controllers/userController";
import { quickSetupService } from "@smile/lib/tracing-config";

dotenv.config();

const app = new OpenAPIHono();
const appPrefix = env.API_PREFIX ?? "";

quickSetupService("auth-service", app);
app.use(cors());
app.use(httpLogger);
app.openAPIRegistry.registerComponent("securitySchemes", "Bearer", {
  type: "http",
  scheme: "bearer",
  bearerFormat: "JWT",
});

app.get("/", (c) => {
  return c.redirect(`${appPrefix}/ui`);
});

// Liveness probe - Kubernetes health check
app.get("/healthz", (c) => {
  return c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    type: "liveness",
  });
});

// Readiness probe - Kubernetes readiness check
app.get("/readyz", async (c) => {
  try {
    // Check if all dependencies are ready
    const readinessChecks: Record<string, string> = {};

    // Test Keycloak connection
    try {
      const keycloakClient = (await import("./keycloakClient")).default;
      await keycloakClient.getRoles();
      readinessChecks.keycloak = "connected";
    } catch (error) {
      readinessChecks.keycloak = "disconnected";
    }

    // Test user service connection
    try {
      const userServiceClient = (await import("./userServiceClient")).default;
      await userServiceClient.validateUserExists("health-check");
      readinessChecks.userService = "connected";
    } catch (error) {
      // User not found is expected for health check, service is up if no network error
      if (
        error instanceof Error &&
        !error.message.includes("ECONNREFUSED") &&
        !error.message.includes("timeout")
      ) {
        readinessChecks.userService = "connected";
      } else {
        readinessChecks.userService = "disconnected";
      }
    }

    const isReady = Object.values(readinessChecks).every(
      (status) => status === "connected",
    );

    return c.json(
      {
        status: isReady ? "ready" : "not ready",
        timestamp: new Date().toISOString(),
        type: "readiness",
        checks: readinessChecks,
      },
      isReady ? 200 : 503,
    );
  } catch (error) {
    return c.json(
      {
        status: "not ready",
        timestamp: new Date().toISOString(),
        type: "readiness",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      503,
    );
  }
});

// register middleware error message language
app.use("*", new RequestMiddleware().handle);

// Register routes from Controllers
AuthController.registerRoutes(app);
UserController.registerRoutes(app);
AuthExecutiveController.registerRoutes(app);

// The Swagger UI will be available at /ui
app.get(
  "/ui",
  swaggerUI({
    url: `${appPrefix}/doc`,
  }),
);

// The OpenAPI documentation will be available at /doc
app.doc("/doc", {
  openapi: "3.0.0",
  info: {
    version: "1.0.0",
    title: "Auth Service API",
  },
  servers: [
    {
      url: `${appPrefix}`,
    },
  ],
});

const port: number = parseInt(process.env.PORT ?? "3000") || 3000;
console.log(`Auth Service is running on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
});
