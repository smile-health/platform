import { z } from 'zod';

const updateDisposedBastSchemaBody = z.object({
    bastNo: z
        .string({ message: 'BAST number is required' })
        .min(1, { message: 'BAST number cannot be empty' }),
    status: z.enum(['APPROVED', 'REJECTED'], {
        message: 'Only APPROVED and REJECTED can accept in status',
    }),
    reason: z.string().optional(),
});

export const updateDisposedBastSchema = z.object({
    body: updateDisposedBastSchemaBody,
    query: z.object({}).optional(),
    params: z.object({}).optional(),
});
