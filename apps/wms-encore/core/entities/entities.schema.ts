import { z } from "zod";

// Mirrors request-schemas/updateEnitities.schema.ts's body schema.
export const updateEntitiesBodySchema = z.object({
  nib: z.string().optional(),
  mobile_phone: z.string().optional(),
  head_name: z.string().optional(),
  email: z.string().optional(),
  gender: z
    .number({ invalid_type_error: "Gender must be a number (0 or 1)" })
    .refine((val) => val === 0 || val === 1, { message: "Gender must be 0 or 1" })
    .optional(),
  total_bad_room: z.number().optional(),
  percentage_bad_room: z.number().optional(),
});

// Mirrors request-schemas/updateStatusActiveEntities.schema.ts's body schema.
export const updateStatusActiveEntitiesBodySchema = z.object({
  is_active: z
    .union([z.boolean(), z.number().int().min(0).max(1)])
    .transform((val) => Boolean(val)),
});
