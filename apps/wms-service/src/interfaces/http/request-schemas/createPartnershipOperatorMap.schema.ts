import { z } from 'zod';

export const createPartnershipOperatorMapSchemaBody = z.object({
    partnershipId: z
        .number({ message: 'partnershipId is required' })
        .int()
        .positive({ message: 'partnershipId must be a positive integer' }),
    operatorId: z.string({ message: 'operatorId is required' }).max(36),
});

export const createPartnershipOperatorMapSchema = z.object({
    body: createPartnershipOperatorMapSchemaBody,
    query: z.object({}).optional(),
    params: z.object({}).optional(),
});
