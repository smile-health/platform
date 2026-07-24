import { z } from 'zod';

export const createManualScaleRequestSchemaBody = z.object({
    requestedBy: z.string().optional(),
    processedBy: z.string().optional(),
    isActive: z.boolean().default(false),
    status: z
        .enum(['PENDING', 'APPROVED', 'REJECTED'], {
            message: "status must be one of 'PENDING', 'APPROVED', or 'REJECTED'",
        })
        .default('PENDING'),
    approvalType: z.enum(['TIME_BOUND', 'COUNT_BASED'], {
        message: "approvalType is required and must be one of 'TIME_BOUND' or 'COUNT_BASED'",
    }),
    validUntil: z.coerce
        .date({
            required_error: 'validUntil Date is required',
            invalid_type_error: 'Invalid end date format',
        })
        .optional(),
    countLimit: z
        .number()
        .int()
        .positive({ message: 'countLimit must be a positive integer' })
        .optional(),
});

export const createManualScaleRequestSchema = z.object({
    body: createManualScaleRequestSchemaBody,
    query: z.object({}).optional(),
    params: z.object({}).optional(),
});
