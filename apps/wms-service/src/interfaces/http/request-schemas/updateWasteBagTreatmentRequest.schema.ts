import { z } from 'zod';

export const updateWasteBagTreatmentRequestSchemaBody = z.object({
    updatedBy: z
        .string({ message: 'updatedBy is required' })
        .min(1, { message: 'updatedBy is required' }),
    requestStatus: z.enum(['PENDING', 'ACCEPTED', 'REJECTED'], {
        message: 'scaleMethod must be either PENDING OR ACCEPTED OR REJECTED',
    }),
    treatmentGroupId: z
        .number()
        .int()
        .positive({ message: 'treatmentGroupId must be a positive integer' }),
    requestCreatorId: z
        .number()
        .int()
        .positive({ message: 'requestCreatorId must be a positive integer' })
        .optional(),
    requestApproverId: z
        .number()
        .int()
        .positive({ message: 'requestApproverId must be a positive integer' })
        .optional(),
});

export const updateWasteBagTreatmentRequestSchema = z.object({
    body: updateWasteBagTreatmentRequestSchemaBody,
    query: z.object({}).optional(),
    params: z.object({}).optional(),
});
