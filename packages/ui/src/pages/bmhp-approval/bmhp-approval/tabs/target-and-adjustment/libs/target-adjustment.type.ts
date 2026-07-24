// ─── GET /bmhp-approval/verifications ───────────────────────────────────────

export interface BmhpTargetGroup {
  id: number
  name: string
  /** Examination (pemeriksaan) ID */
  examination_id: number
  /** Examination name */
  examination: string
}

export type BmhpTargetItemStatus = 'completed' | 'not_submitted' | 'not_applicable'

export interface BmhpTargetItem {
  id: number | null
  examination_id: number
  target_id: number
  target: number
  adjustment_target: number
  /** 0 = Pending, 1 = Approved, 2 = Rejected */
  verification_status: 0 | 1 | 2
  is_not_screening?: boolean
  /** Client-only: true = approved, false = rejected, null = pending (not yet reviewed) */
  status?: boolean | null
  /** Client-only: revision note when status = false */
  revision_note?: string
  /** Status: completed, not_submitted, or not_applicable */
  item_status?: BmhpTargetItemStatus
}

export interface BmhpEntityName {
  id: number
  name: string
  address: string | null
}

export interface BmhpEntityData {
  id: number | null
  entity_name: BmhpEntityName
  target: BmhpTargetItem[]
  updated_at: string | null
  updated_by: number | null
  user_updated_by: { firstname: string | null; lastname: string | null } | null
}

export interface GetBmhpVerificationsResponse {
  target_group: BmhpTargetGroup[]
  data: BmhpEntityData[]
  see_calculation: boolean
}

// ─── PATCH /bmhp-approval/verifications ─────────────────────────────────────

export interface UpdateBmhpTargetItem {
  id: number | null
  examination_id: number
  target_id: number
  target: number
  adjustment_target: number
  /** true = approve, false = reject (triggers revision notification) */
  status: boolean
  revision_note?: string
}

export interface UpdateBmhpEntityData {
  planning_id?: number
  entity_id: number
  target: UpdateBmhpTargetItem[]
}

export interface UpdateBmhpVerificationsBody {
  // regency_id: number
  program_plan_id: number
  data: UpdateBmhpEntityData[]
}

export interface UpdateBmhpVerificationsResponse {
  status: boolean
  message: string
  data: Array<{ planning_id: number; entity_id: number }>
}

// ─── POST /bmhp-approval/review ─────────────────────────────────────────────

export interface ReviewProgramPlanBody {
  program_plan_id: number
  status?: number
  remaining_stock_date?: string
}

export interface ReviewProgramPlanResponse {
  status: boolean
  message: string
  data: { program_plan_id: number }
}

// ─── POST /verifications/status ─────────────────────────────────────────────

export interface UpdateVerificationStatusBody {
  program_plan_id: number
  /** 0 = reject, 1 = approve */
  status: number
}

export interface UpdateVerificationStatusResponse {
  status: boolean
  message: string
}

// ─── PATCH /verifications/status ────────────────────────────────────────────

export interface PatchVerificationStatusBody {
  program_plan_id: number
  target_group_id: number
  material_id: number
  entity_id: number
  /** 1 = approve, 2 = reject */
  status: number
}

export interface PatchVerificationStatusResponse {
  status: boolean
  message: string
}

// ─── Query params ─────────────────────────────────────────────────────────────

export interface TargetAdjustmentParams {
  program_plan_id: number
  regency_id?: number
  keyword?: string
  examination_id?: number | number[]
}

// ─── Local state types ────────────────────────────────────────────────────────

/** key: entity_name.id → changed entity */
export type ChangedEntityMap = Map<number, BmhpEntityData>

// ─── GET /bmhp-approval/verifications/target-input ───────────────────────────

export interface GetTargetInputParams {
  /** Year value, e.g. 2026 */
  program_plan_id: number
  // regency_id?: number
  entity_id?: number
}

export interface TargetInputItem {
  id: number | null
  examination_id: number
  examination_name: string
  target_id: number
  target_group_name: string
  /** Read-only — original Puskesmas target */
  target: number
  /** Editable — adjusted target set by Dinkes */
  adjustment_target: number
  is_not_screening: boolean
  /** Status: completed, not_submitted, or not_applicable */
  item_status: BmhpTargetItemStatus
}

export interface GetTargetInputResponse {
  entity: { id: number; name: string; address: string | null }
  program_plan: { id: number; year: number }
  province: { id: number | null; name: string | null }
  regency: { id: number | null; name: string | null }
  target_input: TargetInputItem[]
}

// ─── PATCH /bmhp-approval/verifications/target-input ─────────────────────────

export interface UpdateTargetInputPayload {
  /** Actual program plan DB id — from program_plan.id in GET response */
  program_plan_id: number
  // regency_id?: number
  entity_id?: number
  target_input: Array<{
    id: number | null
    examination_id: number
    target_id: number
    target: number
  }>
}

export interface UpdateTargetInputResponse {
  status: boolean
  message: string
  data: { entity_id: number; updated_count: number }
}
