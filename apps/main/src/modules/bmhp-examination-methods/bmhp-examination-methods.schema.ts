import { PaginationQueriesSchema } from "@smile/lib/types/paginate.js"
import { z } from "zod"

export const GetBmhpExaminationMethodsQueriesSchema = PaginationQueriesSchema.extend({
  keyword: z.string().optional(),
  program_plan_id: z.coerce.number().positive().int().optional(),
  sort_by: z
    .enum(
      [
        "name",
        "created_at",
        "updated_at",
      ],
      {
        message: "INVALID REQUEST SORT_BY",
      }
    )
    .optional(),
  sort_type: z
    .enum(["asc", "desc"], { message: "INVALID REQUEST SORT_TYPE" })
    .optional(),
})

export const CreateBmhpExaminationMethodRequestSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().optional(),
  program_plan_id: z.number().positive().int(),
})

export const UpdateBmhpExaminationMethodRequestSchema = z.object({
  name: z.string().min(1, "Name is required").max(100).optional(),
  description: z.string().optional(),
  program_plan_id: z.number().positive().int().optional(),
})

export type GetBmhpExaminationMethodsQueries = z.infer<
  typeof GetBmhpExaminationMethodsQueriesSchema
>
export type CreateBmhpExaminationMethodRequest = z.infer<
  typeof CreateBmhpExaminationMethodRequestSchema
>
export type UpdateBmhpExaminationMethodRequest = z.infer<
  typeof UpdateBmhpExaminationMethodRequestSchema
>

// Workspace Examination Methods
export const GetWsBmhpExaminationMethodsQueriesSchema = PaginationQueriesSchema.extend({
  examination_id: z.coerce.number().optional(),
  method_id: z.coerce.number().optional(),
  sort_by: z
    .enum(
      [
        "examination_id",
        "method_id",
        "created_at",
      ],
      {
        message: "INVALID REQUEST SORT_BY",
      }
    )
    .optional(),
  sort_type: z
    .enum(["asc", "desc"], { message: "INVALID REQUEST SORT_TYPE" })
    .optional(),
})

export const CreateWsBmhpExaminationMethodRequestSchema = z.object({
  examination_id: z.number().int().positive("Examination ID is required"),
  method_id: z.number().int().positive("Method ID is required"),
})

export const UpdateWsBmhpExaminationMethodRequestSchema = z.object({
  examination_id: z.number().int().positive("Examination ID is required").optional(),
  method_id: z.number().int().positive("Method ID is required").optional(),
})

export type GetWsBmhpExaminationMethodsQueries = z.infer<
  typeof GetWsBmhpExaminationMethodsQueriesSchema
>
export type CreateWsBmhpExaminationMethodRequest = z.infer<
  typeof CreateWsBmhpExaminationMethodRequestSchema
>
export type UpdateWsBmhpExaminationMethodRequest = z.infer<
  typeof UpdateWsBmhpExaminationMethodRequestSchema
>
