import { FLAG } from "@/common/constants/common.js"
import z from "zod"

export const PriorityAreasQuerySchema = z.object({
  village_id: z.coerce.number().optional(),
  previous_year: z.preprocess(Number, z.nativeEnum(FLAG)).optional(),
})

export type PriorityAreasQuery = z.infer<typeof PriorityAreasQuerySchema>

export const PriorityAreaItemSchema = z.object({
  village_id: z.number(),
  target_newborn_baby: z.number().nullable().optional(),
  target_surviving_infants: z.number().nullable().optional(),
  achievement_bcg: z.number().nullable().optional(),
  achievement_dpt1: z.number().nullable().optional(),
  achievement_dpt3: z.number().nullable().optional(),
  achievement_mr1: z.number().nullable().optional(),
  achievement_mr2: z.number().nullable().optional(),
  achievement_dpt4: z.number().nullable().optional(),
  achievement_prev_dpt3: z.number().nullable().optional(),
  achievement_prev_mr1: z.number().nullable().optional(),
  has_supporting_condition: z.preprocess(Number, z.nativeEnum(FLAG)).optional(),
  has_pd3i_case: z.preprocess(Number, z.nativeEnum(FLAG)).optional(),
})

export const RankingItemSchema = z.object({
  id: z.number(),
  priority_rank: z.number(),
})

export const UpdateRankingsSchema = z.array(RankingItemSchema)

export type PriorityAreaItem = z.infer<typeof PriorityAreaItemSchema>
export type RankingItem = z.infer<typeof RankingItemSchema>
export type UpdateRankings = z.infer<typeof UpdateRankingsSchema>

export const CreatePriorityAreaSchema = PriorityAreaItemSchema
export type CreatePriorityArea = z.infer<typeof CreatePriorityAreaSchema>

export const UpdatePriorityAreaParamsSchema = z.object({
  id: z.coerce.number(),
})
export const UpdatePriorityAreaSchema = PriorityAreaItemSchema
export type UpdatePriorityArea = z.infer<typeof UpdatePriorityAreaSchema>

export interface CalculatedFields {
  lo_raw: number | null
  lo_rate: number | null
  do_bayi_dpt13_raw: number | null
  do_bayi_dpt13_rate: number | null
  do_bayi_dpt1cr1_raw: number | null
  do_bayi_dpt1cr1_rate: number | null
  do_baduta_dpt34_raw: number | null
  do_baduta_dpt34_rate: number | null
  do_baduta_cr12_raw: number | null
  do_baduta_cr12_rate: number | null
  criteria_lo: string | null
  criteria_do: string | null
  category: number | null
  risk: string | null
}

export const MAP_RISK = {
  "LOW": 1,
  "MEDIUM": 2,
  "HIGH": 3
}
