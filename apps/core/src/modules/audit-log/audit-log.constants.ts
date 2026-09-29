import type { AuditableRoute } from "@smile-health/lib/audit-log/capture-middleware.js"

export const AUDIT_LOG_RETENTION_KEY = "audit_log.retention_days"
export const AUDIT_LOG_RETENTION_DEFAULT_DAYS = 7
export const AUDIT_LOG_RETENTION_MIN_DAYS = 1
export const AUDIT_LOG_RETENTION_MAX_DAYS = 90

/**
 * Turns a raw system_settings value into a usable retention window:
 * falls back to the default when missing/invalid, clamps to [1, 90].
 */
export const resolveRetentionDays = (
  raw: string | number | null | undefined
): number => {
  const n = typeof raw === "number" ? raw : Number(raw)
  if (raw === null || raw === undefined || raw === "" || !Number.isFinite(n)) {
    return AUDIT_LOG_RETENTION_DEFAULT_DAYS
  }
  return Math.min(
    AUDIT_LOG_RETENTION_MAX_DAYS,
    Math.max(AUDIT_LOG_RETENTION_MIN_DAYS, Math.trunc(n))
  )
}

/**
 * Whitelist of routes the generic audit-trail capture middleware should
 * record. Nothing is captured unless it's listed here — this is deliberate:
 * blanket-capturing every mutating request would risk logging sensitive/PII
 * payloads nobody signed off on.
 *
 * Scope: administrative / master-data changes plus exports. Day-to-day
 * operational transactions (stock/order/etc.) live in apps/main's own
 * audit-log constants, not here.
 *
 * `match` is tested against `c.req.path`; `module` is the value stored in
 * `audit_logs.module`. The first matching entry wins, so the export entries
 * must stay first (POST /materials/export is an export, not a create).
 */
export const AUDITED_ROUTES: AuditableRoute[] = [
  // Core export endpoints: GET /<resource>/group-targets/export,
  // GET /coldstorage/:id/export, GET /export-histories/:file/download,
  // POST /materials/export. `xls-template` is a template download, not an
  // export, and is not matched.
  {
    match: /\/(export|download)(\/|$)/,
    module: "export",
    action: "export",
    methods: ["GET", "POST"],
  },
  // GET /<resource>/xls is an export; POST /<resource>/xls is an import, so
  // this entry is GET only.
  {
    match: /\/xls$/,
    module: "export",
    action: "export",
    methods: ["GET"],
  },
  { match: /^\/users(\/|$)/, module: "user" },
  { match: /^\/executive\/account(\/|$)/, module: "executive_account" },
  { match: /^\/executive\/users(\/|$)/, module: "executive_user" },
  { match: /^\/executive\/roles(\/|$)/, module: "executive_role" },
  { match: /^\/executive\/programs(\/|$)/, module: "executive_workspace" },
  { match: /^\/programs(\/|$)/, module: "program" },
  { match: /^\/workspaces(\/|$)/, module: "workspace" },
  { match: /^\/budget-sources(\/|$)/, module: "budget_source" },
  { match: /^\/manufactures(\/|$)/, module: "manufacture" },
  { match: /^\/materials(\/|$)/, module: "material" },
  { match: /^\/material-types(\/|$)/, module: "material_type" },
  { match: /^\/material-relations(\/|$)/, module: "material_relation" },
  { match: /^\/material-levels(\/|$)/, module: "material_level" },
  { match: /^\/material-units(\/|$)/, module: "material_unit" },
  { match: /^\/entities(\/|$)/, module: "entity" },
  { match: /^\/entity-types(\/|$)/, module: "entity_type" },
  { match: /^\/entity-tags(\/|$)/, module: "entity_tag" },
  { match: /^\/asset-types(\/|$)/, module: "asset_type" },
  { match: /^\/asset-models(\/|$)/, module: "asset_model" },
  { match: /^\/asset-vendors(\/|$)/, module: "asset_vendor" },
  { match: /^\/asset-vendor-types(\/|$)/, module: "asset_vendor_type" },
]

/**
 * created_at is written from JS in UTC ('YYYY-MM-DD HH:mm:ss') so it agrees
 * with the UTC partition boundaries regardless of the DB session time zone.
 */
export const formatUtcDateTime = (date: Date): string =>
  date.toISOString().slice(0, 19).replace("T", " ")

export const AUDIT_LOG_COLUMN_LIMITS = {
  action: 50,
  module: 100,
  actor_role: 50,
  actor_name: 255,
  ip: 255,
  service: 30,
} as const

export const truncateTo = (
  value: string | null | undefined,
  max: number
): string | null => (value == null ? null : String(value).slice(0, max))
