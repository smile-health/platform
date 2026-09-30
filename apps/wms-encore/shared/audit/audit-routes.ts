// Whitelist of WMS write endpoints recorded in the unified audit trail, plus
// the pure helpers the audit middleware (shared/http/audit.ts) uses. Kept free
// of encore imports so it is unit-testable under plain vitest.
//
// To audit another endpoint, add an entry here. Only 2xx responses are recorded.

export type AuditableRoute = {
  match: RegExp;
  module: string;
  // Overrides the method-derived action.
  action?: string;
  // Defaults to POST/PUT/PATCH/DELETE.
  methods?: string[];
};

const DEFAULT_METHODS = ["POST", "PUT", "PATCH", "DELETE"];

const ACTION_BY_METHOD: Record<string, string> = {
  POST: "create",
  PUT: "update",
  PATCH: "update",
  DELETE: "delete",
};

const P = "^/api/v1";

export const AUDITED_ROUTES: AuditableRoute[] = [
  // Global settings
  { match: new RegExp(`${P}/global-settings(/\\d+)?/?$`), module: "wms_global_settings" },

  // Waste bag QR code
  { match: new RegExp(`${P}/waste-bag-qrcode(/\\d+)?/?$`), module: "wms_waste_bag_qr_code" },

  // Manual scale request: create, activate (approve/reject), status update
  { match: new RegExp(`${P}/manual-scale/?$`), module: "wms_manual_scale_request", methods: ["POST"] },
  {
    match: new RegExp(`${P}/manual-scale/activate/?$`),
    module: "wms_manual_scale_request",
    action: "activate",
    methods: ["PATCH"],
  },
  {
    match: new RegExp(`${P}/manual-scale-request/\\d+/status/?$`),
    module: "wms_manual_scale_request",
    action: "update_status",
    methods: ["POST"],
  },

  // Waste bag create only (status transitions are already in waste_bag_audit_trail)
  { match: new RegExp(`${P}/waste/?$`), module: "wms_waste_bag", methods: ["POST"] },

  // Partnership
  { match: new RegExp(`${P}/partnership(/\\d+)?/?$`), module: "wms_partnership" },
  {
    match: new RegExp(`${P}/partnership/\\d+/status/?$`),
    module: "wms_partnership",
    action: "update_status",
    methods: ["POST"],
  },
  { match: new RegExp(`${P}/partnership-operator-map/?$`), module: "wms_partnership_operator_map" },
  { match: new RegExp(`${P}/partnership-vehicle-map/?$`), module: "wms_partnership_vehicle_map" },
  { match: new RegExp(`${P}/partner-vehicle(/\\d+)?/?$`), module: "wms_partner_vehicle" },
  {
    match: new RegExp(`${P}/partner-vehicle/bulk-healthcare/?$`),
    module: "wms_partner_vehicle",
    methods: ["POST"],
  },

  // Assets
  { match: new RegExp(`${P}/asset(/\\d+)?/?$`), module: "wms_asset" },
  { match: new RegExp(`${P}/asset-model(/\\d+)?/?$`), module: "wms_asset_model" },
  { match: new RegExp(`${P}/asset-dongle(/[^/]+)?/?$`), module: "wms_asset_dongle" },
  { match: new RegExp(`${P}/healthcare-asset(/\\d+)?/?$`), module: "wms_healthcare_asset" },
  {
    match: new RegExp(`${P}/healthcare-facility-asset(/\\d+)?/?$`),
    module: "wms_healthcare_facility_asset",
  },
  { match: new RegExp(`${P}/qr-code-config(/\\d+)?/?$`), module: "wms_qr_code_config" },

  // Users
  { match: new RegExp(`${P}/users/\\d+/?$`), module: "wms_users", methods: ["PUT"] },
];

export type ResolvedAuditRoute = { route: AuditableRoute; action: string };

export function resolveAuditRoute(
  method: string,
  path: string,
  routes: AuditableRoute[] = AUDITED_ROUTES,
): ResolvedAuditRoute | null {
  const m = method.toUpperCase();
  const route = routes.find(
    (r) => (r.methods ?? DEFAULT_METHODS).includes(m) && r.match.test(path),
  );
  if (!route) return null;
  const action = route.action ?? ACTION_BY_METHOD[m];
  return action ? { route, action } : null;
}

function toNumber(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

// Path param `id` first, then `id` / `data.id` of the response body.
export function extractEntityId(
  pathParams: Record<string, unknown> | undefined,
  responseBody: unknown,
): number | null {
  const fromParam = toNumber(pathParams?.id);
  if (fromParam !== null) return fromParam;
  const body = responseBody as { id?: unknown; data?: { id?: unknown } | null } | null | undefined;
  return toNumber(body?.id) ?? toNumber(body?.data?.id);
}

// Moved to ./client-ip (trusted-proxy aware); re-exported for existing imports.
export { clientIpFromForwardedFor } from "./client-ip";
