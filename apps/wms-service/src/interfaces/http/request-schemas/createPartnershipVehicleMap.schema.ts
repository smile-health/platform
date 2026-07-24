import { z } from 'zod';

export const createPartnershipVehicleMapSchemaBody = z.object({
    partnershipId: z
        .number({ message: 'partnershipId is required' })
        .int()
        .positive({ message: 'partnershipId must be a positive integer' }),
    vehicleId: z
        .number({ message: 'vehicleId is required' })
        .int()
        .positive({ message: 'vehicleId must be a positive integer' }),
});

export const createPartnershipVehicleMapSchema = z.object({
    body: createPartnershipVehicleMapSchemaBody,
    query: z.object({}).optional(),
    params: z.object({}).optional(),
});
