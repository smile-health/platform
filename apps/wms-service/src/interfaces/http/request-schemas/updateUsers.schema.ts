import { z } from 'zod';

const updateUsersSchemaBody = z.object({
    is_active: z
        .union([z.boolean(), z.number().int().min(0).max(1)])
        .transform((val) => Boolean(val)),
});

export const updateUsersSchema = z.object({
    body: updateUsersSchemaBody,
    query: z.object({}).optional(),
    params: z.object({}).optional(),
});
