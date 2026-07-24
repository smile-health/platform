import { z } from "zod"
import { IdSchema } from "@smile/lib/types/param.js"

export const ValueChainQueryParamsSchema = z.object({
  year: z.coerce.number().int().optional(),
  province_id: IdSchema.optional(),
}).optional()

export type ValueChainQueryParams = z.infer<
  typeof ValueChainQueryParamsSchema
>

// Schema untuk data item dalam setiap fase
export const PhaseDataItemSchema = z.object({
  key: z.string(),
  value: z.number(),
})

export type PhaseDataItem = z.infer<typeof PhaseDataItemSchema>

// Schema untuk setiap fase (01, 02, dst)
export const PhaseSchema = z.object({
  label: z.string(),
  sequence: z.string(),
  total: z.number(),
  data: z.array(PhaseDataItemSchema),
})

export type Phase = z.infer<typeof PhaseSchema>

// Response schema
export const ValueChainResponseSchema = z.object({
  last_updated: z.string(),
  data: z.object({
    "01": PhaseSchema,
    "02": PhaseSchema,
    "03": PhaseSchema,
    external_processing: z.object({
      "04_a": PhaseSchema,
      "05": PhaseSchema,
    }),
    internal_processing: z.object({
      "04_b": PhaseSchema,
      "05": PhaseSchema,
      "06": PhaseSchema,
      "07_a": PhaseSchema,
      "07_b": PhaseSchema,
    }),
  }),
})

export type ValueChainResponse = z.infer<typeof ValueChainResponseSchema>

// DTO dari database
export interface SortingDataDTO {
  waste_type_name: string
  total_bags: number
}

export interface WeighingDataDTO {
  waste_type_name: string
  total_weight_kg: number
}

export interface StorageDataDTO {
  storage_type: string
  total_weight_kg: number
}

export interface TransportationDataDTO {
  waste_type_name: string
  total_weight_kg: number
}

export interface ThirdPartyTreatmentDataDTO {
  waste_type_name: string
  total_weight_kg: number
}

export interface InternalTreatmentDataDTO {
  treatment_method: string
  total_weight_kg: number | null
}

export interface TreatmentResultDataDTO {
  treatment_method: string
  total_weight_kg: number | null
}

export interface TransportationResultDataDTO {
  treatment_method: string
  total_weight_kg: number | null
}

export interface RecyclingBeneficialUseDataDTO {
  treatment_method: string
  total_weight_kg: number | null
}

export interface FinalDisposalDataDTO {
  treatment_method: string
  total_weight_kg: number | null
}
