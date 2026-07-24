import z from "zod"

// Query schema for listing activity plans
export const ActivityPlanQuerySchema = z.object({})

export type ActivityPlanQuery = z.infer<typeof ActivityPlanQuerySchema>

// Reference object with id and name
export interface ReferenceItem {
  id: number
  name: string
}

// Budget source reference object, flags whether it is a custom (user-defined) source
export interface BudgetSourceReferenceItem extends ReferenceItem {
  is_custom: number
}

// Base schema for activity plan fields
export const ActivityPlanBaseSchema = z.object({
  title: z.string().min(1).max(255),
  objective: z.string().nullable().optional(),
  frequency_id: z.number().int().nullable().optional(),
  target_group_ids: z.array(z.number()).nullable().optional(),
  location_type_ids: z.array(z.number()).nullable().optional(),
  implementation_schedule: z.string().nullable().optional(),
  material_ids: z.array(z.number()).nullable().optional(),
  budget_estimation: z.number().nullable().optional(),
  budget_source_ids: z.array(z.number()).nullable().optional(),
  other_budget_source_name: z.string().nullable().optional(),
  additional_information: z.string().nullable().optional(),
  number_of_vaccinator: z.number().int().nullable().optional(),
  pics: z.string().nullish(),
})

export type ActivityPlanBase = z.infer<typeof ActivityPlanBaseSchema>

// Create schema (title is required)
export const CreateActivityPlanSchema = ActivityPlanBaseSchema
export type CreateActivityPlan = z.infer<typeof CreateActivityPlanSchema>

// Update params schema
export const UpdateActivityPlanParamsSchema = z.object({
  id: z.coerce.number(),
})

// Update schema (all fields optional)
export const UpdateActivityPlanSchema = ActivityPlanBaseSchema.partial()
export type UpdateActivityPlan = z.infer<typeof UpdateActivityPlanSchema>

// Response interfaces

// List item response
export interface ActivityPlanListItemResponse {
  id: number
  title: string
  has_completed: number
  is_mandatory: number
  data: ActivityPlanDetailResponse | null
}

// Detail response
export interface ActivityPlanDetailResponse {
  id: number
  title: string
  objective: string | null
  frequency: { id: number; name: string } | null
  target_groups: ReferenceItem[] | null
  location_types: ReferenceItem[] | null
  implementation_schedule: string | null
  materials: ReferenceItem[] | null
  budget_estimation: number | null
  budget_sources: BudgetSourceReferenceItem[] | null
  other_budget_source_name: string | null
  additional_information: string | null
  number_of_vaccinator: number | null
  pics: string | null
  is_mandatory: number
  has_completed: number
  status: number
}

// Create response
export interface CreateActivityPlanResponse {
  message: string
  id: number
}

// Update/Delete response
export interface UpdateActivityPlanResponse {
  message: string
}

// Summary response
export interface ActivityPlanSummaryResponse {
  total_plans: number
  completed_plans: number
  mandatory_plans: {
    total: number
    completed: number
  }
  optional_plans: {
    total: number
    completed: number
  }
  progress: {
    percentage: number
  }
}

// Step status for overview integration
export interface ActivityPlanStepStatus {
  step_number: 6
  title: string
  status: {
    status: "not_filled" | "not_completed" | "completed"
    completed: number
    total: 2
    percentage: number
  }
}
