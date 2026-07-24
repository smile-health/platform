import { Context, Next } from "hono";
import { TransactionManager } from "../database.js";
import { trace, SpanStatusCode } from "@opentelemetry/api";

const otlpEnabled = process.env.OTLP_ENABLED === "true";

export class TransactionMiddleware<DB> {
  private readonly tracer = trace.getTracer("transaction-middleware");

  constructor(private trxManager: TransactionManager<DB>) {}

  public handle = async (c: Context, next: Next) => {
    // Skip tracing overhead when disabled
    if (!otlpEnabled) {
      await this.trxManager.transaction(async (trx) => {
        c.set("trx", trx);
        await next();
        if (c.error) throw c.error;
      });
      return;
    }

    // Single span for transaction lifecycle (reduced from 2 spans)
    await this.tracer.startActiveSpan("trx.lifecycle", async (span) => {
      const acquireStart = Date.now();
      try {
        await this.trxManager.transaction(async (trx) => {
          const acquireTime = Date.now() - acquireStart;
          span.setAttribute("trx.acquire_ms", acquireTime);
          
          c.set("trx", trx);
          
          const execStart = Date.now();
          await next();
          span.setAttribute("trx.exec_ms", Date.now() - execStart);
          
          if (c.error) throw c.error;
        });
        span.setStatus({ code: SpanStatusCode.OK });
      } catch (error: any) {
        span.recordException(error);
        span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
        throw error;
      } finally {
        span.end();
      }
    });
  };
}
