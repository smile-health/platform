import { z } from 'zod';

const updateStatusActiveEntitiesSchemaBody = z.object({
    is_active: z
        .union([z.boolean(), z.number().int().min(0).max(1)])
        .transform((val) => Boolean(val)),
});

export const updateStatusActiveEntitiesSchema = z.object({
    body: updateStatusActiveEntitiesSchemaBody,
    query: z.object({}).optional(),
    params: z.object({}).optional(),
});
