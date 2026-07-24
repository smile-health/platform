import { z } from 'zod';

export const updateWasteHierarchySchemaBody = z.object({
    parentHierarchyId: z
        .number()
        .int()
        .positive({ message: 'parent_hierarchy_id must be a positive integer' })
        .nullable()
        .optional(),
    name: z.string({ message: 'name is required' }).min(1, { message: 'name is required' }),
    nameEn: z.string({ message: 'name is required' }).min(1, { message: 'name is required' }),
    description: z.string().optional(),
    descriptionEn: z.string().optional(),
    isResidue: z.boolean().optional(),
    isActive: z.boolean().optional(),
});

export const updateWasteHierarchySchema = z.object({
    body: updateWasteHierarchySchemaBody,
    query: z.object({}).optional(),
    params: z.object({}).optional(),
});
