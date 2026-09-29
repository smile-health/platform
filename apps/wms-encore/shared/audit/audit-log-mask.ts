// Manual port of packages/lib/audit-log/mask.ts (plus the leaf `mask()` from
// packages/lib/masking.ts) — wms-encore is a standalone Encore app and cannot
// import @smile-health/lib. KEEP IN SYNC with packages/lib/audit-log/mask.ts:
// if the credential/PII key lists or masking behaviour change there, change it here.
//
// Masking happens before the message leaves this process, so a raw PII value
// never reaches RabbitMQ, the audit_logs table, or the log viewer.

// Same as packages/lib/masking.ts `mask`.
export function mask(input: string): string {
  const str = String(input ?? "");
  const len = str.length;

  if (len <= 2) return str;

  let n = Math.floor(len / 4);
  if (n < 1) n = 1;
  n = Math.min(n, Math.floor(len / 2));

  const start = str.slice(0, n);
  const end = str.slice(len - n);
  const middleLen = Math.max(len - 2 * n, 0);

  return start + "*".repeat(middleLen) + end;
}

// Keys are normalised before matching: camelCase -> snake_case, lower-cased,
// "-" -> "_". So `pinCode`, `pin_code` and `PIN-CODE` all become `pin_code`,
// and `_` / `-` count as segment separators for the segment-anchored patterns.
//
// CREDENTIAL keys: the whole value (including objects/arrays beneath it) is
// replaced with "[REDACTED]" — a partial mask of a short password/PIN/OTP
// would still leak most of it.
const CREDENTIAL_KEY_PATTERN =
  /(password|passwd|secret|token|api_?key|authorization|credential|signature|cvv|private_key|keycloak_uuid)|(^|_)(pwd|otp|pin)($|_)/;

// PII keys: value is partially masked with `mask()`; every leaf under a PII
// container key is masked regardless of sub-key name.
const PII_KEY_PATTERN =
  /(no_?ktp|npwp|ssn|passport|national_id|credit_?card|card_?number|bank_?account|no_?rekening|rekening|phone|mobile|whatsapp|wa_number|email|address|alamat|date_of_birth|birth_date|birthdate|tanggal_lahir)|(^|_)(nik|ktp|dob)($|_)/;

const REDACTED = "[REDACTED]";
const TRUNCATED = "[TRUNCATED]";
const BINARY = "[BINARY]";
const MAX_DEPTH = 10;

function normalizeKey(key: string): string {
  return key
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .toLowerCase()
    .replace(/-/g, "_");
}

export function maskSensitiveFields<T>(value: T): T {
  return maskValue(value, 0, false) as T;
}

function maskValue(value: unknown, depth: number, everything: boolean): unknown {
  if (value === null || value === undefined) return value;
  if (depth >= MAX_DEPTH) return TRUNCATED;

  if (value instanceof Date) {
    const iso = Number.isNaN(value.getTime()) ? String(value) : value.toISOString();
    return everything ? mask(iso) : iso;
  }
  if (ArrayBuffer.isView(value) || value instanceof ArrayBuffer) return BINARY;

  if (Array.isArray(value)) {
    return value.map((item) => maskValue(item, depth + 1, everything));
  }

  if (typeof value === "object") {
    const source = value as Record<string, unknown>;
    const proto = Object.getPrototypeOf(value);
    if (
      proto !== Object.prototype &&
      proto !== null &&
      typeof (value as { toJSON?: unknown }).toJSON === "function"
    ) {
      const json = (value as { toJSON: () => unknown }).toJSON();
      if (json !== value) return maskValue(json, depth + 1, everything);
    }
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(source)) {
      const normalized = normalizeKey(key);
      if (CREDENTIAL_KEY_PATTERN.test(normalized)) {
        result[key] = val === null || val === undefined ? val : REDACTED;
      } else {
        result[key] = maskValue(
          val,
          depth + 1,
          everything || PII_KEY_PATTERN.test(normalized),
        );
      }
    }
    return result;
  }

  return everything ? mask(String(value)) : value;
}
