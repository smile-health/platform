import { z } from 'zod';

const mobileDistanceLimitSchemaBody = z.object({
    id: z.number().int().positive({ message: 'Id must be a positive integer' }).optional(),
    latitude: z
        .number({ message: 'lattitude is required' })
        .min(-90, { message: 'lattitude must be between -90 and 90' })
        .max(90, { message: 'lattitude must be between -90 and 90' }),
    longitude: z
        .number({ message: 'longitude is required' })
        .min(-180, { message: 'longitude must be between -180 and 180' })
        .max(180, { message: 'longitude must be between -180 and 180' }),
});

export const mobileDistanceLimitSchema = z.object({
    body: mobileDistanceLimitSchemaBody,
    query: z.object({}).optional(),
    params: z.object({}).optional(),
});
