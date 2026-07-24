import { z } from "zod"

export class BmhpTargetGroupMiddleware {
  // Schema for creating BMHP Target Group
  readonly createBmhpTargetGroupSchema = z.object({
    code: z
      .string()
      .max(50, "Code must be less than 50 characters")
      .refine(
        (value) => !value || !/^\s+$/.test(value),
        "Code cannot be only whitespace"
      )
      .optional(),
    name: z
      .string()
      .min(1, "Name is required")
      .max(100, "Name must be less than 100 characters")
      .refine(
        (value) => !/^\s+$/.test(value),
        "Name cannot be only whitespace"
      ),
    age_range: z
      .string()
      .max(50, "Age range must be less than 50 characters")
      .optional(),
    description: z.string().optional(),
    is_active: z.boolean().optional().default(true),
  })

  // Schema for updating BMHP Target Group
  readonly updateBmhpTargetGroupSchema = z.object({
    code: z
      .string()
      .max(50, "Code must be less than 50 characters")
      .refine(
        (value) => !value || !/^\s+$/.test(value),
        "Code cannot be only whitespace"
      )
      .optional(),
    name: z
      .string()
      .min(1, "Name is required")
      .max(100, "Name must be less than 100 characters")
      .refine(
        (value) => !/^\s+$/.test(value),
        "Name cannot be only whitespace"
      )
      .optional(),
    age_range: z
      .string()
      .max(50, "Age range must be less than 50 characters")
      .optional(),
    description: z.string().optional(),
    is_active: z.boolean().optional(),
  })
}
