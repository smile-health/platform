import { z } from 'zod';

export const updateWasteBagQrCodeSchemaBody = z.object({
    updatedBy: z
        .string({ message: 'updatedBy is required' })
        .min(1, { message: 'updatedBy is required' }),
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
    qrCode: z
        .string()
        .min(1, { message: 'qrCode is required' })
        .max(255, { message: 'qrCode max input 255 character' }),
});

export const updateWasteBagQrCodeSchema = z.object({
    body: updateWasteBagQrCodeSchemaBody,
    query: z.object({}).optional(),
    params: z.object({}).optional(),
});
