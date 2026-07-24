// OpenHIM API and Protocol Types

export interface OpenHIMConfig {
  apiEndpoint: string;
  clientId: string; // OpenHIM client ID for authentication; e.g., 'smile-app'
  clientSecret: string;
  requestTimeoutMs?: number; // HTTP request timeout, Default: 30000 (30 seconds)
  maxRetries?: number;
  retryBackoffMs?: number;
  retryBackoffMultiplier?: number;
  rejectUnauthorized?: boolean; // Reject unauthorized SSL certificates, Default: true (false for dev/UAT)
}

export interface OpenHIMRequest {
  headers: Record<string, string>;
  body: string;
  timestamp: number;
  timeoutMs?: number;
}

// HTTP response from OpenHIM
export interface OpenHIMResponse {
  status: number;
  body: unknown;
  headers: Record<string, string>;
  responseTimeMs: number;
  isSuccess: boolean;
  errorMessage?: string;
  attemptsCount: number; // Total HTTP attempts made (1 = succeeded first try, 2 = 1 retry, etc.)
}

// OpenHIM channel information, Retrieved from OpenHIM Core API
export interface OpenHIMChannel {
  _id: string;
  name: string;
  description?: string;
  urlPattern: string;
  methods: string[];
  type: "http" | "tcp" | "tls" | "mllp";
  status: "active" | "paused" | "disabled";
  allowFiltering: boolean;
  routes: OpenHIMRoute[];
  authType: string;
  txViewAcl: string[];
  txRerunAcl: string[];
  properties: Array<{
    property: string;
    value: string;
  }>;
  matchContentTypes: string[];
  alerts: Array<{
    status: string;
    users: string[];
  }>;
  createdAt?: string;
  updatedAt?: string;
}

// OpenHIM route configuration for a channel
export interface OpenHIMRoute {
  name: string;
  host: string;
  port: number;
  type: string;
  status: string;
  secured?: boolean;
  primary?: boolean;
}

// Request to create/update an OpenHIM channel
export interface CreateOpenHIMChannelRequest {
  name: string;
  description?: string;
  urlPattern: string;
  methods: string[];
  type: "http" | "tcp" | "tls" | "mllp";
  allowFiltering?: boolean;
  routes: OpenHIMRoute[];
  authType?: string;
  properties?: Array<{
    property: string;
    value: string;
  }>;
}

// OpenHIM transaction object
export interface OpenHIMTransaction {
  _id: string;
  transactionId: string;
  clientIP: string;
  receivedAt: string;
  status: "Processing" | "Processed" | "Failed" | "Completed with errors";
  channelID: string;
  channelName: string;
  request: {
    host: string;
    port: number;
    body: string;
    timestamp: string;
    headers: Record<string, string>;
    method: string;
    querystring: string;
    path: string;
  };
  response?: {
    status: number;
    body: string;
    timestamp: string;
    headers: Record<string, string>;
  };
  routes: Array<{
    name: string;
    request?: {
      host: string;
      port: number;
      body: string;
      timestamp: string;
      headers: Record<string, string>;
    };
    response?: {
      status: number;
      body: string;
      timestamp: string;
      headers: Record<string, string>;
    };
  }>;
  orchestrations: Array<{
    name: string;
    request?: {
      host: string;
      port: number;
      body: string;
      timestamp: string;
      headers: Record<string, string>;
      method: string;
      path: string;
    };
    response?: {
      status: number;
      body: string;
      timestamp: string;
      headers: Record<string, string>;
    };
  }>;
  properties?: Record<string, string>;
  error?: string;
  updatedAt?: string;
}

// Error response from OpenHIM API
export interface OpenHIMErrorResponse {
  error: string;
  message?: string;
  status?: number;
  details?: unknown;
}

// Determines if a response is an error
export function isOpenHIMError(
  response: unknown
): response is OpenHIMErrorResponse {
  return (
    typeof response === "object" && response !== null && "error" in response
  );
}

// Determines if response status code indicates success
export function isSuccessStatus(
  status: number,
  expectedCodes: number[] = [200, 201, 202]
): boolean {
  return expectedCodes.includes(status);
}
