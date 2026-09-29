/**
 * Static option lists for the audit trail filters. To audit a new route,
 * add its module here (value = the `module` stored in audit_logs).
 * Keep in sync with the AUDITED_ROUTES of each backend service.
 */
export const AUDIT_TRAIL_MODULES: Record<string, string[]> = {
  core: [
    'user',
    'executive_account',
    'executive_user',
    'executive_role',
    'executive_workspace',
    'program',
    'workspace',
    'budget_source',
    'manufacture',
    'material',
    'material_type',
    'material_relation',
    'material_level',
    'material_unit',
    'entity',
    'entity_type',
    'entity_tag',
    'asset_type',
    'asset_model',
    'asset_vendor',
    'asset_vendor_type',
  ],
  main: [
    'transaction',
    'stock',
    'order',
    'order_comment',
    'order_item_stock',
    'reconciliation',
    'entity_customer',
    'entity_material',
    'entity_activity',
    'stock_opname_period',
  ],
  auth: ['auth', 'executive_auth', 'keycloak_user'],
  interop: ['interop_route_mapping'],
  wms: [
    'wms_global_settings',
    'wms_waste_bag_qr_code',
    'wms_manual_scale_request',
    'wms_waste_bag',
    'wms_partnership',
    'wms_partnership_operator_map',
    'wms_partnership_vehicle_map',
    'wms_partner_vehicle',
    'wms_asset',
    'wms_asset_model',
    'wms_asset_dongle',
    'wms_healthcare_asset',
    'wms_healthcare_facility_asset',
    'wms_qr_code_config',
    'wms_users',
  ],
  export: ['export'],
}

export const AUDIT_TRAIL_SERVICES = [
  'core',
  'main',
  'warehouse',
  'auth',
  'interop',
  'wms',
] as const

export const AUDIT_TRAIL_ACTIONS = [
  'create',
  'update',
  'delete',
  'login',
  'logout',
  'export',
  'activate',
  'update_status',
  'refresh',
] as const

export const RETENTION_DAYS_MIN = 1
export const RETENTION_DAYS_MAX = 90

/** `stock_opname_period` -> `Stock Opname Period` */
export function humanize(value: string): string {
  return value
    .split('_')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export function toOptions(values: readonly string[]) {
  return values.map((value) => ({ value, label: humanize(value) }))
}

export const AUDIT_TRAIL_MODULE_OPTIONS = toOptions(
  Array.from(new Set(Object.values(AUDIT_TRAIL_MODULES).flat()))
)
