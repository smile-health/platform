import { z } from "zod"

export class BmhpParameterMiddleware {
  // Schema for creating BMHP Parameter
  readonly createBmhpParameterSchema = z.object({
    program_plan_id: z.number().int().positive().optional(),
    name: z
      .string()
      .min(1, "Name is required")
      .max(100, "Name must be less than 100 characters")
      .refine(
        (value) => !/^\s+$/.test(value),
        "Name cannot be only whitespace"
      ),
    unit: z
      .string()
      .max(50, "Unit must be less than 50 characters")
      .optional(),
    description: z.string().optional(),
  })

  // Schema for updating BMHP Parameter
  readonly updateBmhpParameterSchema = z.object({
    program_plan_id: z.number().int().positive().optional(),
    name: z
      .string()
      .min(1, "Name is required")
      .max(100, "Name must be less than 100 characters")
      .refine(
        (value) => !/^\s+$/.test(value),
        "Name cannot be only whitespace"
      )
      .optional(),
    unit: z
      .string()
      .max(50, "Unit must be less than 50 characters")
      .optional(),
    description: z.string().optional(),
  })
}
