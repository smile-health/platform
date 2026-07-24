import {
  entityConsumer,
  mainApp,
  orderConsumer,
  reconciliationConsumer,
  stockConsumer,
  stockOpnameConsumer,
  tolgeeConsumer,
  transactionConsumer,
} from "@/wire.js"
import { SpanStatusCode, trace } from "@opentelemetry/api"
import { errorHandler } from "@smile-health/lib/error.js"
import { httpLogger } from "@smile-health/lib/logger.js"
import {
  getCurrentTraceContext,
  middlewareTracer,
  recordPerformanceMetric,
} from "@smile-health/lib/tracing.js"
import "@smile-health/lib/tracing.ts"
import { Hono } from "hono"
import env from "./config/env.js"
import { app as openapiApp } from "./openapi.js"
import { quickSetupService } from "@smile-health/lib/tracing-config"

// construct app
const app = new Hono()

quickSetupService("main-service", app)

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
      await import("./common/infrastructure/database/index.js")

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
const tracer = trace.getTracer("main-server")

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
    `[${traceContext?.traceId || "no-trace"}] Error in main-service:`,
    {
      error: err.message,
      stack: err.stack,
      path: c.req.path,
      method: c.req.method,
    }
  )

  return errorHandler(err, c)
})

// Enhanced tracing for OpenAPI routes with performance monitoring
const tracedOpenapiApp = new Hono()
tracedOpenapiApp.use("*", middlewareTracer.traceMiddleware("openapi"))
tracedOpenapiApp.use("*", async (c, next) => {
  return tracer.startActiveSpan("openapi.handler", async (span) => {
    const startTime = Date.now()

    try {
      // Record request details
      span.setAttributes({
        "app.name": "openapi",
        "app.version": "1.0",
        "request.path": c.req.path,
        "request.method": c.req.method,
        "request.query_params": JSON.stringify(c.req.queries()),
      })

      await next()

      const duration = Date.now() - startTime

      // Record performance metrics
      recordPerformanceMetric("openapi.request.duration", duration, {
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

// Enhanced tracing for mainApp routes with performance monitoring
const tracedMainApp = new Hono()
tracedMainApp.use("*", middlewareTracer.traceMiddleware("mainApp"))
tracedMainApp.use("*", async (c, next) => {
  return tracer.startActiveSpan("mainApp.handler", async (span) => {
    const startTime = Date.now()

    try {
      // Record request details
      span.setAttributes({
        "app.name": "mainApp",
        "app.version": "1.0",
        "request.path": c.req.path,
        "request.method": c.req.method,
        "request.query_params": JSON.stringify(c.req.queries()),
      })

      await next()

      const duration = Date.now() - startTime

      // Record performance metrics
      recordPerformanceMetric("mainApp.request.duration", duration, {
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

tracedOpenapiApp.route("/", openapiApp)
tracedMainApp.route("/", mainApp)

app.route("/api", tracedOpenapiApp)
app.route("/", tracedMainApp)

export default {
  idleTimeout: env.TIMEOUT,
  fetch: app.fetch,
}

export const runWorker = async () => {
  await Promise.all([
    stockConsumer.start(),
    transactionConsumer.start(),
    entityConsumer.start(),
    stockOpnameConsumer.start(),
    reconciliationConsumer.start(),
    orderConsumer.start(),
  ])
}

await tolgeeConsumer.start() // tolgee consumer still need to run on main server

// await runWorker()
