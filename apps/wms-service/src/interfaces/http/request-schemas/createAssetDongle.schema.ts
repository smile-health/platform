import { z } from 'zod';

const createAssetDongleSchemaBody = z.object({
    assetId: z.string().min(1, { message: 'assetId is required' }),
});

export const createAssetDongleSchema = z.object({
    body: createAssetDongleSchemaBody,
    query: z.object({}).optional(),
    params: z.object({}).optional(),
});
