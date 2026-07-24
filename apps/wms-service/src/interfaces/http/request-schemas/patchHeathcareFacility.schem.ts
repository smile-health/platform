import { z } from 'zod';

const schemaPatch = z.object({
    isIotEnable: z.boolean({ message: 'is_iot_enable is required' }),
});

export const patchHealthcareFacilityAssetSchema = z.object({
    body: schemaPatch,
    query: z.object({}).optional(),
    params: z.object({}).optional(),
});
