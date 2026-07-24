import { z } from 'zod';

const enterWeightSchemaBody = z.object({
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
    scaleMethod: z.enum(['internet', 'bluetooth', 'manual'], {
        message: 'scaleMethod must be either internet, bluetooth or manual',
    }),
    weight: z
        .number({ invalid_type_error: 'weightInKgs must be a number' })
        .nonnegative({ message: 'weightInKgs must be 0 or a positive number' }),
    sourceTreatmentGroupId: z
        .string()
        .min(1, { message: 'sourceTreatmentGroupId is required' })
        .optional(),
    qrCode: z.string().min(1, { message: 'wasteBagQrCodeId is required' }),
    binNumber: z.string().optional(),
    iotMethod: z.enum(['BLUETOOTH', 'INTERNET']).optional(),
    wasteGroupIds: z.string().optional(),
    sourceTreatmentGroupIds: z.string().optional(),
    isTreated: z.boolean().optional(),
    isRadioActive: z.boolean().optional(),
    assetId: z.number().optional(),
    bastNo: z.string().optional(),
    materialIds: z.string().max(64, { message: 'materialIds max input 64 character' }).optional(),
});

export const enterWeightSchema = z.object({
    body: enterWeightSchemaBody,
    query: z.object({}).optional(),
    params: z.object({}).optional(),
});
