import { z } from "zod";

// Mirrors createWasteHierarchy.schema.ts. The original also requires
// `createdBy` in the body; per this port's convention (same as every other
// module) createdBy comes from the authenticated user instead, so it is not
// re-validated as a body field here.
export const createWasteHierarchyBodySchema = z.object({
  regionId: z.int().positive({
      error: "regionId must be a positive integer"
}).optional(),
  parentHierarchyId: z.int()
    .positive({
        error: "parent_hierarchy_id must be a positive integer"
    })
    .nullable()
    .optional(),
  name: z.string().min(1, {
      error: "name is required"
}).max(36, {
    error: "maximum length exceeded 36 character"
}),
  nameEn: z
    .string()
    .min(1, {
        error: "name in english is required"
    })
    .max(36, {
        error: "maximum length exceeded 36 character"
    }),
  description: z.string({
      error: "description is required"
}),
  descriptionEn: z.string().optional(),
  level: z.int().min(0).max(2).optional().default(0),
  isResidue: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

// Mirrors updateWasteHierarchy.schema.ts.
export const updateWasteHierarchyBodySchema = z.object({
  parentHierarchyId: z.int()
    .positive({
        error: "parent_hierarchy_id must be a positive integer"
    })
    .nullable()
    .optional(),
  name: z.string().min(1, {
      error: "name is required"
}),
  nameEn: z.string().min(1, {
      error: "name is required"
}),
  description: z.string().optional(),
  descriptionEn: z.string().optional(),
  isResidue: z.boolean().optional(),
  isActive: z.boolean().optional(),
});
