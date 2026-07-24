import { z } from 'zod';

export const createWasteBagQrCodeSchemaBody = z.object({
    healthcareFacilityId: z
        .number()
        .int()
        .positive({ message: 'healthcareFacilityId must be a positive integer' })
        .optional(),
    wasteSourceId: z
        .number()
        .int()
        .positive({ message: 'wasteSourceId must be a positive integer' })
        .optional(),
    wasteClassificationId: z
        .number()
        .int()
        .positive({ message: 'wasteClassificationId must be a positive integer' })
        .optional(),
    labelCount: z
        .number({ message: 'labelCount is required' })
        .int()
        .positive({ message: 'labelCount must be a positive integer' }),
});

export const createWasteBagQrCodeSchema = z.object({
    body: z.array(createWasteBagQrCodeSchemaBody),
    query: z.object({}).optional(),
    params: z.object({}).optional(),
});
