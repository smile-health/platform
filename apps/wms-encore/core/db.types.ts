import type { Generated } from "kysely";

// Ported from apps/core/src/common/infrastructure/database/types/db.d.ts
// (kysely-codegen output) — structure kept as close to the original as
// possible per your instruction. Columns removed are Indonesia-specific
// only; everything else is unchanged, including nullability/Generated<>
// wrapping, so existing data keeps working without a migration.
//
// Removed from Entities:
//   province_id, regency_id, sub_district_id, village_id — replaced by a
//     single nullable `location_id` referencing the ALREADY-EXISTING generic
//     `locations` table (id/name/level/parent_id — see LocationsTable below).
//     Correction from an earlier pass: this table isn't something the scm
//     migration plan needs to invent, it already exists and does almost
//     exactly what was proposed. NOTE: `location_id` does NOT exist on the
//     real `entities` table yet — this needs an actual migration (add
//     column + backfill from province_id/regency_id/sub_district_id/
//     village_id before those are dropped for real), it's not free.
//   id_satu_sehat — Indonesia's national health data platform (SATUSEHAT) ID.
//   is_puskesmas — "puskesmas" (community health center) is an
//     Indonesia-specific facility classification.
export interface EntitiesTable {
  id: Generated<number>;
  code: Generated<string | null>;
  name: Generated<string | null>;
  type: Generated<number>;
  status: Generated<number>;
  parent_id: Generated<number | null>;
  entity_tag_id: Generated<number | null>;
  location_id: Generated<number | null>;
  is_vendor: Generated<number>;
  address: Generated<string | null>;
  postal_code: Generated<string | null>;
  country: Generated<string | null>;
  lat: Generated<string | null>;
  lng: Generated<string | null>;
  integration_type: Generated<number | null>;
  external_properties: Generated<string | null>;
  created_at: Generated<Date>;
  created_by: Generated<number | null>;
  updated_at: Generated<Date>;
  updated_by: Generated<number | null>;
  deleted_at: Generated<Date | null>;
}

// Removed from Users:
//   village_id — Indonesia-specific location reference (see Entities note above).
export interface UsersTable {
  id: Generated<number>;
  username: Generated<string | null>;
  email: Generated<string | null>;
  password: Generated<string | null>;
  firstname: Generated<string | null>;
  lastname: Generated<string | null>;
  address: Generated<string | null>;
  gender: Generated<number | null>;
  date_of_birth: Generated<Date | null>;
  mobile_phone: Generated<string | null>;
  mobile_phone_2: Generated<string | null>;
  mobile_phone_brand: Generated<string | null>;
  mobile_phone_model: Generated<string | null>;
  imei_number: Generated<string | null>;
  sim_id: Generated<string | null>;
  sim_provider: Generated<string | null>;
  entity_id: Generated<number | null>;
  manufacture_id: Generated<number | null>;
  role: Generated<number | null>;
  status: Generated<number | null>;
  permission: Generated<string | null>;
  keycloak_uuid: Generated<string | null>;
  user_uuid: Generated<string | null>;
  fcm_token: Generated<string | null>;
  last_login: Generated<Date>;
  last_device: Generated<number | null>;
  last_mobile_access: Generated<Date | null>;
  application_version: Generated<string | null>;
  view_only: Generated<number>;
  change_password: Generated<number | null>;
  daily_recap_email: Generated<number | null>;
  timezone_id: Generated<number | null>;
  iota_app_gui_theme: Generated<string | null>;
  external_properties: Generated<string | null>;
  token_login: Generated<string | null>;
  created_at: Generated<Date>;
  created_by: Generated<number | null>;
  updated_at: Generated<Date>;
  updated_by: Generated<number | null>;
  deleted_at: Generated<Date | null>;
  deleted_by: Generated<number | null>;
}

// Removed from Materials:
//   is_kfa — Indonesia's national pharmaceutical/device coding system
//     ("Kode Farmasi dan Alat Kesehatan", KFA) — flagged the same way as
//     id_satu_sehat, same reasoning: national-scheme-specific, not generic.
// Everything else here (batch/temperature/opname flags, pricing) is generic
// warehouse/supply-chain data, not Indonesia-specific, so it's kept as-is.
export interface MaterialsTable {
  id: Generated<number>;
  code: string;
  name: string;
  description: Generated<string | null>;
  hierarchy_code: Generated<string | null>;
  material_type_id: number;
  material_level_id: number;
  material_subtype_id: Generated<number | null>;
  unit_of_consumption_id: number;
  unit_of_distribution_id: number;
  consumption_unit_per_distribution_unit: number;
  is_managed_in_batch: number;
  is_temperature_sensitive: number;
  min_temperature: Generated<number | null>;
  max_temperature: Generated<number | null>;
  is_stock_opname_mandatory: Generated<number>;
  min_retail_price: number;
  max_retail_price: number;
  status: number;
  created_at: Generated<Date>;
  created_by: number;
  updated_at: Generated<Date>;
  updated_by: number;
  deleted_at: Generated<Date | null>;
  deleted_by: Generated<number | null>;
}

export interface RolesTable {
  id: Generated<number>;
  name: string;
  is_disabled_notification: Generated<number>;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}

export interface EntityTagsTable {
  id: Generated<number>;
  title: Generated<string | null>;
  integration_type: Generated<number | null>;
  is_open_vial: Generated<number | null>;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
  deleted_at: Generated<Date | null>;
}

export interface EntityTypesTable {
  id: Generated<number>;
  name: string;
  integration_type: Generated<number | null>;
  external_properties: Generated<string | null>;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
  deleted_at: Generated<Date | null>;
}

export interface MaterialRelationsTable {
  id: Generated<number>;
  parent_material_id: number;
  child_material_id: number;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
  deleted_at: Generated<Date | null>;
}

export interface MaterialLevelsTable {
  id: Generated<number>;
  name: string;
  order: string;
  enable: Generated<number | null>;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
  deleted_at: Generated<Date | null>;
}

export interface MaterialUnitsTable {
  id: Generated<number>;
  name: string;
  type: string;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
  deleted_at: Generated<Date | null>;
}

export interface BudgetSourcesTable {
  id: Generated<number>;
  name: string;
  description: Generated<string | null>;
  is_custom: Generated<number | null>;
  is_restricted: Generated<number | null>;
  created_at: Generated<Date>;
  created_by: Generated<number | null>;
  updated_at: Generated<Date>;
  updated_by: Generated<number | null>;
  deleted_at: Generated<Date | null>;
  deleted_by: Generated<string | null>;
}

export interface WorkspacesTable {
  id: Generated<number>;
  key: string;
  name: string;
  description: Generated<string | null>;
  config: Generated<string | null>;
  program_uuid: Generated<string | null>;
  is_beneficiaries: Generated<number | null>;
  created_at: Generated<Date>;
  created_by: Generated<number | null>;
  updated_at: Generated<Date>;
  updated_by: Generated<number | null>;
  deleted_at: Generated<Date | null>;
  deleted_by: Generated<number | null>;
}

export interface ExportHistoriesTable {
  id: Generated<number>;
  filename: string;
  original_filename: string;
  download_url: Generated<string | null>;
  status: Generated<"done" | "failed" | "in_progress" | "in_queue">;
  program_id: Generated<number | null>;
  expires_at: Generated<Date | null>;
  created_at: Generated<Date>;
  created_by: number;
  updated_at: Generated<Date>;
}

// Removed from Protocols:
//   is_kipi — "KIPI" (Kejadian Ikutan Pasca Imunisasi / Adverse Event
//     Following Immunization) is Indonesia MoH-specific immunization
//     terminology, same reasoning as is_kfa/id_satu_sehat.
export interface ProtocolsTable {
  id: Generated<number>;
  name: string;
  status: Generated<number | null>;
  is_identity_type: Generated<number | null>;
  is_medical_history: Generated<number | null>;
  created_at: Generated<Date>;
  created_by: Generated<number | null>;
  updated_at: Generated<Date>;
  updated_by: Generated<number | null>;
  deleted_at: Generated<Date | null>;
  deleted_by: Generated<number | null>;
}

export interface MaterialTypesTable {
  id: Generated<number>;
  name: string;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
  deleted_at: Generated<Date | null>;
}

export interface MaterialSubtypesTable {
  id: Generated<number>;
  name: string;
  material_type_id: Generated<number>;
  created_at: Generated<Date>;
  created_by: Generated<number | null>;
  updated_at: Generated<Date>;
  updated_by: Generated<number | null>;
  deleted_at: Generated<Date | null>;
  deleted_by: Generated<number | null>;
}

// Junction table for material <-> workspace ("program") associations —
// ported from apps/core's material_workspaces, used by material.module.ts's
// #managePrograms / workspaceRepo.getByFromMappedWorkspace.
export interface MaterialWorkspacesTable {
  id: Generated<number>;
  material_id: number;
  workspace_id: number;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
  deleted_at: Generated<Date | null>;
}

// Narrow ports of the workspace-scoped "shadow" tables (ws_materials,
// ws_stocks, ws_stock_opnames) — apps/core materializes a per-workspace
// denormalized copy of certain domain tables (Ws*-prefixed in db.d.ts).
// Only the columns material.repository.ts's findInTransaction/
// findInStockOpname actually read are included here — this is NOT a full
// port of that shadow-table system.
export interface WsMaterialsTable {
  id: Generated<number>;
  global_id: Generated<number>;
  material_id: Generated<number | null>;
  consumption_unit_per_distribution_unit: number;
  is_managed_in_batch: number;
  is_temperature_sensitive: number;
  is_stock_opname_mandatory: Generated<number>;
}

// Full port of apps/main's WsStocks (apps/main/src/common/infrastructure/
// database/types/db.d.ts) — replaces the earlier narrow 3-column stub now
// that smile/order/order/ and smile/inventory/inventory.subscriptions.ts
// need the real allocated_qty/in_transit_qty/qty columns to implement the
// order lifecycle & stock movement. Verified column list/types/Generated<>
// wrapping directly against that file, not from a secondhand summary.
export interface WsStocksTable {
  id: Generated<number>;
  activity_id: Generated<number | null>;
  allocated_qty: Generated<number | null>;
  batch_code: Generated<string | null>;
  batch_id: Generated<number | null>;
  budget_source_id: Generated<number | null>;
  created_at: Generated<Date>;
  created_by: Generated<number | null>;
  cutoff_qty: Generated<number>;
  deleted_at: Generated<Date | null>;
  deleted_by: Generated<number | null>;
  entity_id: Generated<number | null>;
  exterminated_qty: Generated<number | null>;
  exterminations_qty: Generated<number | null>;
  in_transit_qty: Generated<number | null>;
  manufacture_id: Generated<number | null>;
  material_id: Generated<number | null>;
  open_vial_qty: Generated<number | null>;
  parent_material_id: Generated<number | null>;
  price: Generated<number | null>;
  qty: Generated<number>;
  stock_quality_id: Generated<number | null>;
  total_price: Generated<number | null>;
  unreceived_qty: Generated<number | null>;
  updated_at: Generated<Date>;
  updated_by: Generated<number | null>;
  year: Generated<number | null>;
}

// Ported from apps/main's WsOrders (same db.d.ts as above) — the
// workspace-scoped order header. order.repository.ts (smile/order/order/)
// is the sole reader/writer of this table from wms-encore so far.
export interface WsOrdersTable {
  id: Generated<number>;
  activity_id: Generated<number | null>;
  biofarma_changed: Generated<number | null>;
  created_at: Generated<Date>;
  created_by: Generated<number | null>;
  customer_id: number;
  deleted_at: Generated<Date | null>;
  deleted_by: Generated<number | null>;
  delivery_number: Generated<string | null>;
  delivery_type_id: Generated<number | null>;
  device_type: Generated<number | null>;
  is_allocated: Generated<number | null>;
  metadata: Generated<string | null>;
  no_document: Generated<string | null>;
  no_po: Generated<string | null>;
  notes: Generated<string | null>;
  order_cancel_reason_id: Generated<number | null>;
  order_status_id: number;
  order_type_id: number;
  purchase_ref: Generated<string | null>;
  sales_ref: Generated<string | null>;
  taken_by_customer: Generated<number | null>;
  total_order_items: Generated<number | null>;
  updated_at: Generated<Date>;
  updated_by: Generated<number | null>;
  validated_at: Generated<Date | null>;
  validated_by: Generated<number | null>;
  vendor_id: number;
}

// Ported from apps/main's WsOrderItemStocks — one row per ordered material
// per order, carrying the ordered/allocated/received/confirmed quantities
// and the fulfilled stock_id it's backed by once allocated.
export interface WsOrderItemStocksTable {
  id: Generated<number>;
  allocated_qty: Generated<number | null>;
  confirmed_qty: Generated<number | null>;
  created_at: Generated<Date>;
  created_by: Generated<number | null>;
  deleted_at: Generated<Date | null>;
  deleted_by: Generated<number | null>;
  fulfill_reason: Generated<number | null>;
  fulfill_status: Generated<number | null>;
  fulfill_stock_status_id: Generated<number | null>;
  material_id: number;
  metadata: Generated<string | null>;
  order_id: number;
  order_item_kfa_id: Generated<number | null>;
  order_reason_id: Generated<number | null>;
  order_stock_status_id: Generated<number | null>;
  ordered_qty: Generated<number | null>;
  parent_material_id: Generated<number | null>;
  qrcode: Generated<string | null>;
  qty: Generated<number | null>;
  received_qty: Generated<number | null>;
  recommended_stock: Generated<number | null>;
  stock_id: Generated<number | null>;
  updated_at: Generated<Date>;
  updated_by: Generated<number | null>;
  validated_qty: Generated<number | null>;
}

// Ported from apps/main's WsTransactions (apps/main/src/common/infrastructure/
// database/types/db.d.ts, interface WsTransactions) — the stock-ledger table.
// Legacy order-status-{ship,fulfilled,cancel} repositories insert a row here
// (via `.insertInto("ws_transactions")`, confirmed in those repository files)
// alongside their ws_stocks mutation, inside the same request-scoped trx.
// Column list verified against that interface; nullability copied verbatim
// (every column there is `Generated<...>`, including `id`).
export interface WsTransactionsTable {
  activity_id: Generated<number | null>;
  actual_transaction_date: Generated<Date | null>;
  batch_code: Generated<string | null>;
  change_qty: Generated<number | null>;
  change_qty_open_vial: Generated<number | null>;
  commit_datetime: Generated<Date | null>;
  companion_activity_id: Generated<number | null>;
  companion_entity_id: Generated<number | null>;
  companion_program_id: Generated<number | null>;
  created_at: Generated<Date>;
  created_by: Generated<number | null>;
  deleted_at: Generated<Date | null>;
  deleted_by: Generated<number | null>;
  device_type: Generated<number | null>;
  entity_activity_id: Generated<number | null>;
  entity_id: Generated<number | null>;
  id: Generated<number>;
  is_acknowledged: Generated<number | null>;
  opening_qty: Generated<number | null>;
  opening_qty_open_vial: Generated<number | null>;
  order_id: Generated<number | null>;
  qty_in_vial: Generated<number | null>;
  returnable: Generated<number | null>;
  returned_qty: Generated<number | null>;
  returned_qty_open_vial: Generated<number | null>;
  status: Generated<number | null>;
  stock_id: Generated<number | null>;
  transaction_companion: Generated<number | null>;
  transaction_reason_id: Generated<number | null>;
  transaction_type_id: Generated<number | null>;
  updated_at: Generated<Date>;
  updated_by: Generated<number | null>;
  uuid: Generated<string | null>;
}

// Ported from apps/main's WsOrderStatuses — lookup table for ws_orders.order_status_id.
export interface WsOrderStatusesTable {
  id: Generated<number>;
  name: Generated<string | null>;
  created_at: Generated<Date>;
  created_by: Generated<number | null>;
  updated_at: Generated<Date>;
  updated_by: Generated<number | null>;
  deleted_at: Generated<Date | null>;
  deleted_by: Generated<number | null>;
}

export interface WsStockOpnamesTable {
  id: Generated<number>;
  material_id: Generated<number | null>;
  deleted_at: Generated<Date | null>;
}

// Correction from an earlier assumption: a generic location table already
// exists (apps/core's `locations`, used by master.repository.ts) — id/name/
// level/parent_id, i.e. almost exactly the generic level+hierarchy model
// the scm migration plan proposed inventing from scratch. The scm location
// refactor should EXTEND this table (e.g. add a materialized `path` column
// for non-recursive ancestor lookups) rather than build a new one — worth
// revisiting that part of the plan.
export interface LocationsTable {
  id: number;
  name: string;
  level: Generated<number | null>;
  parent_id: Generated<number | null>;
  lat: Generated<string | null>;
  lng: Generated<string | null>;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}

export interface LoginAttemptsTable {
  id: Generated<number>;
  ip: Generated<string | null>;
  hit: Generated<number | null>;
  last_attempt: Generated<Date>;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}

// Minimal — only the columns program.repository.ts's membership-scoping
// query actually reads. Not a full port of every user_workspaces column.
export interface UserWorkspacesTable {
  id: Generated<number>;
  user_id: number;
  workspace_id: number;
  deleted_at: Generated<Date | null>;
}

// Junction table for entity <-> workspace ("program") associations — used
// by entity.repository.ts's findInCustomerVendor guard (an entity that
// belongs to any workspace is checked against ws_customer_vendors before
// its type can change) and by program (workspace) association management,
// same shape as material_workspaces.
export interface EntityWorkspacesTable {
  id: Generated<number>;
  entity_id: number;
  workspace_id: number;
  is_vendor: Generated<number | null>;
  is_relocation: Generated<number>;
  status: Generated<number | null>;
  created_at: Generated<Date>;
  created_by: Generated<number | null>;
  updated_at: Generated<Date>;
  updated_by: Generated<number | null>;
  deleted_at: Generated<Date | null>;
  deleted_by: Generated<number | null>;
}

// Narrow port — only the columns entity.repository.ts's findInCustomerVendor
// guard reads (is this entity referenced as a customer or vendor anywhere).
export interface WsCustomerVendorsTable {
  id: Generated<number>;
  customer_id: number;
  vendor_id: number;
}

export interface DB {
  entities: EntitiesTable;
  locations: LocationsTable;
  login_attempts: LoginAttemptsTable;
  user_workspaces: UserWorkspacesTable;
  users: UsersTable;
  materials: MaterialsTable;
  roles: RolesTable;
  entity_tags: EntityTagsTable;
  entity_types: EntityTypesTable;
  material_relations: MaterialRelationsTable;
  material_levels: MaterialLevelsTable;
  material_units: MaterialUnitsTable;
  budget_sources: BudgetSourcesTable;
  workspaces: WorkspacesTable;
  export_histories: ExportHistoriesTable;
  protocols: ProtocolsTable;
  material_types: MaterialTypesTable;
  material_subtypes: MaterialSubtypesTable;
  material_workspaces: MaterialWorkspacesTable;
  ws_materials: WsMaterialsTable;
  ws_stocks: WsStocksTable;
  ws_stock_opnames: WsStockOpnamesTable;
  ws_orders: WsOrdersTable;
  ws_order_item_stocks: WsOrderItemStocksTable;
  ws_order_statuses: WsOrderStatusesTable;
  ws_transactions: WsTransactionsTable;
  entity_workspaces: EntityWorkspacesTable;
  ws_customer_vendors: WsCustomerVendorsTable;
}

// NOT ADDED: apps/core's wire.ts also mounts /program, /master, /account
// routes, but kysely-codegen's db.d.ts has no Programs/Masters/Accounts
// table — those paths likely aggregate other tables or map to differently
// named ones. Left as scaffold stubs (core/program, core/master,
// core/account) rather than guessing a schema — needs a real look at
// apps/core/src/modules/{program,master,account} before porting.
