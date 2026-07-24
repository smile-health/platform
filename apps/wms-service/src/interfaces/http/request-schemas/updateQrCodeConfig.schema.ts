import { z } from 'zod';

export const updateQrCodeConfigSchemaBody = z.object({
    updatedBy: z
        .string({ message: 'updatedBy is required' })
        .min(1, { message: 'updatedBy is required' }),
    healthcareFacilityId: z
        .number({ message: 'healthcareFacilityId is required' })
        .int()
        .positive({ message: 'healthcareFacilityId must be a positive integer' }),
    wasteSourceId: z
        .number({ message: 'wasteSourceId is required' })
        .int()
        .positive({ message: 'wasteSourceId must be a positive integer' }),
    wasteClassificationId: z
        .number({ message: 'wasteClassificationId is required' })
        .int()
        .positive({ message: 'wasteClassificationId must be a positive integer' }),
    labelCount: z
        .number({ message: 'labelCount is required' })
        .int()
        .positive({ message: 'labelCount must be a positive integer' }),
});

export const updateQrCodeConfigSchema = z.object({
    body: updateQrCodeConfigSchemaBody,
    query: z.object({}).optional(),
    params: z.object({}).optional(),
});
