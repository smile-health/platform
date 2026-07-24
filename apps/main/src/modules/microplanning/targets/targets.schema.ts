import { TARGET_GROUP_NAME_TRANSFORM } from "@/common/constants/target.js"
import { PaginationQueriesSchema } from "@smile-health/lib/types/paginate.js"
import moment from "moment"
import { z } from "zod"

const preprocessYesNo = (value: unknown) => {
  if (value === null || value === undefined || value === "") return 0
  if (typeof value === "number") return value === 1 ? 1 : 0
  if (typeof value === "string") {
    const str = value.toLowerCase().trim()
    if (str.toLocaleLowerCase() === "yes" || str === "1") return 1
    if (str.toLocaleLowerCase() === "no" || str === "0") return 0
    return str
  }
  return value
}

export interface LocationDetailsResponse {
  village: {
    id: number
    name: string
  }
  subdistrict: {
    id: number
    name: string
  }
  regency: {
    id: number
    name: string
  }
  province: {
    id: number
    name: string
  }
}

export interface TargetGroup {
  id: number
  title: string
}

export interface SchoolEntitySchema {
  province_id: number
  province: string
  city_id: number
  city: string
  district_id: number
  district: string
  school_id: number
  school_name: string
}

export const TargetDataRequestSchema = z.object({
  nik: z
    .string({ required_error: "NIK is required" })
    .min(1, { message: "NIK cannot be empty" })
    .refine((val) => val.trim() !== "", {
      message: "NIK cannot be empty or whitespace",
    }),
  gender: z.number().int().min(1).max(2),
  date_of_birth: z
    .string()
    .refine((date) => moment(date, "YYYY-MM-DD", true).isValid(), {
      message: "Invalid date format",
    }),
  registered_village_id: z.number(),
  registered_postal_code: z.number(),
  registered_address: z.string().optional().nullable(),
  residence_village_id: z.number(),
  residence_postal_code: z.number(),
  residence_address: z.string().optional().nullable(),
  entity_id: z.number().optional().nullable(),
  grade: z.number().optional().nullable(),
  name: z.string(),
  target_group_id: z.number().optional(),
  marital_status: z.number().optional().nullable(),
  education_id: z.number().optional().nullable(),
  occupation_id: z.number().optional().nullable(),
  religion_id: z.number().optional().nullable(),
  ethnic_id: z.number().optional().nullable(),
  phone_number: z.string().optional().nullable(),
  created_by: z.number().optional(),
  updated_by: z.number().optional(),
})

export const CreateTargetDataInternalSchema = z.object({
  nik: z.string(),
  gender: z.number().int().min(1).max(2),
  date_of_birth: z.string(),
  registered_province_id: z.number(),
  registered_regency_id: z.number(),
  registered_subdistrict_id: z.number(),
  registered_village_id: z.number(),
  registered_postal_code: z.number().nullable(),
  registered_address: z.string().optional().nullable(),
  residence_province_id: z.number(),
  residence_regency_id: z.number(),
  residence_subdistrict_id: z.number(),
  residence_village_id: z.number(),
  residence_postal_code: z.number().nullable(),
  residence_address: z.string().optional().nullable(),
  entity_id: z.number().optional(),
  grade: z.number().optional(),
  target_group_id: z.number().optional().nullable(),
  microplanning_id: z.number(),
  status: z.number().optional(),
  name: z.string(),
  marital_status: z.number().optional().nullable().default(0),
  education_id: z.number().optional().nullable(),
  occupation_id: z.number().optional().nullable(),
  religion_id: z.number().optional().nullable(),
  ethnic_id: z.number().optional().nullable(),
  phone_number: z.string().optional().nullable(),
  identity_type: z.number(),
  created_by: z.number().optional(),
  updated_by: z.number().optional(),
})

export const GetIdentityAndAddress = z.object({
  day_of_birth: z.number(),
  month_of_birth: z.number(),
  year_of_birth: z.number(),
  actual_day: z.number(),
  full_year: z.number(),
  gender: z.number(),
  date_of_birth: z.string(),
  province: z.string(),
  city: z.string(),
  district: z.string(),
  district_id: z.number(),
  city_id: z.number(),
  province_id: z.number(),
})

export const GetTargetDataByNIKRequestSchema = z.object({
  nik: z.string().min(1),
})

export const TargetDataResponseSchema = z.object({
  id: z.number(),
  nik: z.string(),
  personal_identity: z.object({
    name: z.string(),
    gender: z.number(),
    date_of_birth: z.string(),
  }),
  registered_address: z.object({
    province_id: z.number(),
    province: z.string(),
    city_id: z.number(),
    city: z.string(),
    district_id: z.number(),
    district: z.string(),
    village_id: z.number(),
    village: z.string(),
    postal_code: z.number(),
    address: z.string().optional().nullable(),
  }),
  residence_address: z.object({
    province_id: z.number(),
    province: z.string(),
    city_id: z.number(),
    city: z.string(),
    district_id: z.number(),
    district: z.string(),
    village_id: z.number(),
    village: z.string(),
    postal_code: z.number(),
    address: z.string().optional().nullable(),
  }),
  school_address: z
    .object({
      school_id: z.number(),
      school_name: z.string(),
      grade: z.string().nullable(),
      province_id: z.number(),
      province: z.string(),
      city_id: z.number(),
      city: z.string(),
      district_id: z.number(),
      district: z.string(),
    })
    .optional(),
  demographic_info: z.object({
    marital_status: z.object({
      id: z.number(),
      title: z.string(),
    }),
    education: z.object({
      id: z.number(),
      title: z.string(),
    }),
    occupation: z.object({
      id: z.number(),
      title: z.string(),
    }),
    religion: z.object({
      id: z.number(),
      title: z.string(),
    }),
    ethnic: z.object({
      id: z.number(),
      title: z.string(),
    }),
    phone_number: z.string(),
  }),
})

export const CreateTargetDataSuccessResponseSchema = z.object({
  id: z.number(),
})

export const NIKParamSchema = z.object({
  nik: z
    .string({ required_error: "NIK is required" })
    .min(1, { message: "NIK cannot be empty" })
    .refine((val) => val.trim() !== "", {
      message: "NIK cannot be empty or whitespace",
    }),
})

export const DeleteResponse = z.object({
  message: z.string(),
  status: z.boolean(),
})

export const SummaryDetailResponse = z.object({
  total: z.number(),
  absolute_count: z.number().optional(),
  data: z.array(z.any()),
  data_out_of_school: z.array(z.any()).optional(),
})

export const TargetDetailResponse = z.object({
  id: z.number(),
  nik: z.string(),
  gender: z.number(),
  date_of_birth: z.string(),
  registered_village_id: z.number(),
  registered_postal_code: z.string(),
  registered_address: z.string().optional().nullable(),
  residence_village_id: z.number(),
  residence_postal_code: z.string(),
  residence_address: z.string().optional().nullable(),
  entity_id: z.number(),
  target_group_id: z.number(),
  name: z.string(),
  marital_status: z.number(),
  education_id: z.number(),
  education_title: z.string().optional().nullable(),
  occupation_id: z.number(),
  occupation_title: z.string().optional().nullable(),
  religion_id: z.number(),
  religion_title: z.string().optional().nullable(),
  ethnic_id: z.number(),
  ethnic_title: z.string().optional().nullable(),
  phone_number: z.string(),
  target_group_name: z.string().nullable(),
})

export const TargetSummaryItemSchema = z.object({
  id: z.number().nullable(),
  name: z.string().nullable(),
  qty: z.number().or(z.string()),
  prefix: z.enum(["school", "village"]),
})

export const SummaryRequestSchema = z.object({
  type: z.string().optional(),
  target_group_ids: z.string().optional(),
})

export const CalculateTargetEstimationPathRequestSchema = z.object({
  category: z.enum(["bias", "non-bias"]),
  id: z.coerce.number(),
})

export const CalculateTargetEstimationRequestSchema = z.object({
  outreach_service_percentage: z.number(),
  facility_based_service_percentage: z.number(),
  outreach_service_available_number: z.number(),
  facility_based_service_available_number: z.number(),
})

export const GetDetailCalculateSchema = z.object({
  id: z.coerce.number(),
})

export const GetDetailCalculatePathSchema = z.object({
  category: z.enum(["bias", "non-bias"]),
})

export const TargetSummaryResponseSchema = z.object({
  data: z.array(TargetSummaryItemSchema),
  previous_data: z.array(TargetSummaryItemSchema),
  next_year: z.number(),
})

export const SummaryDetailQuerySchema = PaginationQueriesSchema.extend({
  sub_district_id: z.string(),
})

export const SummaryDetailRequestSchema = PaginationQueriesSchema.extend({
  target_group_id: z
    .string({ required_error: "target_group_id is required" })
    .min(1, { message: "target_group_id cannot be empty" })
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "target_group_id must be a valid positive number",
    })
    .refine(
      (val) => {
        const validIds = Object.keys(TARGET_GROUP_NAME_TRANSFORM).map(Number)
        return validIds.includes(Number(val))
      },
      {
        message: `target_group_id must be one of the valid target group IDs: ${Object.keys(TARGET_GROUP_NAME_TRANSFORM).join(", ")}`,
      }
    ),
})

export const NikListRequestSchema = PaginationQueriesSchema.extend({
  id: z
    .string({ required_error: "id is required" })
    .min(1, { message: "id cannot be empty" })
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "id must be a valid positive number",
    }),
  keyword: z.string().optional(),
  year: z
    .string()
    .transform((val) => Number(val))
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "year must be a valid positive number",
    })
    .optional(),
  prefix: z.enum(["school", "village"]),
  entity_id: z
    .string()
    .transform((val) => Number(val))
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "entity_id must be a valid positive number",
    })
    .optional(),
  category_id: z
    .string({ required_error: "category_id is required" })
    .min(1, { message: "category_id cannot be empty" })
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "category_id must be a valid positive number",
    })
    .refine(
      (val) => {
        if (!val || val === "") return true
        const validIds = Object.keys(TARGET_GROUP_NAME_TRANSFORM).map(Number)
        return validIds.includes(Number(val))
      },
      {
        message: `category_id must be one of the valid target group IDs: ${Object.keys(TARGET_GROUP_NAME_TRANSFORM).join(", ")}`,
      }
    ),
})

export const NikListItemSchema = z.object({
  id: z.number(),
  nik: z.string(),
})

export const NikListMappedResponseSchema = z.object({
  name: z.string().nullable(),
  category_name: z.string().nullable(),
  list: z.array(NikListItemSchema),
})

export const GroupedSummaryRequestSchema = z.object({
  group_by: z.enum(["bias", "non-bias"]),
})

export const AddTargetDataRequestSchema = z.object({
  nik: z
    .string({ required_error: "NIK is required" })
    .min(1, { message: "NIK cannot be empty" })
    .refine((val) => val.trim() !== "", {
      message: "NIK cannot be empty or whitespace",
    }),
  name: z.string(),
  date_of_birth: z
    .string()
    .refine((date) => moment(date, "YYYY-MM-DD", true).isValid(), {
      message: "Invalid date format",
    }),
  phone_number: z.string().optional().nullable(),
  gender: z.number().int().min(1).max(2),
  registered_postal_code: z.number().optional(),
  registered_village_id: z.number(),
  registered_address: z.string().optional().nullable(),
  residence_postal_code: z.number().optional(),
  residence_village_id: z.number(),
  residence_address: z.string().optional().nullable(),
  entity_id: z.number().optional().nullable(),
  grade: z.number().optional().nullable(),
  marital_status: z.number().optional().nullable(),
  education_id: z.number().optional().nullable(),
  occupation_id: z.number().optional().nullable(),
  religion_id: z.number().optional().nullable(),
  ethnic_id: z.number().optional().nullable(),
})

export const UpdateTargetDataRequestSchema = z.object({
  name: z.string(),
  phone_number: z.string().optional().nullable(),
  registered_postal_code: z.number().optional(),
  registered_village_id: z.number().optional(),
  registered_address: z.string().optional().nullable(),
  residence_postal_code: z.number().optional(),
  residence_village_id: z.number().optional(),
  residence_address: z.string().optional().nullable(),
  entity_id: z.number().optional().nullable(),
  grade: z.number().optional().nullable(),
  marital_status: z.number().optional().nullable(),
  education_id: z.number().optional().nullable(),
  occupation_id: z.number().optional().nullable(),
  religion_id: z.number().optional().nullable(),
  ethnic_id: z.number().optional().nullable(),
})

export const CreateTargetIdealSchema = z.object({
  target_id: z.number(),
  material_id: z.number(),
  material_target_id: z.number(),
  start_ideal_days: z.number(),
  ideal_date: z.string(),
  end_ideal_date: z.string(),
  target_group_id: z.number(),
  microplanning_id: z.number(),
  created_by: z.number().optional(),
  patient_id: z.number(),
})

export const CreateAbsoluteTargetSchema = z.object({
  target_group_id: z.number(),
  entity_id: z.number().optional(),
  qty: z.number(),
})

export type CreateAbsoluteTargetRequestDTO = z.infer<
  typeof CreateAbsoluteTargetSchema
>

export type CreateTargetIdealDTO = z.infer<typeof CreateTargetIdealSchema>

export type CalculateTargetEstimationPathRequestDTO = z.infer<
  typeof CalculateTargetEstimationPathRequestSchema
>

export type CalculateTargetEstimationRequestDTO = z.infer<
  typeof CalculateTargetEstimationRequestSchema
>

export type CreateTargetDataRequestDTO = z.infer<typeof TargetDataRequestSchema>

export type CreateTargetDataInternalDTO = z.infer<
  typeof CreateTargetDataInternalSchema
>

export type GetSummaryDetailDTO = z.infer<typeof SummaryDetailResponse>

export type GetTargetDataByNIKRequestDTO = z.infer<
  typeof GetTargetDataByNIKRequestSchema
>

export type TargetDataDetailResponseSchemaDTO = z.infer<
  typeof TargetDataResponseSchema
>

export type CreateTargetDataSuccessResponseDTO = z.infer<
  typeof CreateTargetDataSuccessResponseSchema
>

export type GetIdentityAndAddressResponseDTO = z.infer<
  typeof GetIdentityAndAddress
>

export type AddTargetDataRequest = z.infer<typeof AddTargetDataRequestSchema>

export type UpdateTargetDataRequest = z.infer<
  typeof UpdateTargetDataRequestSchema
>

export type TargetSummaryItemDTO = z.infer<typeof TargetSummaryItemSchema>
export type TargetSummaryResponseDTO = z.infer<
  typeof TargetSummaryResponseSchema
>

export type GetSummaryDetailRequestDTO = z.infer<
  typeof SummaryDetailRequestSchema
>

export type GetSummaryRequestDTO = z.infer<typeof SummaryRequestSchema>

export type GetSummaryDetailQueryDTO = z.infer<typeof SummaryDetailQuerySchema>

export type NikListRequestDTO = z.infer<typeof NikListRequestSchema>

export type NikListItemDTO = z.infer<typeof NikListItemSchema>

export type NikListMappedResponseDTO = z.infer<
  typeof NikListMappedResponseSchema
>

export type DeleteResponseSchemaDTO = z.infer<typeof DeleteResponse>

export type TargetDetailSchema = z.infer<typeof TargetDetailResponse>

export type GroupedSummaryRequestDTO = z.infer<
  typeof GroupedSummaryRequestSchema
>

export type GetDetailCalculateDTO = z.infer<typeof GetDetailCalculateSchema>

export type GetDetailCalculatePathDTO = z.infer<
  typeof GetDetailCalculatePathSchema
>

export interface GroupedSummaryTargetItem {
  category: string
  target_group_id: number
  count: number
}

export interface GroupedSummaryGroup {
  id: number
  name: string
  district?: string
  targets: GroupedSummaryTargetItem[]
}

export interface GroupedSummaryResponseDTO {
  group_by: "school" | "village"
  groups: GroupedSummaryGroup[]
}

export interface TargetSummaryResponse {
  number_of_target: Array<{
    target_group_id: number | null
    label: string | null
    count: number
  }>
  number_of_injection: {
    annual: {
      bbl_baduta: number
      wus: number
    }
    monthly: number
  }
}

// Import Schema
export interface ColumnImportTargetSchema {
  NIK: string
  Name: string
  PhoneNumber: string
  MaritalStatusID: string
  EducationID: string
  OccupationID: string
  ReligionID: string
  EthnicID: string
  RegisteredVillageID: string
  RegisteredPostalCode: string
  RegisteredAddress: string
  SameAddress: string
  ResidenceProvinceID: string
  ResidenceCityID: string
  ResidenceDistrictID: string
  ResidenceVillageID: string
  ResidencePostalCode: string
  ResidenceAddress: string
  InSchool: string
  SchoolProvinceID: string
  SchoolCityID: string
  SchoolDistrictID: string
  SchoolID: string
  Grade: string
}

export const ImportTargetRowSchema = (COL: ColumnImportTargetSchema) =>
  z
    .object({
      [COL.NIK]: z.string().or(z.number()).optional(),
      [COL.Name]: z.string().optional(),
      [COL.PhoneNumber]: z.string().or(z.number()).optional().nullable(),
      [COL.MaritalStatusID]: z.number().optional().nullable(),
      [COL.EducationID]: z.number().optional().nullable(),
      [COL.OccupationID]: z.number().optional().nullable(),
      [COL.ReligionID]: z.number().optional().nullable(),
      [COL.EthnicID]: z.number().optional().nullable(),
      [COL.RegisteredVillageID]: z.number().optional(),
      [COL.RegisteredPostalCode]: z.number().optional(),
      [COL.RegisteredAddress]: z.string().optional(),
      [COL.SameAddress]: z
        .preprocess(preprocessYesNo, z.number().int())
        .optional(),
      [COL.ResidenceProvinceID]: z.number().optional(),
      [COL.ResidenceCityID]: z.number().optional(),
      [COL.ResidenceDistrictID]: z.number().optional(),
      [COL.ResidenceVillageID]: z.number().optional(),
      [COL.ResidencePostalCode]: z.number().optional(),
      [COL.ResidenceAddress]: z.string().optional(),
      [COL.InSchool]: z
        .preprocess(preprocessYesNo, z.number().int())
        .optional(),
      [COL.SchoolProvinceID]: z.number().optional(),
      [COL.SchoolCityID]: z.number().optional(),
      [COL.SchoolDistrictID]: z.number().optional(),
      [COL.SchoolID]: z.number().optional(),
      [COL.Grade]: z.number().optional(),
    })
    .passthrough()
    .transform((row) => ({
      NIK: row[COL.NIK],
      Name: row[COL.Name],
      PhoneNumber: row[COL.PhoneNumber],
      MaritalStatusID: row[COL.MaritalStatusID],
      EducationID: row[COL.EducationID],
      OccupationID: row[COL.OccupationID],
      ReligionID: row[COL.ReligionID],
      EthnicID: row[COL.EthnicID],
      RegisteredVillageID: row[COL.RegisteredVillageID],
      RegisteredPostalCode: row[COL.RegisteredPostalCode],
      RegisteredAddress: row[COL.RegisteredAddress],
      SameAddress: row[COL.SameAddress],
      ResidenceProvinceID: row[COL.ResidenceProvinceID],
      ResidenceCityID: row[COL.ResidenceCityID],
      ResidenceDistrictID: row[COL.ResidenceDistrictID],
      ResidenceVillageID: row[COL.ResidenceVillageID],
      ResidencePostalCode: row[COL.ResidencePostalCode],
      ResidenceAddress: row[COL.ResidenceAddress],
      InSchool: row[COL.InSchool],
      SchoolProvinceID: row[COL.SchoolProvinceID],
      SchoolCityID: row[COL.SchoolCityID],
      SchoolDistrictID: row[COL.SchoolDistrictID],
      SchoolID: row[COL.SchoolID],
      Grade: row[COL.Grade],
    }))

export const ImportTargetRequestSchema = (COL: ColumnImportTargetSchema) =>
  z.array(ImportTargetRowSchema(COL)).min(1)

export type ImportTargetRequest = z.infer<
  ReturnType<typeof ImportTargetRowSchema>
>
export type ImportTargetRequestArray = ImportTargetRequest[]
