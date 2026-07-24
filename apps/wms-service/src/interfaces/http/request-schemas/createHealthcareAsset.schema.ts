import { z } from 'zod';

const createHealthcareAssetSchemaBody = z.object({
    id: z.number().min(1, { message: 'id is required' }),
    assetId: z
        .string({ message: 'asset_id must be a positive integer' })
        .min(3, { message: 'asset_id must be at least 3 characters long' })
        .optional(),
    healthcareFacilityId: z
        .number({ message: 'Heathcare facility id is required' })
        .int()
        .positive({ message: 'entity_id must be a positive integer' }),
    assetTypeName: z.string(),
    assetWorkingStatusName: z.string(),
    createdAt: z.string().transform((val) => new Date(val)),
    updatedAt: z.string().transform((val) => new Date(val)),
});

export const createHealthcareAssetSchema = z.object({
    body: createHealthcareAssetSchemaBody,
    query: z.object({}).optional(),
    params: z.object({}).optional(),
});
