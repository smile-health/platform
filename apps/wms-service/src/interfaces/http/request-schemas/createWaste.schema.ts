import { z } from 'zod';

const createWasteSchemaBody = z.object({
    healthcareFacilityId: z
        .number()
        .int()
        .positive({ message: 'healthcareFacilityId must be a positive integer' })
        .optional(),
    wasteSourceId: z
        .number()
        .int()
        .positive({ message: 'wasteSourceId must be a positive integer' }),
    wasteClassificationId: z
        .number()
        .int()
        .positive({ message: 'wasteClassificationId must be a positive integer' }),
    scaleMethod: z.enum(['MANUAL', 'IOT'], { message: 'scaleMethod must be either MANUAL or IOT' }),
    weightInKgs: z
        .number({ invalid_type_error: 'weightInKgs must be a number' })
        .positive({ message: 'wasteInKgs must be a positive number' }),
    sourceTreatmentGroupId: z
        .string()
        .min(1, { message: 'sourceTreatmentGroupId is required' })
        .optional(),
    wasteBagQrCodeId: z.string().min(1, { message: 'wasteBagQrCodeId is required' }),
    binNumber: z.string().optional(),
    iotMethod: z.enum(['BLUETOOTH', 'INTERNET']).optional(),
    wasteGroupIds: z.string().optional(),
    isTreated: z.boolean().optional(),
    bastNo: z.string().optional(),
    materialIds: z.string().max(64, { message: 'materialIds max input 64 character' }).optional(),
});

export const createWasteSchema = z.object({
    body: createWasteSchemaBody,
    query: z.object({}).optional(),
    params: z.object({}).optional(),
});
