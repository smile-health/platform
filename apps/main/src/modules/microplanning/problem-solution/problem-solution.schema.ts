import z from "zod"

// Query schema for listing villages
export const ProblemSolutionQuerySchema = z.object({
  village_id: z.coerce.number().optional(),
  keyword: z.string().optional(),
})

export type ProblemSolutionQuery = z.infer<typeof ProblemSolutionQuerySchema>

// Query schema for village solutions detail
export const VillageSolutionsQuerySchema = z.object({
  problem_type_id: z.coerce.number().optional(),
})

export type VillageSolutionsQuery = z.infer<typeof VillageSolutionsQuerySchema>

// Delete params schema
export const DeleteSolutionParamsSchema = z.object({
  id: z.coerce.number(),
})

// Base schema for problem_type and problem_category
// problem_category_id is always required
// problem_category_name is required when category has is_custom flag
export const ProblemSolutionItemSchema = z.object({
  village_id: z.number(),
  problem_type_id: z.number(),
  problem_category_id: z.number(),
  problem_category_name: z.string().min(1).optional(),
  solution: z.string().min(1).nullish(),
})

export type ProblemSolutionItem = z.infer<typeof ProblemSolutionItemSchema>

// Create schema
export const CreateProblemSolutionSchema = ProblemSolutionItemSchema
export type CreateProblemSolution = z.infer<typeof CreateProblemSolutionSchema>

// Update params schema
export const UpdateProblemSolutionParamsSchema = z.object({
  id: z.coerce.number(),
})

// Update schema (same as create)
export const UpdateProblemSolutionSchema = ProblemSolutionItemSchema
export type UpdateProblemSolution = z.infer<typeof UpdateProblemSolutionSchema>

// Response schemas

// For GET / - Village list with counts
export interface ProblemTypeCount {
  problem_type_id: number
  problem_type_name: string
  count: number
}

export interface VillageSolutionCountResponse {
  village_id: number
  village_name: string
  has_completed: number
  data: {
    problem_types: ProblemTypeCount[]
  } | null
}

// For GET /village/:village_id/solutions - Solutions detail grouped by problem_type
export interface ProblemCategorySolution {
  problem_category_id: number | null
  problem_category_name: string
  solution: string | null
  status: number
}

export interface ProblemTypeWithSolutions {
  problem_type_id: number
  problem_type_name: string
  solutions: ProblemCategorySolution[]
}

export interface VillageSolutionsDetailResponse {
  village_id: number
  village_name: string
  problem_types: ProblemTypeWithSolutions[]
}

// For PUT /solution/:id - Update response
// For DELETE /solution/:id - Delete response
export interface UpdateSolutionResponse {
  message: string
}

// For GET /summary - Summary response
export interface ProblemTypeSummaryItem {
  problem_type_id: number
  problem_type_name: string
  count: number
}

export interface ProblemSolutionSummaryDetail {
  completed_villages: number
  total_villages: number
}

export interface ProblemSolutionSummaryResponse {
  problem_type_summary: ProblemTypeSummaryItem[]
  progress: ProblemSolutionSummaryDetail
}
