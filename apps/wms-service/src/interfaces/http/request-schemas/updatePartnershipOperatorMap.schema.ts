import { z } from 'zod';

export const updatePartnershipOperatorMapSchemaBody = z.object({
    partnershipId: z
        .number({ message: 'partnershipId is required' })
        .int()
        .positive({ message: 'partnershipId must be a positive integer' }),
    operatorId: z.string({ message: 'operatorId is required' }).max(36),
});

export const updatePartnershipOperatorMapSchema = z.object({
    body: updatePartnershipOperatorMapSchemaBody,
    query: z.object({}).optional(),
    params: z.object({}).optional(),
});
