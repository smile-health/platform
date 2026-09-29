import { AuditableRoute } from "@smile-health/lib/audit-log/capture-middleware.js"

/**
 * Whitelist for apps/main's generic audit-trail capture middleware.
 * First match wins, so the export entries come first.
 *
 * Deliberately NOT included (needs explicit AuditLogPublisher.record() calls
 * instead, because the write is a side-effect inside a broader transaction):
 * - ws_order_histories: written by every order-status-* transition endpoint.
 * - ws_purchases: written in the same transaction as ws_transactions.
 * - ws_consumptions: dual-mounted (/transactions/* and /consumptions/*).
 */
export const AUDITED_ROUTES: AuditableRoute[] = [
  // Exports. Main mostly exposes GET `.../xls` (`xls-template` is a blank
  // template, not data, and does not match) and a few `.../export` routes.
  // POST `.../xls` is an import, so `xls` is GET-only.
  {
    match: /\/(export|download)(\/|$)/,
    module: "export",
    action: "export",
    methods: ["GET", "POST"],
  },
  {
    match: /\/xls$/,
    module: "export",
    action: "export",
    methods: ["GET"],
  },
  {
    match: /^\/transactions\/(add-stock|remove-stock|discard-stock)$/,
    module: "transaction",
  },
  { match: /^\/stocks(\/|$)/, module: "stock" },
  { match: /^\/orders\/\d+\/comments/, module: "order_comment" },
  // Status actions send only notes/reasons, so the new status is tracked:
  // read before the handler and re-read after it.
  {
    match: /^\/orders\/\d+\/(allocate|cancel|confirm|fulfilled|pending|ship|validate)$/,
    module: "order",
    action: "update_status",
    methods: ["PUT"],
    before: {
      table: "ws_orders",
      idFrom: /^\/orders\/(\d+)\/[a-z]+$/,
      track: ["order_status_id"],
    },
  },
  {
    match: /^\/orders\/(request|relocation|return|distribution|central-distribution)$/,
    module: "order",
    action: "create",
    methods: ["POST"],
  },
  { match: /^\/orders\/\d+\/order-item-stocks$/, module: "order_item_stock" },
  { match: /^\/reconciliation/, module: "reconciliation" },
  { match: /^\/entities\/customers/, module: "entity_customer" },
  {
    match: /^\/entities\/\d+\/materials/,
    module: "entity_material",
    // Only DELETE carries the row id in the path; PUT sends it in the body.
    before: {
      table: "ws_entity_material_activities",
      idFrom: /^\/entities\/\d+\/materials\/(\d+)$/,
    },
  },
  { match: /^\/entities\/activities\/submit-time/, module: "entity_activity" },
]

/** Tables `loadBefore` may read — only those named by AUDITED_ROUTES. */
export const AUDIT_BEFORE_TABLES = new Set(
  AUDITED_ROUTES.flatMap((route) => (route.before ? [route.before.table] : []))
)
