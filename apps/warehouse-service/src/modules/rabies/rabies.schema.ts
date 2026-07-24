import {
  QueryParamsSchema,
} from "@/common/schemas/query-param.schema.js"
import { IdSchema, IdsSchema } from "@smile-health/lib/types/param.js"
import { z } from "zod"

export const RabiesQueryParamsSchema = z.intersection(
  QueryParamsSchema,
  z.object({
    vaccine: z.string().transform((v) => v ? v.toUpperCase() : null).optional(),
    gender: IdSchema.optional(),
    vaccine_method: IdSchema.optional(),
    identity_type: IdSchema.optional()
  })
)

export const RabiesCoverageSchema = z.object({
  total_entity: z.number(),
  total_faskes: z.number(),
  total_hospital: z.number(),
  total_province: z.number(),
  total_regency: z.number(),
})

export const EntityDenomSchema = z.object({
  total_fakses_denom: z.number(),
  total_hospital_denom: z.number()
})

export const RabiesRecipientVaccineSchema = z.object({
  total_patient: z.number(),
  total_patient_vaccine: z.number(),
  total_patient_sar: z.number(),
  total_dose: z.number(),
  total_dose_vaccine: z.number(),
  total_dose_sar: z.number()
})

export const RabiesMonthlyPatientInjectionSchema = z.array(
  z.object({
    month: z.number(),
    year: z.number(),
    total_patient: z.number(),
    total_injection: z.number(),
    total_male: z.number(),
    total_female: z.number(),
    total_undefined: z.number(),
    total_injection_male: z.number(),
    total_injection_female: z.number(),
    total_injection_undefined: z.number()
  })
)

export const MonthlyRabiesSequencesSchema = z.object({
  month: z.number(),
  year: z.number(),
  title: z.string(),
  total: z.number()
})

export const RabiesDetailSchema = z.object({
  row: z.number(),
  province_id: z.number(),
  province_name: z.string(),
  regency_id: z.number(),
  regency_name: z.string(),
  entity_id: z.number(),
  entity_name: z.string(),
  patient_id: z.number(),
  patient_nik: z.string(),
  vaccine_type: z.string(),
  material_id: z.number(),
  material_name: z.string(),
  material_unit: z.string(),
  actual_transaction_date: z.date(),
  vaccine_sequence: z.number(),
  material_category: z.string(),
  injection: z.number(),
  dose: z.number()
})

export type RabiesQueryParams = z.infer<typeof RabiesQueryParamsSchema>
export type RabiesCoverage = z.infer<typeof RabiesCoverageSchema>
export type EntityDenom = z.infer<typeof EntityDenomSchema>
export type RabiesRecipientVaccine = z.infer<typeof RabiesRecipientVaccineSchema>
export type RabiesMonthlyPatientInjection = z.infer<typeof RabiesMonthlyPatientInjectionSchema>
export type MonthlyRabiesSequences = z.infer<typeof MonthlyRabiesSequencesSchema>
export type RabiesDetail = z.infer<typeof RabiesDetailSchema>

export type RabiesSequences = {
  title: string
}
