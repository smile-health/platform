import { PaginationQueriesSchema } from "@smile/lib/types/paginate.js"
import z from "zod"

export const MicroplanningStepsQuerySchema = z.object({
  category: z.enum(["bias", "non-bias"]).optional(),
})

export const MicroplanningConfigQuerySchema = z.object({
  key: z
    .string()
    .optional()
    .transform((val) =>
      val
        ? val
            .split(",")
            .map((k) => k.trim())
            .filter(Boolean)
        : undefined
    ),
})

export const MicroplanningSchoolsQuerySchema = PaginationQueriesSchema.extend({
  keyword: z.string().optional(),
})

export type MicroplanningStepsQuery = z.infer<
  typeof MicroplanningStepsQuerySchema
>

export type MicroplanningConfigQuery = z.infer<
  typeof MicroplanningConfigQuerySchema
>

export type MicroplanningSchoolsQuery = z.infer<
  typeof MicroplanningSchoolsQuerySchema
>

export interface SubStep {
  key: string
  name: string
  completed: number
  total: number
}

export interface StepStatus {
  status: "completed" | "not_completed" | "not_filled" | "disabled"
  completed: number
  total: number
  percentage: number
}

export interface Step {
  step_number: number
  title: string
  status: StepStatus
  is_modified: 0 | 1
  sub_steps?: SubStep[]
  detail?: Record<string, number>
}

export interface MicroplanningStepsResponse {
  is_submitted: boolean
  steps: Step[]
}

export interface SubmitMicroplanningResponse {
  message: string
  microplanning_id: number
}

export type MicroplanningYearStatus =
  | "submitted"
  | "pending_changes"
  | "not_filled"

export interface MicroplanningYear {
  year: number
  status: MicroplanningYearStatus
  label: string
  is_editable: 0 | 1
}

export interface MicroplanningYearsResponse {
  years: MicroplanningYear[]
}

export interface TargetGroupCount {
  target_group_id: number
  label: string
  count: number
}

export interface SummaryTargetAndRiskResponse {
  number_of_targets: TargetGroupCount[]
  community_health_worker: {
    total_additional_needs: number
  }
  vaccinator_needs: number
  immunization_service_days: {
    august: number
    november: number
  }
  total_villages_by_risk: {
    low: number
    medium: number
    high: number
  }
}
