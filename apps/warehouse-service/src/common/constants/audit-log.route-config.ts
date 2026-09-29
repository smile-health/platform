import { AuditableRoute } from "@smile-health/lib/audit-log/capture-middleware.js"

/**
 * Whitelist for warehouse-service's audit-trail capture middleware.
 *
 * warehouse-service is a read-only reporting service: every controller
 * registers GET routes only, and stock-opname / stock writes live in
 * apps/main. So the only auditable activity here is data export.
 *
 * - `.../export...`: report export endpoints (e.g. /stock-opname/result/export,
 *   /cce/export/..., /add-remove-stock/material/export).
 * - `/download/code/:code`: download of a previously generated report file.
 *   `/download/list` is just a listing and is not audited.
 */
export const AUDITED_ROUTES: AuditableRoute[] = [
  {
    match: /\/export(\/|$)/,
    module: "export",
    action: "export",
    methods: ["GET", "POST"],
  },
  {
    match: /^\/download\/code\//,
    module: "export",
    action: "export",
    methods: ["GET"],
  },
]
