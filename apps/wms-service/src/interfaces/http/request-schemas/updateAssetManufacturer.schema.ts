import { z } from 'zod';

const updateAssetManufacturerSchemaBody = z.object({
    updatedBy: z.string().min(1, { message: 'updatedBy is required' }),
    name: z.string({ message: 'name is required' }).min(1, { message: 'name is required' }),
    description: z.string().max(255, { message: 'Description to loong, max 255' }).optional(),
});

export const updateAssetManufacturerSchema = z.object({
    body: updateAssetManufacturerSchemaBody,
    query: z.object({}).optional(),
    params: z.object({}).optional(),
});
