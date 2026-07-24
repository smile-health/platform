/**
 * Routing Service — main orchestrator.
 *
 * Flow:
 *   1. Parse incoming request as CloudEvent JSON
 *   2. Load enabled rules for this topic from cache
 *   3. Evaluate rules via routing.engine.ts
 *   4a. If matches found → forward to each matched target in parallel
 *   4b. If no matches → use is_default=TRUE rules for the topic
 *   5. Build and return OpenHIM mediator response with orchestrations array
 *
 * Fan-out failure policy: if ANY forwarded call fails, status = "Failed".
 * OpenHIM will then return non-2xx to the interop-service which retries via x-retry-count.
 */

import https from "https";
import http from "http";
import type { Logger } from "pino";
import type { Context } from "hono";
import type {
  ForwardResult,
  IncomingEvent,
  MediatorResponse,
  OpenHIMOrchestration,
  RoutingRule,
} from "../../common/types/routing";
import type { RoutingRepository } from "./routing.repository";
import { matchRules } from "./routing.engine";
import type { Env } from "../../config/env";

const MEDIATOR_URN = "urn:mediator:smile-rule-router";

// Headers forwarded from the incoming OpenHIM request to each target
const FORWARDED_HEADERS = [
  "x-trace-id",
  "x-request-id",
  "x-correlation-id",
  "x-integration-client",
  "content-type",
];

export class RoutingService {
  private logger: Logger;

  constructor(
    private env: Env,
    private repository: RoutingRepository,
    logger: Logger,
  ) {
    this.logger = logger;
  }

  /**
   * Main entry point — called by POST /route handler.
   */
  async handleRoute(c: Context): Promise<Response> {
    const startTime = Date.now();

    // 1. Parse body
    let rawBody: string;
    let cloudEvent: Record<string, any>;

    try {
      rawBody = await c.req.text();
      cloudEvent = JSON.parse(rawBody);
    } catch (error) {
      this.logger.warn({ error }, "Failed to parse request body as JSON");
      return c.json(this.buildErrorResponse("Invalid JSON body", 400), 400);
    }

    // 2. Build IncomingEvent
    const event = this.parseIncomingEvent(cloudEvent, rawBody, c);

    this.logger.info(
      {
        eventId: event.id,
        topic: event.topic,
        client_key: event.client_key,
        program_id: event.program_id,
      },
      "Routing event",
    );

    // 3. Load rules for this topic
    const specificRules = this.repository.getRulesForTopic(event.topic);
    const defaultRules = this.repository.getDefaultRulesForTopic(event.topic);

    // 4. Evaluate specific rules
    const matchedRules = matchRules(specificRules, event, this.logger);

    let targetRules: RoutingRule[];
    let routingDecision: string;

    if (matchedRules.length > 0) {
      targetRules = matchedRules;
      routingDecision = `Matched ${matchedRules.length} specific rule(s)`;
    } else if (defaultRules.length > 0) {
      targetRules = defaultRules;
      routingDecision = `No specific rules matched — using ${defaultRules.length} default rule(s)`;
    } else {
      const hasRules = specificRules.length > 0;
      const logMessage = hasRules
        ? "No rules matched for this event — no routing performed"
        : "No routing rules configured for topic";
      const responseMessage = hasRules
        ? `No rules matched for topic '${event.topic}' — no routing performed`
        : `No routing rules configured for topic '${event.topic}'`;

      this.logger.warn({ topic: event.topic }, logMessage);
      return c.json(
        this.buildMediatorResponse("Successful", 200, responseMessage, []),
        200,
      );
    }

    this.logger.info(
      {
        topic: event.topic,
        routingDecision,
        targets: targetRules.map((r) => r.target_name),
      },
      "Routing decision made",
    );

    // 5. Forward to all targets in parallel
    const forwardHeaders = this.buildForwardHeaders(event);
    const results = await Promise.all(
      targetRules.map((rule) =>
        this.forwardToTarget(rule, rawBody, forwardHeaders),
      ),
    );

    // 6. Build OpenHIM orchestrations
    const orchestrations: OpenHIMOrchestration[] = results.map((result) =>
      this.buildOrchestration(result, rawBody, forwardHeaders),
    );

    // 7. Determine overall status
    const allSucceeded = results.every(
      (r) => r.statusCode >= 200 && r.statusCode < 300,
    );
    const overallStatus = allSucceeded ? "Successful" : "Failed";
    const httpStatus = allSucceeded ? 200 : 502;

    const durationMs = Date.now() - startTime;

    this.logger.info(
      {
        topic: event.topic,
        overallStatus,
        targetCount: targetRules.length,
        durationMs,
      },
      "Routing complete",
    );

    const responseBody = JSON.stringify({
      routed: true,
      topic: event.topic,
      targets: results.map((r) => ({
        name: r.targetName,
        status: r.statusCode,
      })),
    });

    return c.json(
      this.buildMediatorResponse(
        overallStatus,
        httpStatus,
        responseBody,
        orchestrations,
      ),
      httpStatus,
    );
  }

  private parseIncomingEvent(
    cloudEvent: Record<string, any>,
    rawBody: string,
    c: Context,
  ): IncomingEvent {
    const type: string = cloudEvent.type ?? "";
    // Strip 'com.smile.' prefix to get topic
    const topic = type.startsWith("com.smile.")
      ? type.slice("com.smile.".length)
      : type;

    // Collect all incoming headers (lower-cased).
    // c.req.raw.headers is a Web API Headers object, not a plain object —
    // Object.entries() returns [] on it. Use forEach() instead.
    const incomingHeaders: Record<string, string> = {};
    c.req.raw.headers.forEach((value, key) => {
      incomingHeaders[key.toLowerCase()] = value;
    });

    return {
      id: cloudEvent.id ?? "",
      type,
      topic,
      source: cloudEvent.source ?? "",
      data: (cloudEvent.data as Record<string, unknown>) ?? {},
      rawBody,
      client_key: cloudEvent.client_key ?? undefined,
      program_id:
        cloudEvent.program_id !== undefined
          ? String(cloudEvent.program_id)
          : undefined,
      traceId: incomingHeaders["x-trace-id"],
      requestId: incomingHeaders["x-request-id"],
      correlationId: incomingHeaders["x-correlation-id"],
      integrationClient: incomingHeaders["x-integration-client"],
      incomingHeaders,
    };
  }

  private buildForwardHeaders(event: IncomingEvent): Record<string, string> {
    const headers: Record<string, string> = {
      "content-type": "application/json",
    };

    for (const name of FORWARDED_HEADERS) {
      const val = event.incomingHeaders[name];
      if (val) headers[name] = val;
    }

    return headers;
  }

  private async forwardToTarget(
    rule: RoutingRule,
    body: string,
    headers: Record<string, string>,
  ): Promise<ForwardResult> {
    const start = Date.now();
    // Build the OpenHIM endpoint URL from environment variables and route mapping path
    const endpointUrl = `${this.env.OPENHIM_HTTP_PROTOCOL}://${this.env.OPENHIM_HTTP_HOST}:${this.env.OPENHIM_HTTP_PORT}${rule.target_url}`;

    try {
      const { statusCode, responseBody } = await this.sendRequest(endpointUrl, body, headers, this.env.TARGET_REQUEST_TIMEOUT_MS);
      const durationMs = Date.now() - start;

      this.logger.debug(
        {
          targetName: rule.target_name,
          targetUrl: endpointUrl,
          statusCode,
          durationMs,
        },
        "Forwarded to target",
      );

      return {
        targetName: rule.target_name,
        targetUrl: endpointUrl,
        statusCode,
        responseBody,
        durationMs,
      };
    } catch (error) {
      const durationMs = Date.now() - start;
      const errorMsg = error instanceof Error ? error.message : String(error);

      this.logger.error(
        { targetName: rule.target_name, targetUrl: endpointUrl, error },
        "Failed to forward to target",
      );

      return {
        targetName: rule.target_name,
        targetUrl: endpointUrl,
        statusCode: 502,
        responseBody: "",
        durationMs,
        error: errorMsg,
      };
    }
  }

  /**
   * Low-level HTTP/HTTPS request using Node's built-in module so we can:
   *  - attach Basic auth credentials (required by OpenHIM channels)
   *  - control TLS certificate validation via OPENHIM_REJECT_UNAUTHORIZED
   */
  private sendRequest(
    endpointUrl: string,
    body: string,
    extraHeaders: Record<string, string>,
    timeoutMs: number,
  ): Promise<{ statusCode: number; responseBody: string }> {
    return new Promise((resolve, reject) => {
      const url = new URL(endpointUrl);
      const protocol = url.protocol === "https:" ? https : http;

      const credentials = Buffer.from(
        `${this.env.OPENHIM_CLIENT_ID}:${this.env.OPENHIM_CLIENT_SECRET}`,
      ).toString("base64");

      const bodyBuffer = Buffer.from(body, "utf-8");

      const options: https.RequestOptions = {
        hostname: url.hostname,
        port: url.port || (url.protocol === "https:" ? 443 : 80),
        path: url.pathname + url.search,
        method: "POST",
        headers: {
          ...extraHeaders,
          "Content-Type": "application/json",
          "Content-Length": bodyBuffer.byteLength,
          Authorization: `Basic ${credentials}`,
        },
        timeout: timeoutMs,
        ...(url.protocol === "https:" && {
          rejectUnauthorized: this.env.OPENHIM_REJECT_UNAUTHORIZED,
        }),
      };

      const req = protocol.request(options, (res) => {
        let data = "";
        res.on("data", (chunk: Buffer) => { data += chunk.toString(); });
        res.on("end", () => resolve({ statusCode: res.statusCode ?? 0, responseBody: data }));
      });

      req.on("error", reject);
      req.on("timeout", () => {
        req.destroy();
        reject(new Error(`Request timeout after ${timeoutMs}ms`));
      });
      req.write(bodyBuffer);
      req.end();
    });
  }

  private buildOrchestration(
    result: ForwardResult,
    requestBody: string,
    requestHeaders: Record<string, string>,
  ): OpenHIMOrchestration {
    const now = new Date().toISOString();
    const url = new URL(result.targetUrl);

    return {
      name: result.targetName,
      request: {
        path: url.pathname + url.search,
        headers: requestHeaders,
        querystring: url.search,
        body: requestBody,
        method: "POST",
        timestamp: now,
      },
      response: {
        status: result.statusCode,
        headers: {},
        body: result.responseBody,
        timestamp: now,
      },
    };
  }

  private buildMediatorResponse(
    status: MediatorResponse["status"],
    httpStatus: number,
    body: string,
    orchestrations: OpenHIMOrchestration[],
  ): MediatorResponse {
    return {
      "x-mediator-urn": MEDIATOR_URN,
      status,
      response: {
        status: httpStatus,
        headers: { "content-type": "application/json" },
        body,
        timestamp: new Date().toISOString(),
      },
      orchestrations,
    };
  }

  private buildErrorResponse(
    message: string,
    httpStatus: number,
  ): MediatorResponse {
    return this.buildMediatorResponse(
      "Failed",
      httpStatus,
      JSON.stringify({ error: message }),
      [],
    );
  }
}

export function createRoutingService(
  env: Env,
  repository: RoutingRepository,
  logger: Logger,
): RoutingService {
  return new RoutingService(env, repository, logger);
}
