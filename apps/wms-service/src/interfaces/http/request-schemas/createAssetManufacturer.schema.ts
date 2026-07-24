import { z } from 'zod';

const createAssetManufacturerSchemaBody = z.object({
    createdBy: z.string().min(1, { message: 'createdBy is required' }),
    name: z.string().min(1, { message: 'name is required' }),
    description: z.string().max(255).optional(),
});

export const createAssetManufacturerSchema = z.object({
    body: createAssetManufacturerSchemaBody,
    query: z.object({}).optional(),
    params: z.object({}).optional(),
});
