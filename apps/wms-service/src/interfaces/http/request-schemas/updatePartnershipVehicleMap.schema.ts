import { z } from 'zod';

export const updatePartnershipVehicleMapSchemaBody = z.object({
    partnershipId: z
        .number({ message: 'partnershipId is required' })
        .int()
        .positive({ message: 'partnershipId must be a positive integer' }),
    vehicleId: z
        .number({ message: 'vehicleId is required' })
        .int()
        .positive({ message: 'vehicleId must be a positive integer' }),
});

export const updatePartnershipVehicleMapSchema = z.object({
    body: updatePartnershipVehicleMapSchemaBody,
    query: z.object({}).optional(),
    params: z.object({}).optional(),
});
