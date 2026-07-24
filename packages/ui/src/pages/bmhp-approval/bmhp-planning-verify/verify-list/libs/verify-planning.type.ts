/**
 * Target Group - sub-column under a Material
 */
export interface TargetGroup {
  id: number
  name: string
}

/**
 * Material - represents an examination type (column group in the table)
 * Each material has one or more target_groups (sub-columns)
 */
export interface Material {
  id: number
  name: string
  target_groups: TargetGroup[]
}

/**
 * Target item - planning data for a specific material × target_group combination
 */
export interface Target {
  id: number | null // null = backend will INSERT; number = backend will UPDATE
  examination_id: number // which Material column this belongs to
  target_id: number // which TargetGroup sub-column this belongs to
  target: number // sample_count
  adjustment_target: number // test_count
  status: boolean // true = active
}

/**
 * Entity Data - one row in the table (e.g., a Puskesmas)
 */
export interface EntityData {
  id: number | null // entity-level planning id; null if no planning exists yet
  entity_name: {
    id: number
    name: string
  }
  target: Target[]
}

/**
 * Response from GET /verify-bmhp-planning
 */
export interface VerifyPlanningResponse {
  page: number
  item_per_page: number
  total_item: number
  total_page: number
  list_pagination?: number[]
  material: Material[] // column structure (renamed from target_group)
  data: EntityData[] // row data
}

/**
 * Request params for GET /verify-bmhp-planning
 */
export interface VerifyPlanningParams {
  program_plan_id: number
  regency_id: number
  page?: number
  paginate?: number
  keyword?: string
  examination_id?: number // column filter — only show specific material's columns
}

/**
 * Single entity update data for POST /verify-bmhp-planning
 * Note: planning_id no longer required — backend resolves via entity_id + examination_id + year
 */
export interface EntityUpdateData {
  entity_id: number
  target: Target[]
}

/**
 * Request body for POST /verify-bmhp-planning
 */
export interface UpdateVerifyPlanningRequest {
  regency_id: number
  program_plan_id: number
  data: EntityUpdateData[]
}

/**
 * Response from POST /verify-bmhp-planning
 */
export interface UpdateVerifyPlanningResponse {
  status: boolean
  message: string
  data: Array<{
    planning_id: number
    entity_id: number
  }>
}

/**
 * Tracked changes - map of entity_id to EntityData
 */
export type ChangedDataMap = Map<number, EntityData>
