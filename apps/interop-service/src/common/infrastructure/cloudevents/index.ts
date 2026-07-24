// Provides utilities for working with CNCF CloudEvents format

export {
  formatAsCloudEvent,
  getEventType,
  extractSubject,
  ensurePayloadIsObject,
  addContextAsExtensions,
  createTraceparent,
  generateTraceId,
  generateSpanId,
  extractTraceparent,
  isValidCloudEvent,
  serializeCloudEvent,
  deserializeCloudEvent,
} from "./formatter";
