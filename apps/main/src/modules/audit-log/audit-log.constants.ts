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
  { match: /^\/orders(\/\d+)?\/?$/, module: "order" },
  { match: /^\/reconciliation/, module: "reconciliation" },
  { match: /^\/entities\/customers/, module: "entity_customer" },
  { match: /^\/entities\/\d+\/materials/, module: "entity_material" },
  { match: /^\/entities\/activities\/submit-time/, module: "entity_activity" },
]
