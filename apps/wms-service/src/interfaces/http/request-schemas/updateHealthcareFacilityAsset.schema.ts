import { z } from 'zod';

const schemaUpdate = z.object({
    updatedBy: z.string().min(1, { message: 'updatedBy is required' }),
    assetStatus: z.enum(
        ['OPERATIONAL', 'UNDER_MAINTAINENCE', 'OUT_OF_SERVICE', 'IDLE', 'RETIRED'],
        {
            message: `asset_status must be one of 'OPERATIONAL',
                '   ',
                'OUT_OF_SERVICE',
                'IDLE',
                'RETIRED'.`,
        },
    ),
    assetId: z
        .string({ message: 'asset_id must be a positive integer' })
        .min(3, { message: 'asset_id must be at least 3 characters long' }),
    modelId: z.number().int().positive({ message: 'model_id must be a positive integer' }),
    healthcareFacilityId: z
        .number({ message: 'Heathcare facility id is required' })
        .int()
        .positive({ message: 'healthcare_facility_id must be a positive integer' })
        .optional(),
    isIotEnable: z
        .union([z.boolean(), z.number().int().min(0).max(1)])
        .transform((val) => Boolean(val)),
    warrantyStartDate: z.string().date().min(1).optional(),
    warrantyEndDate: z.string().date().min(1).optional(),
    yearOfProduction: z
        .number()
        .int()
        .min(1000, { message: 'yearOfProduction must be a 4-digit year' })
        .max(9999, { message: 'yearOfProduction must be a 4-digit year' })
        .positive({ message: 'yearOfProduction must be a positive integer' })
        .optional(),
});

export const updateHealthcareFacilityAssetSchema = z.object({
    body: schemaUpdate,
    query: z.object({}).optional(),
    params: z.object({}).optional(),
});
