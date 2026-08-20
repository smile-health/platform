import { SQLDatabase } from "encore.dev/storage/sqldb";
import { Kysely, PostgresDialect, type Generated } from "kysely";
import { Pool } from "pg";

export const wmsDatabase = new SQLDatabase("wms", {
  migrations: "./migrations",
});

export interface WasteHierarchyTable {
  id: Generated<number>;
  created_by: string;
  updated_by: string;
  region_id: number;
  parent_hierarchy_id: number | null;
  name: string;
  name_en: string;
  description: string | null;
  description_en: string | null;
  level: Generated<number>;
  is_residue: Generated<boolean | null>;
  is_active: Generated<boolean | null>;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
  deleted_at: Date | null;
  deleted_by: number | null;
}

export interface WasteClassificationTable {
  id: Generated<number>;
  created_by: string;
  updated_by: string;
  region_id: number;
  effective_from: Date;
  effective_to: Date;
  waste_type_id: number;
  waste_group_id: number;
  waste_characteristics_id: number;
  waste_code: string;
  waste_bag_color_code: "BLACK" | "GRAY" | "YELLOW" | "PURPLE" | "BROWN" | "RED" | "NONE";
  storage_rule_type: "STATIC" | "RULE_BASED" | null;
  use_cold_storage: Generated<boolean>;
  cold_storage_min_hours: number | null;
  cold_storage_max_hours: number | null;
  temp_storage_min_hours: number | null;
  temp_storage_max_hours: number | null;
  minimun_decay_day: number | null;
  storage_rule: unknown | null;
  allow_healthcare_facility_treatment: Generated<boolean>;
  is_active: Generated<boolean>;
  has_multiple_transporters: Generated<boolean>;
  treatment_method: string | null;
  disposal_method: string | null;
  allowed_vehicle_types: string | null;
  created_at: Generated<Date>;
  updated_at: Date | null;
  deleted_at: Date | null;
  deleted_by: number | null;
}

export interface WasteSourceTable {
  id: Generated<number>;
  created_by: string;
  updated_by: string;
  healthcare_facility_id: number;
  source_type: "INTERNAL" | "EXTERNAL" | "INTERNAL_TREATMENT";
  internal_source_name: string | null;
  internal_treatment_name: "PYROLYSIS" | "DISINFECTION" | null;
  external_healthcare_facility_id: number | null;
  external_healthcare_facility_name: string | null;
  is_active: Generated<boolean>;
  is_residue: Generated<boolean>;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
  deleted_at: Date | null;
  deleted_by: number | null;
}

// Enum-like columns (waste_status, scale_method, transportation_status,
// owned_by, iot_method) are plain TEXT here, not real Postgres enums —
// pragmatic call given this table (and its near-duplicate waste_bag_record)
// is huge and touched by multiple large repository files; validation of
// these values happens at the Zod/service layer instead (matching the
// project's general convention of validating before the DB boundary).
// waste_status specifically: the model's ENUM() list and the TS union
// disagree (model has extra STORED_FOR_TREATMENT, missing
// HANDOVER_TO_TREATMENT/IN_THIRD_PARTY_STORAGE) — TEXT sidesteps having to
// pick a side; the application's WASTE_STATUS_VALUES union is the real
// source of truth.
export interface WasteBagTable {
  id: Generated<number>;
  created_by: string;
  created_at: Generated<Date>;
  updated_at: Date | null;
  updated_by: string | null;
  waste_bag_qr_code_id: string;
  healthcare_facility_id: number;
  waste_source_id: number;
  waste_classification_id: number;
  source_treatment_group_id: string | null;
  scale_method: Generated<string>;
  asset_id: number | null;
  weight_in_kgs: number | null;
  storage_start_timestamp: Date | null;
  scheduled_storage_end_datetime: Date | null;
  actual_storage_end_timestamp: Date | null;
  max_storage_hours: number | null;
  min_storage_hours: number | null;
  waste_treatment_group_id: number | null;
  waste_transportation_group_id: number | null;
  waste_treatment_external_group_id: number | null;
  waste_transportation_external_group_id: number | null;
  waste_status: Generated<string>;
  waste_status_updated_at: Generated<Date | null>;
  waste_status_updated_by: string | null;
  transportation_status: string | null;
  transportation_status_updated_at: Generated<Date | null>;
  transportation_status_updated_by: string | null;
  owned_by: Generated<string>;
  transporter_id: number | null;
  third_party_id: number | null;
  is_treated: Generated<boolean>;
  is_disposed: Generated<boolean>;
  bin_number: string | null;
  iot_method: string | null;
  manifest_doc_number: string | null;
  manifest_doc_path: string | null;
  treatment_start_time: Date | null;
  treatment_end_time: Date | null;
  waste_group_ids: string | null;
  treatment_location_id: number | null;
  healthcare_facility_name: string | null;
  province_id: number | null;
  province_name: string | null;
  regency_id: number | null;
  regency_name: string | null;
  district_id: number | null;
  district_name: string | null;
  transporter_name: string | null;
  third_party_name: string | null;
  bast_no: string | null;
  material_ids: string | null;
  deleted_at: Date | null;
  deleted_by: number | null;
}

// TEXT, not BIGINT — every real value written is a zero-padded numeric
// string (see waste-bag-qr-code.repository.ts's note); the model's declared
// type doesn't match actual usage, same situation as asset_dongle.asset_id.
export interface WasteBagQrCodeTable {
  id: Generated<number>;
  created_by: string;
  healthcare_facility_id: number | null;
  waste_classification_id: number | null;
  waste_source_id: number | null;
  qr_code: string;
  created_at: Generated<Date>;
  deleted_at: Date | null;
  deleted_by: number | null;
}

// Near-duplicate of WasteBagTable — a historical/snapshot record, same
// column shape and same TEXT-for-enums rationale.
export interface WasteBagRecordTable {
  id: Generated<number>;
  created_by: string;
  created_at: Generated<Date>;
  updated_at: Date | null;
  updated_by: string | null;
  waste_bag_qr_code_id: string;
  healthcare_facility_id: number;
  waste_source_id: number;
  waste_classification_id: number;
  source_treatment_group_id: string | null;
  scale_method: Generated<string>;
  asset_id: number | null;
  weight_in_kgs: number | null;
  storage_start_timestamp: Date | null;
  scheduled_storage_end_datetime: Date | null;
  actual_storage_end_timestamp: Date | null;
  max_storage_hours: number | null;
  min_storage_hours: number | null;
  waste_treatment_group_id: number | null;
  waste_transportation_group_id: number | null;
  waste_treatment_external_group_id: number | null;
  waste_transportation_external_group_id: number | null;
  waste_status: Generated<string>;
  waste_status_updated_at: Generated<Date | null>;
  waste_status_updated_by: string | null;
  transportation_status: string | null;
  transportation_status_updated_at: Generated<Date | null>;
  transportation_status_updated_by: string | null;
  owned_by: Generated<string>;
  transporter_id: number | null;
  third_party_id: number | null;
  is_treated: Generated<boolean>;
  is_disposed: Generated<boolean>;
  bin_number: string | null;
  iot_method: string | null;
  manifest_doc_number: string | null;
  manifest_doc_path: string | null;
  treatment_start_time: Date | null;
  treatment_end_time: Date | null;
  waste_group_ids: string | null;
  treatment_location_id: number | null;
  healthcare_facility_name: string | null;
  province_id: number | null;
  province_name: string | null;
  regency_id: number | null;
  regency_name: string | null;
  district_id: number | null;
  district_name: string | null;
  transporter_name: string | null;
  third_party_name: string | null;
  bast_no: string | null;
  material_ids: string | null;
  deleted_at: Date | null;
  deleted_by: number | null;
}

// Table name is waste_treatment_group (NOT waste_bag_treatment_group) —
// folder/route naming diverges from the physical table, per the model's
// documented tableName option.
export interface WasteTreatmentGroupTable {
  id: Generated<number>;
  created_by: string;
  updated_by: string;
  total_bags_count: Generated<number>;
  total_weight_in_kgs: number;
  treatment_asset_id: number | null;
  treatment_operator_id: number | null;
  handover_lattitude: number | null;
  handover_longitude: number | null;
  treatment_status: Generated<string>;
  handover_timestamp: Date | null;
  is_read_only: Generated<boolean>;
  group_id: string;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
  deleted_at: Date | null;
  deleted_by: number | null;
}

// Table name is waste_treatment_request (NOT waste_bag_treatment_request).
export interface WasteTreatmentRequestTable {
  id: Generated<number>;
  created_by: string;
  updated_by: string;
  request_status: string | null;
  treatment_group_id: number;
  request_creator_id: number | null;
  request_approver_id: number | null;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
  deleted_at: Date | null;
  deleted_by: number | null;
}

export interface WasteTransportationGroupTable {
  id: Generated<number>;
  created_by: string;
  updated_by: string;
  total_bags_count: Generated<number>;
  total_weight_in_kgs: number;
  transporter_vehicle_id: number | null;
  transporter_operator_id: string | null;
  handover_lattitude: number | null;
  handover_longitude: number | null;
  transportation_status: Generated<string>;
  handover_timestamp: Date | null;
  is_read_only: Generated<boolean>;
  group_id: string;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
  deleted_at: Date | null;
  deleted_by: number | null;
}

export interface WasteTransportationRequestTable {
  id: Generated<number>;
  created_by: string;
  updated_by: string;
  request_status: string | null;
  transportation_group_id: number;
  request_creator_id: number | null;
  request_approver_id: number | null;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
  deleted_at: Date | null;
  deleted_by: number | null;
}

export interface WasteTransportationExternalGroupTable {
  id: Generated<number>;
  created_by: string;
  updated_by: string;
  total_bags_count: Generated<number>;
  total_weight_in_kgs: number;
  transporter_id: number;
  transporter_vehicle_id: number | null;
  transporter_operator_id: string | null;
  treatment_provider_id: number | null;
  treatment_operator_id: string | null;
  handover_lattitude: number | null;
  handover_longitude: number | null;
  handover_timestamp: Date | null;
  transportation_status: Generated<string>;
  is_read_only: Generated<boolean>;
  group_id: string;
  waste_treatment_external_group_id: number | null;
  pickup_at: Date | null;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
  deleted_at: Date | null;
  deleted_by: number | null;
}

export interface WasteTreatmentExternalGroupTable {
  id: Generated<number>;
  created_by: string;
  updated_by: string;
  total_bags_count: Generated<number>;
  total_weight_in_kgs: number;
  treatment_provider_id: number | null;
  source_external_transportation_group_id: number;
  treatment_operator_id: string | null;
  transportation_status: Generated<string>;
  is_read_only: Generated<boolean>;
  group_id: string;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
  deleted_at: Date | null;
  deleted_by: number | null;
}

export interface RegionsTable {
  id: Generated<number>;
  code: string;
  name: string;
  region_type: "COUNTRY" | "PROVINCE/STATE" | "CITY" | "DISTRICT" | "SUB-DISTRICT" | "VILLAGE";
  parent_id: number | null;
  created_by: string;
  updated_by: string | null;
  created_at: Date;
  updated_at: Date | null;
}

export interface WasteBagAuditTrailTable {
  id: Generated<number>;
  waste_bag_id: number;
  previous_status: string;
  new_status: string;
  created_at: Date;
  // The 11 columns below restore parity with apps/wms-service's
  // WasteBagAuditTrailModel (id/waste_bag_id/created_at plus
  // previous_status/new_status were the only ones migration 2
  // — 2_create_waste_bag_audit_trail.up.sql — originally ported). Added by
  // migration 16 (16_extend_waste_bag_audit_trail.up.sql) as nullable
  // columns since ../waste-bag-audit-trail/'s existing insertAuditTrailEntry()
  // doesn't populate them (see that migration's comment for why NOT NULL
  // wasn't used).
  //
  // waste_bag_status / is_group are also the columns
  // waste/waste-treatment-external-group, waste/waste-bag-treatment-group and
  // waste/waste-transport-external-group's getWasteBagLogHistory port query
  // off this table (mirrors apps/wms-service's shared/utils/wasteBagLogHistory.ts
  // query) — previously declared here with a Generated<> workaround admitting
  // no migration backed them; migration 16 makes those two real, fixing that
  // module's previously-undefined runtime behavior as a side effect.
  // waste_bag_qr_code (also referenced by those repositories, for the same
  // expand/contract rename of waste_bag_id -> waste_bag_qr_code) is left
  // untouched by migration 16 — it's unrelated to these 11 fields and still
  // has no backing migration; that gap is pre-existing and out of scope here.
  event: string | null;
  source: string | null;
  remarks: string | null;
  waste_bag_status: string | null;
  transport_status: string | null;
  healthcare_facility_id: number | null;
  transporter_id: number | null;
  third_party_provider_id: number | null;
  updated_by: string | null;
  is_group: boolean;
  is_failed: boolean;
  waste_bag_qr_code: string | null;
}

export interface ScheduledEventsTable {
  id: Generated<number>;
  subject_id: number;
  event_type: string;
  previous_status: string;
  new_status: string;
  scheduled_at: Date;
  created_at: Date;
  dispatched_at: Date | null;
  metadata: unknown | null;
  created_by: Generated<string>;
  status: Generated<string>;
  retry_left: Generated<number>;
}

export interface EntitySettingsTable {
  id: Generated<number>;
  entity_id: number;
  setting_name: string;
  setting_value: string;
  created_by: string;
  updated_by: string | null;
  created_at: Generated<Date>;
  updated_at: Date | null;
  deleted_at: Date | null;
}

export interface EntitiesTable {
  id: Generated<number>;
  name: string | null;
  type: number | null;
  address: string | null;
  tag: string | null;
  province_id: string | null;
  regency_id: string | null;
  sub_district_id: string | null;
  village_id: string | null;
  integration_type: number | null;
  integration_client_id: number | null;
  location: string | null;
  external_properties: unknown | null;
  entity_type_id: number | null;
  code: string | null;
  nib: string | null;
  head_name: string | null;
  email: string | null;
  gender: number | null;
  mobile_phone: string | null;
  latitude: number | null;
  longitude: number | null;
  id_satu_sehat: number | null;
  total_bad_room: number | null;
  percentage_bad_room: number | null;
  is_active: Generated<boolean>;
  created_at: Generated<Date>;
  updated_at: Date | null;
  deleted_at: Date | null;
  deleted_by: number | null;
}

export interface EntityLocationTable {
  id: Generated<number>;
  entity_id: number;
  location_name: string;
  latitude: number;
  longitude: number;
  distance_limit_in_meters: number | null;
  address: string | null;
  province_id: number | null;
  city_id: number | null;
  province_name: string | null;
  city_name: string | null;
  location_type: "STORAGE" | "TREATMENT";
  created_by: string;
  updated_by: string | null;
  created_at: Generated<Date>;
  updated_at: Date | null;
  deleted_at: Date | null;
  deleted_by: number | null;
}

// Mirrors apps/wms-service's infrastructure/database/models/PartnershipModel.ts
// (Sequelize `paranoid: true` soft-delete). Originally a minimal stand-in
// (migrations 5/7) just far enough for partnership_vehicle_map /
// partnership_operator_map's joins; extended in migration 12 with the full
// column set once partnership/partnership's own CRUD module landed.
export interface PartnershipTable {
  id: Generated<number>;
  created_by: string;
  updated_by: string | null;
  created_at: Generated<Date>;
  updated_at: Date | null;
  contract_id: string | null;
  contract_start_date: Date | null;
  contract_end_date: Date | null;
  consumer_id: number;
  consumer_type:
    | "HEALTHCARE_FACILITY"
    | "TRANSPORTER"
    | "TRANSPORTER_RECYCLER"
    | "TRANSPORTER_SPECIALIZED_TREATMENT_PROVIDER"
    | "TRANSPORTER_LANDFILL"
    | "TRANSPORTER_TREATMENT"
    | "TRANSPORTER_TREATMENT_PROVIDER";
  waste_classification_id: number | null;
  provider_id: number | null;
  provider_type:
    | "LANDFILLER"
    | "TREATMENT_PROVIDER"
    | "RECYCLER"
    | "TREATMENT"
    | "SPECIALIZED_TREATMENT_PROVIDER"
    | "TRANSPORTER"
    | "TRANSPORTER_RECYCLER"
    | "TRANSPORTER_SPECIALIZED_TREATMENT_PROVIDER"
    | "TRANSPORTER_LANDFILL"
    | "TRANSPORTER_TREATMENT"
    | "TRANSPORTER_TREATMENT_PROVIDER"
    | "TRANSPORTER_GOVERNMENT"
    | "TRANSPORTER_GOVERNMENT_WASTE_BANK"
    | null;
  partnership_status: "PENDING" | "ACTIVE" | "SUSPENDED" | "TERMINATED" | "EXPIRED";
  has_incinerator: Generated<boolean>;
  has_autoclave: Generated<boolean>;
  pic_name: string | null;
  pic_position: string | null;
  pic_phone_number: string | null;
  price_per_kg: number | null;
  transporter_id: number | null;
  deleted_at: Date | null;
  deleted_by: number | null;
}

export interface PartnershipOperatorMapTable {
  partnership_id: number;
  operator_id: string;
  deleted_at: Date | null;
  deleted_by: number | null;
}

export interface PartnershipVehicleMapTable {
  partnership_id: number;
  vehicle_id: number;
  deleted_at: Date | null;
  deleted_by: number | null;
}

export interface PartnerVehicleTable {
  id: Generated<number>;
  created_by: string;
  updated_by: string;
  entity_id: number;
  vehicle_type:
    | "BOX_TRUCK"
    | "REFRIGERATED_BOX_TRUCK"
    | "OPEN_BODY_TRUCK"
    | "TANKER"
    | "HAZARDOUS_MATERIAL_TRUCK"
    | "RADIOACTIVE_MATERIAL_TRUCK"
    | "FLATBED_TRUCK"
    | "LOADER_TRUCK"
    | "TRAILER"
    | "VAN";
  vehicle_number: string;
  capacity_in_kgs: Generated<number>;
  transporter_id: number | null;
  created_at: Generated<Date>;
  updated_at: Date | null;
  deleted_at: Date | null;
  deleted_by: number | null;
}

export interface UserRoleTable {
  id: Generated<number>;
  created_by: string;
  updated_by: string;
  region_id: number;
  name: string;
  name_en: string;
  description: string | null;
  type: string;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
  deleted_by: number | null;
}

export interface UserFcmTokenTable {
  id: Generated<number>;
  user_id: number;
  entity_id: number;
  user_uuid: string;
  token: string;
  created_at: Generated<Date>;
  updated_at: Date | null;
  deleted_at: Date | null;
  deleted_by: number | null;
}

export interface NotificationsTable {
  id: Generated<number>;
  message: string | null;
  user_id: number;
  province_id: number | null;
  regency_id: number | null;
  entity_id: number;
  media: string;
  title: string | null;
  type: string;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
  read_at: Date | null;
  mobile_phone: string | null;
  action_url: string | null;
  download_url: string | null;
  patient_id: number | null;
  program_id: number | null;
  for_super_admin: boolean | null;
  for_admin: boolean | null;
  for_operator: boolean | null;
}

export interface GlobalSettingsTable {
  id: Generated<number>;
  created_by: string;
  updated_by: string;
  setting_name: string;
  setting_value: string;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
  deleted_at: Date | null;
  deleted_by: number | null;
}

// No Generated<> on id — the original Sequelize model has no auto-increment,
// ids are assigned upstream (see users.repository.ts's column comment).
export interface UsersTable {
  id: number;
  user_uuid: string;
  entity_id: number;
  firstname: string | null;
  lastname: string | null;
  email: string | null;
  username: string | null;
  mobile_phone: string | null;
  gender: number | null;
  gender_label: string | null;
  date_of_birth: Date | null;
  role: number | null;
  role_id: number | null;
  role_label: string | null;
  view_only: Generated<boolean>;
  status: number | null;
  last_device: number | null;
  last_login: Date | null;
  integration_client_id: number | null;
  keycloak_uuid: string | null;
  external_roles: string | null;
  address: string | null;
  manufacture_id: number | null;
  village_id: string | null;
  external_properties: unknown | null;
  deleted_at: Date | null;
  created_at: Date | null;
  updated_at: Date | null;
  created_by: number | null;
  updated_by: number | null;
  deleted_by: number | null;
  is_active: Generated<boolean>;
}

export interface AssetManufacturerTable {
  id: Generated<number>;
  created_by: string;
  updated_by: string;
  name: string;
  description: string | null;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
  deleted_at: Date | null;
  deleted_by: number | null;
}

export interface AssetModelTable {
  id: Generated<number>;
  created_by: string;
  updated_by: string;
  asset_type: "SCALE" | "INCINERATOR" | "AUTOCLAVE" | "COLD_STORAGE";
  manufacturer_id: number;
  name: string;
  description: string | null;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
  deleted_at: Date | null;
  deleted_by: number | null;
}

export interface HealthcareAssetTable {
  id: Generated<number>;
  asset_id: string | null;
  asset_type_name: string;
  entity_id: number;
  asset_working_status_name: string;
  status: Generated<boolean>;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
  deleted_at: Date | null;
  deleted_by: number | null;
}

// TEXT, not INTEGER — the original model declares an auto-increment integer
// PK, but it's dead in practice: callers always supply asset_id explicitly as
// a string (reused from an existing healthcare_asset id) — see
// asset-dongle.repository.ts's note. Storing as TEXT matches actual usage.
export interface AssetDongleTable {
  asset_id: string;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
  deleted_at: Date | null;
  deleted_by: number | null;
}

export interface HealthcareFacilityAssetTable {
  id: Generated<number>;
  created_by: string;
  updated_by: string;
  healthcare_facility_id: number;
  model_id: number;
  is_iot_enabled: Generated<boolean>;
  asset_id: string | null;
  asset_status: "OPERATIONAL" | "UNDER_MAINTAINENCE" | "OUT_OF_SERVICE" | "IDLE" | "RETIRED" | null;
  warranty_start_date: Date | null;
  warranty_end_date: Date | null;
  year_of_production: number | null;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
  deleted_at: Date | null;
  deleted_by: number | null;
}

// No updated_at — original model has timestamps:true but updatedAt:false.
export interface HealthcareFacilityAssetActivityTable {
  id: Generated<number>;
  created_by: string;
  created_at: Generated<Date>;
  hf_asset_id: number;
  operator_id: string | null;
  activity_type: "MAINTENANCE" | "CALIBRATION" | null;
  start_date: Date;
  end_date: Date | null;
  deleted_at: Date | null;
  deleted_by: number | null;
}

// waste_source_id/waste_classification_id reference tables that don't exist
// yet (waste domain, not built) — plain integers, no FK constraint until then.
export interface QrCodeConfigTable {
  id: Generated<number>;
  created_by: string;
  updated_by: string;
  healthcare_facility_id: number;
  waste_source_id: number;
  waste_classification_id: number;
  label_count: number;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
  deleted_at: Date | null;
  deleted_by: number | null;
}

// Mirrors ManualScaleRequestModel (table `manual_scale_request`, Sequelize
// `paranoid: true`) — see manual-scale-request/manual-scale-request.repository.ts.
export interface ManualScaleRequestTable {
  id: Generated<number>;
  requested_by: string;
  processed_by: string | null;
  is_active: Generated<boolean>;
  status: Generated<string>;
  approval_type: string | null;
  valid_until: Date | null;
  count_limit: number | null;
  entity_id: number;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
  deleted_at: Date | null;
  deleted_by: number | null;
}

// Mirrors DisposalModel (table `disposal`, Sequelize `paranoid: true`) — see
// disposal/bast/bast.repository.ts.
export interface DisposalTable {
  id: Generated<number>;
  entity_id: number;
  bast_no: string;
  description: string | null;
  created_name: string | null;
  entity_name: string | null;
  status: Generated<string>;
  is_read: Generated<boolean>;
  created_by: string;
  approved_by: string | null;
  approved_at: Date | null;
  rejected_by: string | null;
  rejected_at: Date | null;
  rejected_reason: string | null;
  created_at: Generated<Date>;
  deleted_at: Date | null;
  deleted_by: number | null;
}

// Mirrors DisposalItemsModel (table `disposal_items`, Sequelize `paranoid: true`).
export interface DisposalItemsTable {
  id: Generated<number>;
  material_id: number;
  bast_no: string;
  material_name: string;
  qty: number | null;
  deleted_at: Date | null;
  deleted_by: number | null;
}

export interface Database {
  regions: RegionsTable;
  waste_bag_audit_trail: WasteBagAuditTrailTable;
  scheduled_events: ScheduledEventsTable;
  entity_settings: EntitySettingsTable;
  entities: EntitiesTable;
  entity_location: EntityLocationTable;
  partnership: PartnershipTable;
  partnership_vehicle_map: PartnershipVehicleMapTable;
  partnership_operator_map: PartnershipOperatorMapTable;
  partner_vehicle: PartnerVehicleTable;
  user_role: UserRoleTable;
  user_fcm_token: UserFcmTokenTable;
  users: UsersTable;
  notifications: NotificationsTable;
  global_settings: GlobalSettingsTable;
  asset_manufacturer: AssetManufacturerTable;
  asset_model: AssetModelTable;
  healthcare_asset: HealthcareAssetTable;
  asset_dongle: AssetDongleTable;
  healthcare_facility_asset: HealthcareFacilityAssetTable;
  healthcare_facility_asset_activity: HealthcareFacilityAssetActivityTable;
  qr_code_config: QrCodeConfigTable;
  waste_hierarchy: WasteHierarchyTable;
  waste_classification: WasteClassificationTable;
  waste_source: WasteSourceTable;
  waste_bag: WasteBagTable;
  waste_bag_qr_code: WasteBagQrCodeTable;
  waste_bag_record: WasteBagRecordTable;
  waste_treatment_group: WasteTreatmentGroupTable;
  waste_treatment_request: WasteTreatmentRequestTable;
  waste_transportation_group: WasteTransportationGroupTable;
  waste_transportation_request: WasteTransportationRequestTable;
  waste_transportation_external_group: WasteTransportationExternalGroupTable;
  waste_treatment_external_group: WasteTreatmentExternalGroupTable;
  manual_scale_request: ManualScaleRequestTable;
  disposal: DisposalTable;
  disposal_items: DisposalItemsTable;
}

export function initDB(sqlDb: SQLDatabase): Kysely<Database> {
  return new Kysely<Database>({
    dialect: new PostgresDialect({
      pool: new Pool({ connectionString: sqlDb.connectionString }),
    }),
  });
}

export const db = initDB(wmsDatabase);
