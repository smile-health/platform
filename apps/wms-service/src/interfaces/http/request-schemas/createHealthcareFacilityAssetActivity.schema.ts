import { z } from 'zod';

const createHealthcareFacilityAssetSchemaBody = z.object({
    createdBy: z.string().min(1).optional(),
    activityType: z.enum(['MAINTENANCE', 'CALIBRATION'], {
        message: `activityType must be one of 'MAINTENANCE',
                '   ',
                'CALIBRATION'.`,
    }),
    hfAssetId: z
        .number({
            required_error: 'hfAssetId is required',
            invalid_type_error: 'hfAssetId must be a number',
        })
        .int()
        .positive(),
    operatorId: z
        .string()
        .min(1, { message: 'operatorId is required' })
        .max(64, { message: 'operatorId max input 36 character' }),
    createdAt: z.string().date().min(1, { message: 'effectiveFrom is required' }),
    startDate: z.string().min(1, { message: 'effectiveFrom is required' }),
    endDate: z.string().min(1).optional(),
});

export const createHealthcareFacilityAssetActivitySchema = z.object({
    body: createHealthcareFacilityAssetSchemaBody,
    query: z.object({}).optional(),
    params: z.object({}).optional(),
});
