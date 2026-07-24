import { z } from 'zod';

const updateEntitiesSchemaBody = z.object({
    nib: z.string().optional(),
    mobile_phone: z.string().optional(),
    head_name: z.string().optional(),
    email: z.string().optional(),
    gender: z
    .number({
      invalid_type_error: 'Gender must be a number (0 or 1)',
    })
    .refine((val) => val === 0 || val === 1, {
      message: 'Gender must be 0 or 1',
    })
    .optional(),
    total_bad_room: z.number().optional(),
    percentage_bad_room: z.number().optional(),
});

export const updateEntitiesSchema = z.object({
    body: updateEntitiesSchemaBody,
    query: z.object({}).optional(),
    params: z.object({}).optional(),
});
