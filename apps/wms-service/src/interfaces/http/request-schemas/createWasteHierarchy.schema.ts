import { z } from 'zod';

export const createWasteHierarchySchemaBody = z.object({
    createdBy: z.string().min(1, { message: 'createdBy is required' }),
    regionId: z
        .number()
        .int()
        .positive({ message: 'regionId must be a positive integer' })
        .optional(),
    parentHierarchyId: z
        .number()
        .int()
        .positive({ message: 'parent_hierarchy_id must be a positive integer' })
        .nullable()
        .optional(),
    name: z.string({ message: 'name is required' }).min(1, { message: 'name is required' }).max(36, { message: 'maximum length exceeded 36 character'}),
    nameEn: z.string({ message: 'name in english is required' }).min(1, { message: 'name in english is required' }).max(36, { message: 'maximum length exceeded 36 character'}),
    description: z.string({ message: 'description is required' }),
    descriptionEn: z.string({ message: 'description is required' }).optional(),
    level: z.number().int().min(0).max(2).optional().default(0),
    isResidue: z.boolean().optional(),
    isActive: z.boolean().optional(),
});

export const createWasteHierarchySchema = z.object({
    body: createWasteHierarchySchemaBody,
    query: z.object({}).optional(),
    params: z.object({}).optional(),
});
