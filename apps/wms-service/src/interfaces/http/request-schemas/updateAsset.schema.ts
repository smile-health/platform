import { z } from 'zod';

const updateAssetSchemaBody = z.object({
    updatedBy: z.string().min(1, { message: 'updatedBy is required' }),
    assetType: z.enum(['SCALE', 'INCINERATOR', 'AUTOCLAVE', 'COLD_STORAGE'], {
        message: 'assetType must be one of SCALE, INCINERATOR, AUTOCLAVE, or COLD_STORAGE',
    }),
    manufacturerId: z
        .number()
        .int()
        .positive({ message: 'manufacturerId must be a positive integer' }),
    name: z.string().min(1, { message: 'name is required' }),
    description: z.string().max(255).optional(),
});

export const updateAssetSchema = z.object({
    body: updateAssetSchemaBody,
    query: z.object({}).optional(),
    params: z.object({}).optional(),
});
