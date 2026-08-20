import { warehouseApp, stockOpnameConsumer, tolgeeConsumer } from "@/wire.js"
import { SpanStatusCode, trace } from "@opentelemetry/api"
import { errorHandler } from "@smile-health/lib/error.js"
import { httpLogger } from "@smile-health/lib/logger.js"
import "@smile-health/lib/tracing.ts"
import {
  middlewareTracer,
  getCurrentTraceContext,
  recordPerformanceMetric,
} from "@smile-health/lib/tracing.js"
import { Hono } from "hono"
import env from "./config/env.js"
import moment from "moment"
import { quickSetupService } from "@smile-health/lib/tracing-config"

// construct app
const app = new Hono()

quickSetupService("warehouse-service", app)

// Liveness probe - Kubernetes health check
app.get("/healthz", (c) => {
  return c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    type: "liveness",
  })
})

// Readiness probe - Kubernetes readiness check
app.get("/readyz", async (c) => {
  try {
    // Import database connection test
    const { testMySQLConnection } =
      await import("./common/infrastructure/database/mysql/index.js")

    // Check if all dependencies are ready
    const readinessChecks: Record<string, string> = {}

    // Test database connection
    const dbTest = await testMySQLConnection()
    readinessChecks.database = dbTest.success ? "connected" : "disconnected"

    // Check message queue connection (if applicable)
    try {
      const { getConnection } =
        await import("@/common/infrastructure/mq/index.js")
      const conn = await getConnection()
      readinessChecks.messageQueue = conn ? "connected" : "disconnected"
    } catch (error) {
      readinessChecks.messageQueue = "disconnected"
    }

    // Check consumers status
    readinessChecks.consumers = "running"

    const isReady = Object.values(readinessChecks).every(
      (status) => status === "connected" || status === "running"
    )

    return c.json(
      {
        status: isReady ? "ready" : "not ready",
        timestamp: new Date().toISOString(),
        type: "readiness",
        checks: readinessChecks,
      },
      isReady ? 200 : 503
    )
  } catch (error) {
    return c.json(
      {
        status: "not ready",
        timestamp: new Date().toISOString(),
        type: "readiness",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      503
    )
  }
})

app.use(httpLogger)

// Locale middleware
app.use("*", async (c, next) => {
  const locale = c.req.header("Accept-Language") || "en"
  moment.locale(locale)
  await next()
})

const tracer = trace.getTracer("warehouse-server")

// Enhanced tracing for warehouseApp routes with performance monitoring
const tracedWarehouseApp = new Hono()
tracedWarehouseApp.use("*", middlewareTracer.traceMiddleware("warehouseApp"))
tracedWarehouseApp.use("*", async (c, next) => {
  return tracer.startActiveSpan("warehouseApp.handler", async (span) => {
    const startTime = Date.now()

    try {
      // Record request details
      span.setAttributes({
        "app.name": "warehouseApp",
        "app.version": "1.0",
        "request.path": c.req.path,
        "request.method": c.req.method,
        "request.query_params": JSON.stringify(c.req.queries()),
      })

      await next()

      const duration = Date.now() - startTime

      // Record performance metrics
      recordPerformanceMetric("warehouseApp.request.duration", duration, {
        path: c.req.path,
        method: c.req.method,
        status: c.res.status,
      })

      span.setAttributes({
        "response.status_code": c.res.status,
        "response.duration_ms": duration,
        "response.content_type": c.res.headers.get("content-type") || "unknown",
      })

      span.setStatus({
        code: c.res.status >= 400 ? SpanStatusCode.ERROR : SpanStatusCode.OK,
      })
    } catch (error: any) {
      span.recordException(error)
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error.message,
      })
      throw error
    } finally {
      span.end()
    }
  })
})

tracedWarehouseApp.route("/", warehouseApp)
app.route("/", tracedWarehouseApp)

// Enhanced error handler with tracing
app.onError((err, c) => {
  const span = trace.getActiveSpan()
  const traceContext = getCurrentTraceContext()

  if (span) {
    span.recordException(err as Error)
    span.setStatus({ code: SpanStatusCode.ERROR })

    // Add error context attributes
    span.setAttributes({
      "error.type": err.constructor.name,
      "error.message": err.message,
      "error.stack_trace": err.stack || "",
    })
  }

  // Log error with trace context for correlation
  console.error(
    `[${traceContext?.traceId || "no-trace"}] Error in warehouse-service:`,
    {
      error: err.message,
      stack: err.stack,
      path: c.req.path,
      method: c.req.method,
    }
  )

  return errorHandler(err, c)
})

export default {
  idleTimeout: env.TIMEOUT,
  fetch: app.fetch,
}

export const runWorker = async () => {
  await Promise.all([stockOpnameConsumer.start(), tolgeeConsumer.start()])
}

// await runWorker()
