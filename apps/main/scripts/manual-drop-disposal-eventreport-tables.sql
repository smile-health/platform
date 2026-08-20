-- =============================================================================
-- MANUAL REVIEW SCRIPT — NOT AUTO-EXECUTED
-- =============================================================================
-- Generated as part of the removal of the "Pemusnahan" (Disposal Instruction /
-- Self Disposal / Disposal Shipment / Disposal Methods) and "Laporan Kejadian"
-- (Event Report / Ticketing) frontend workspace-menu items and their backing
-- apps/main modules.
--
-- This file is a draft for a HUMAN to review and run manually against each
-- environment (dev/staging/prod) individually. It is NOT wired into any
-- migration runner, CI job, or npm script, and must NOT be executed
-- automatically.
--
-- Before running against any environment:
--   1. Confirm no other service (warehouse-service, sync-service,
--      interop-service, core, platform, auth-service, apps/3.0/*) reads from
--      or writes to the tables below. A repo-wide grep on 2026-08-20 found no
--      such cross-service references, but re-verify against the state of the
--      repo at the time you run this.
--   2. Confirm apps/main's migration `1759378807535_add-missing-index-on-tables.ts`
--      (kept, NOT deleted by this cleanup) still references
--      `ws_disposal_shipments`, `ws_disposal_shipment_items`,
--      `ws_disposal_shipment_stocks`, `ws_disposal_shipment_comments`,
--      `ws_event_reports`, `ws_event_report_comments`, `ws_event_report_items`,
--      and `ws_event_report_histories` to create indexes on them. Running a
--      fresh `db:migrate` on a brand-new database AFTER dropping these tables
--      (and after their creating migrations were deleted) will make that
--      migration fail, because it tries to index tables that no longer have a
--      creating migration. A human must decide whether to patch that
--      migration (e.g. wrap in try/catch or remove the now-dangling index
--      definitions) before provisioning any new environment from scratch.
--   3. Take a backup / snapshot before running.
--   4. Run inside a transaction where the target engine supports DDL
--      transactions, or run table-by-table with verification in between.
--
-- Tables below are dropped in FK-safe order (children before parents, based
-- on the `.references(...)` foreign keys declared in the now-deleted
-- migrations).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Event Report / Ticketing ("Laporan Kejadian") — fully removed feature.
-- Source migrations deleted: 1748309366160, 1748310527513, 1748311875027,
-- 1748312405986, 1748312570726, 1748338498626, 1748414780125, 1748828810941,
-- 1754897204267, 1755090289110.
-- No foreign keys were declared between these tables in the migrations, but
-- they are dropped in a logical child-first order anyway.
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS ws_event_report_histories;
DROP TABLE IF EXISTS ws_event_report_comments;
DROP TABLE IF EXISTS ws_event_report_items;
DROP TABLE IF EXISTS ws_event_reports;
DROP TABLE IF EXISTS ws_event_report_reasons;
DROP TABLE IF EXISTS ws_event_report_status;

-- -----------------------------------------------------------------------------
-- Disposal Shipment (part of "Pemusnahan") — used only by
-- src/modules/disposal/shipment (deleted). Source migration deleted:
-- 1753044561589_create_disposal_shipment_table.ts.
-- FK order: comments/stocks/items reference ws_disposal_shipments (directly
-- or via ws_disposal_shipment_items), so they must be dropped first.
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS ws_disposal_shipment_comments;
DROP TABLE IF EXISTS ws_disposal_shipment_stocks;
DROP TABLE IF EXISTS ws_disposal_shipment_items;
DROP TABLE IF EXISTS ws_disposal_shipments;

-- -----------------------------------------------------------------------------
-- Disposal Instruction (part of "Pemusnahan") — used only by
-- src/modules/disposal/disposal-instruction (deleted). Source migrations
-- deleted: 1750056890000_create_disposal_instruction_types_table.ts,
-- 1757478524444_create-disposal-instructions-and-relations-table.ts.
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS ws_disposal_instruction_comments;
DROP TABLE IF EXISTS ws_disposal_instructions;
DROP TABLE IF EXISTS ws_disposal_instruction_types;

-- -----------------------------------------------------------------------------
-- NOT DROPPED: ws_disposal_transactions, ws_disposal_stocks,
-- ws_disposal_methods, ws_disposal_method_reasons,
-- ws_disposal_transaction_types.
--
-- These tables were created by 1750056889026_create_disposal_table.ts, which
-- was DELIBERATELY KEPT (its migration file was NOT deleted) because
-- src/modules/transaction/services/disposal.service.ts — imported and used
-- directly inside the core, always-on transaction-creation flow in
-- src/modules/transaction/transaction.module.ts (createDisposalFromBatch /
-- updateDisposalDiscardQty, called unconditionally for every batch
-- transaction, not just from the Pemusnahan UI) — reads and writes
-- ws_disposal_stocks and ws_disposal_transactions via
-- TransactionRepository.createDisposalStock / createDisposalTransaction /
-- getDisposalStockByStockId / updateDisposalStock. Dropping these tables
-- would break core transaction creation, which is out of scope for this
-- cleanup.
--
-- However, some COLUMNS on ws_disposal_transactions and ws_disposal_methods
-- are now orphaned because the migrations that added them were deleted as
-- part of this cleanup (they were only ever populated/read by the deleted
-- Self Disposal / Disposal Instruction / Disposal Methods modules):
--
--   * ws_disposal_transactions.report_number   (varchar(255), nullable)
--   * ws_disposal_transactions.comment         (text, nullable)
--       -- added by deleted migration 1750390294504_add_self_disposal_number.ts
--       -- was only read/written by modules/disposal/self-disposal (deleted)
--         and modules/disposal/disposal-instruction (deleted)
--
--   * ws_disposal_transactions.disposal_instruction_id (integer, nullable)
--       -- added by deleted migration
--         1757478524444_create-disposal-instructions-and-relations-table.ts
--       -- was only read/written by modules/disposal/disposal-instruction (deleted)
--
--   * ws_disposal_methods.status (smallint, NOT NULL DEFAULT 1)
--       -- added by deleted migration
--         1753700288395_add-column-ws_disposal_methods-status.ts
--       -- was only read/written by modules/disposal/methods (deleted)
--
-- These columns are left in place (kept table, orphaned column) rather than
-- dropped, per the cleanup's conservative policy for shared tables. If a
-- human confirms nothing else depends on them, they MAY optionally be
-- dropped with (NOT executed by default):
--
-- ALTER TABLE ws_disposal_transactions DROP COLUMN report_number;
-- ALTER TABLE ws_disposal_transactions DROP COLUMN comment;
-- ALTER TABLE ws_disposal_transactions DROP COLUMN disposal_instruction_id;
-- ALTER TABLE ws_disposal_methods DROP COLUMN status;
--
-- Also NOT dropped: the row seed data inserted by deleted migration
-- 1753710510726_seed-ws_disposal_methods.ts (ws_disposal_methods ids 1-6 and
-- ws_disposal_method_reasons ids 1-5). Existing rows are left as-is since
-- ws_disposal_methods/ws_disposal_method_reasons are shared, kept tables;
-- only the *migration file* (which would otherwise re-seed them on a fresh
-- environment) was removed. On a brand-new environment these rows will no
-- longer be auto-seeded — evaluate whether `disposal.service.ts`'s hardcoded
-- `disposal_method_id: 1` / `disposal_transaction_type_id: 1` still needs a
-- corresponding row to exist (no DB-level FK constraint enforces this today).
-- -----------------------------------------------------------------------------

-- -----------------------------------------------------------------------------
-- Remove the deleted migrations' bookkeeping rows from the Kysely migration
-- table so `db:migrate` / `db:rollback` don't get confused about migration
-- history. Kysely's TSFileMigrationProvider (see
-- apps/main/src/common/infrastructure/database/migrator.ts) stores the
-- migration name as the file's basename WITHOUT the `.ts` extension.
-- -----------------------------------------------------------------------------
DELETE FROM kysely_migration WHERE name IN (
  '1748309366160_create-table-ws-event-reports',
  '1748310527513_create-table-ws-event-report-histories',
  '1748311875027_create-table-ws-event-report-items',
  '1748312405986_create-table-ws-event-report-reasons',
  '1748312570726_create-table-ws-event-report-comments',
  '1748338498626_create-table-ws-event-report-status',
  '1748414780125_seed-ws-event-report-reasons',
  '1748828810941_seed-ws-event-report-status',
  '1754897204267_add-column-event_report_histories-deleted_at',
  '1755090289110_seed-ws_event_report_reasons',
  '1750056890000_create_disposal_instruction_types_table',
  '1757478524444_create-disposal-instructions-and-relations-table',
  '1753044561589_create_disposal_shipment_table',
  '1750390294504_add_self_disposal_number',
  '1753700288395_add-column-ws_disposal_methods-status',
  '1753710510726_seed-ws_disposal_methods',
  '1753713234277_add-column-ws_disposal_transactions-disposal_qty'
);

-- Note: 1750056889026_create_disposal_table.ts was NOT deleted (see above),
-- so its kysely_migration row is intentionally left in place.
