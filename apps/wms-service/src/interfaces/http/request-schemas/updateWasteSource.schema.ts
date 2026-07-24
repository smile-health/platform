import { z } from 'zod';

export const updateWasteSourceSchemaBody = z.object({
    updatedBy: z
        .string({ message: 'updatedBy is required' })
        .min(1, { message: 'updatedBy is required' }),
    healthcareFacilityId: z
        .number({ message: 'healthcareFacilityId is required' })
        .int()
        .positive({ message: 'healthcareFacilityId must be a positive integer' })
        .optional(),
    sourceType: z.enum(['INTERNAL', 'EXTERNAL', 'INTERNAL_TREATMENT'], {
        message: `providerType must be one of 'INTERNAL' , 'EXTERNAL' , 'INTERNAL_TREATMENT'`,
    }),
    internalSourceName: z.string({ message: 'internalSourceName is required' }).optional(),
    internalTreatmentName: z
        .enum(['PYROLYSIS', 'DISINFECTION'], {
            message: `providerType must be one of 'PYROLYSIS' , 'DISINFECTION'`,
        })
        .optional(),
    externalHealthcareFacilityId: z
        .number({ message: 'externalHealthcareFacilityId is required' })
        .int()
        .positive({ message: 'externalHealthcareFacilityId must be a positive integer' })
        .optional(),
    externalHealthcareFacilityName: z
        .string({ message: 'externalHealthcareFacilityName is required' })
        .optional(),
    isActive: z.boolean().optional().default(false),
});

export const updateWasteSourceSchema = z.object({
    body: updateWasteSourceSchemaBody,
    query: z.object({}).optional(),
    params: z.object({}).optional(),
});
