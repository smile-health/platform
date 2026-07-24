import { z } from "zod"

export class BmhpExaminationMethodMiddleware {
  // Schema for creating BMHP Examination Method
  readonly createBmhpExaminationMethodSchema = z.object({
    name: z
      .string()
      .min(1, "Name is required")
      .max(100, "Name must be less than 100 characters")
      .refine(
        (value) => !/^\s+$/.test(value),
        "Name cannot be only whitespace"
      ),
    description: z.string().optional(),
    program_plan_id: z.number().positive().int(),
  })

  // Schema for updating BMHP Examination Method
  readonly updateBmhpExaminationMethodSchema = z.object({
    name: z
      .string()
      .min(1, "Name is required")
      .max(100, "Name must be less than 100 characters")
      .refine(
        (value) => !/^\s+$/.test(value),
        "Name cannot be only whitespace"
      )
      .optional(),
    description: z.string().optional(),
    program_plan_id: z.number().positive().int().optional(),
  })

  // Schema for creating Workspace BMHP Examination Method
  readonly createWsBmhpExaminationMethodSchema = z.object({
    examination_id: z
      .number()
      .int()
      .positive("Examination ID must be a positive integer"),
    method_id: z
      .number()
      .int()
      .positive("Method ID must be a positive integer"),
  })

  // Schema for updating Workspace BMHP Examination Method
  readonly updateWsBmhpExaminationMethodSchema = z.object({
    examination_id: z
      .number()
      .int()
      .positive("Examination ID must be a positive integer")
      .optional(),
    method_id: z
      .number()
      .int()
      .positive("Method ID must be a positive integer")
      .optional(),
  })
}
