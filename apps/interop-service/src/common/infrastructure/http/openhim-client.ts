// OpenHIM HTTP Client that handles communication with OpenHIM Core API

import https from "https";
import http from "http";
import type { Logger } from "pino";
import type {
  OpenHIMConfig,
  OpenHIMRequest,
  OpenHIMResponse,
} from "../../types/openhim";

export class OpenHIMClient {
  private config: Required<OpenHIMConfig>;
  private logger: Logger;

  constructor(config: OpenHIMConfig, logger: Logger) {
    this.config = {
      requestTimeoutMs: config.requestTimeoutMs || 30000,
      maxRetries: config.maxRetries || 3,
      retryBackoffMs: config.retryBackoffMs || 1000,
      retryBackoffMultiplier: config.retryBackoffMultiplier || 2.0,
      rejectUnauthorized: config.rejectUnauthorized !== false, // Default to true (secure)
      ...config,
    };
    this.logger = logger;
  }

  // Sends request to OpenHIM, Automatically handles retries on transient failures.
  // retryOverrides allows per-route retry config to override the global client defaults.
  async send(
    request: OpenHIMRequest,
    expectedStatusCodes: number[] = [200, 201, 202],
    endpointUrl?: string,
    retryOverrides?: {
      maxRetries?: number;
      retryBackoffMs?: number;
      retryBackoffMultiplier?: number;
    },
  ): Promise<OpenHIMResponse> {
    const maxRetries = retryOverrides?.maxRetries ?? this.config.maxRetries;
    const retryBackoffMs =
      retryOverrides?.retryBackoffMs ?? this.config.retryBackoffMs;
    const retryBackoffMultiplier =
      retryOverrides?.retryBackoffMultiplier ??
      this.config.retryBackoffMultiplier;

    let lastError: Error | null = null;
    let lastResponse: OpenHIMResponse | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await this.sendRequest(
          request,
          this.config.requestTimeoutMs,
          endpointUrl,
        );

        // Check if response is acceptable
        if (expectedStatusCodes.includes(response.status)) {
          this.logger.debug(
            {
              status: response.status,
              attempt,
              maxRetries,
              durationMs: response.responseTimeMs,
            },
            "OpenHIM request succeeded",
          );

          return {
            ...response,
            isSuccess: true,
            attemptsCount: attempt,
          };
        }

        // Non-retriable status codes (4xx errors)
        if (response.status >= 400 && response.status < 500) {
          this.logger.error(
            {
              status: response.status,
              body: response.body,
              expectedCodes: expectedStatusCodes,
              attempt,
            },
            "OpenHIM request failed with client error",
          );

          return {
            ...response,
            isSuccess: false,
            errorMessage: `HTTP ${response.status}`,
            attemptsCount: attempt,
          };
        }

        // Unexpected status (2xx not in expected list, 3xx, 5xx) — save response
        lastResponse = response;
        throw new Error(`OpenHIM returned ${response.status}`);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (this.isRetriable(lastError) && attempt < maxRetries) {
          const backoffMs = this.calculateBackoff(
            attempt,
            retryBackoffMs,
            retryBackoffMultiplier,
          );

          this.logger.warn(
            {
              attempt,
              maxRetries,
              error: lastError.message,
              backoffMs,
            },
            `OpenHIM request failed, retrying in ${backoffMs}ms`,
          );

          await this.sleep(backoffMs);
        } else {
          this.logger.error(
            {
              attempt,
              maxRetries,
              error: lastError.message,
            },
            "OpenHIM request failed permanently",
          );

          return {
            // Preserve the actual response if we received one (status code mismatch). Zeros for network errors with no response.
            status: lastResponse?.status ?? 0,
            body: lastResponse?.body ?? null,
            headers: lastResponse?.headers ?? {},
            responseTimeMs: lastResponse?.responseTimeMs ?? 0,
            isSuccess: false,
            errorMessage: lastError.message,
            attemptsCount: attempt,
          };
        }
      }
    }

    // Should not reach here, but just in case return a failure
    return {
      status: 0,
      body: null,
      headers: {},
      responseTimeMs: 0,
      isSuccess: false,
      errorMessage: lastError?.message || "Unknown error",
      attemptsCount: maxRetries,
    };
  }

  // Sends an HTTP request to OpenHIM
  // Internal method - use send() instead for retry logic
  private sendRequest(
    request: OpenHIMRequest,
    timeoutMs: number,
    endpointUrl?: string,
  ): Promise<OpenHIMResponse> {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      // Use provided endpoint URL or fall back to config.apiEndpoint
      const url = new URL(endpointUrl || this.config.apiEndpoint);

      const protocol = url.protocol === "https:" ? https : http;

      const options: https.RequestOptions = {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname + url.search,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(request.body),
          ...this.getAuthHeaders(),
          ...request.headers,
        },
        timeout: timeoutMs,
        // For HTTPS, configure SSL certificate validation
        ...(url.protocol === "https:" && {
          rejectUnauthorized: this.config.rejectUnauthorized,
        }),
      };

      const req = protocol.request(options, (res) => {
        let body = "";

        res.on("data", (chunk) => {
          body += chunk;
        });

        res.on("end", () => {
          const responseTimeMs = Date.now() - startTime;

          let parsedBody: unknown;

          try {
            parsedBody = JSON.parse(body);
          } catch {
            parsedBody = body;
          }

          resolve({
            status: res.statusCode || 0,
            body: parsedBody,
            headers: res.headers as Record<string, string>,
            responseTimeMs,
            isSuccess: false, // Will be set by caller
            attemptsCount: 0, // Will be set by caller
          });
        });
      });

      req.on("error", reject);
      req.on("timeout", () => {
        req.destroy();
        reject(new Error(`Request timeout after ${timeoutMs}ms`));
      });

      // Write request body
      req.write(request.body);
      req.end();
    });
  }

  // Generates Basic Authentication header
  private getAuthHeaders(): Record<string, string> {
    const credentials = Buffer.from(
      `${this.config.clientId}:${this.config.clientSecret}`,
    ).toString("base64");

    return {
      Authorization: `Basic ${credentials}`,
    };
  }

  // Determines if an error is retriable, Network errors and 5xx status codes are retriable
  private isRetriable(error: Error): boolean {
    const message = error.message.toLowerCase();

    // Retriable error codes
    const retriablePatterns = [
      "econnrefused",
      "enotfound",
      "etimedout",
      "econnreset",
      "timeout",
      "temporarily unavailable",
      "5\\d{2}", // 5xx status codes
    ];

    return retriablePatterns.some((pattern) =>
      new RegExp(pattern, "i").test(message),
    );
  }

  // Calculates exponential backoff delay
  private calculateBackoff(
    attempt: number,
    retryBackoffMs: number,
    retryBackoffMultiplier: number,
  ): number {
    const exponentialBackoff =
      retryBackoffMs * Math.pow(retryBackoffMultiplier, attempt - 1);

    // Add small random jitter to prevent thundering herd
    const jitter = Math.random() * 100;

    return Math.min(exponentialBackoff + jitter, 30000); // Cap at 30 seconds
  }

  // Helper to sleep for a specified duration
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Get current configuration
  getConfig(): OpenHIMConfig {
    return this.config;
  }

  // Update client configuration at runtime
  updateConfig(updates: Partial<OpenHIMConfig>): void {
    Object.assign(this.config, updates);
    this.logger.info(
      { config: { ...this.config, clientSecret: "***" } },
      "OpenHIM client configuration updated",
    );
  }
}
