import { z } from 'zod';

export const createPartnerVehicleSchemaBody = z.object({
    createdBy: z
        .string({ message: 'createdBy is required' })
        .min(1, { message: 'createdBy is required' }),
    vehicleType: z.enum(
        [
            'BOX_TRUCK',
            'REFRIGERATED_BOX_TRUCK',
            'OPEN_BODY_TRUCK',
            'TANKER',
            'HAZARDOUS_MATERIAL_TRUCK',
            'RADIOACTIVE_MATERIAL_TRUCK',
            'FLATBED_TRUCK',
            'LOADER_TRUCK',
            'TRAILER',
            'VAN',
        ],
        {
            required_error: 'vehicleType is required',
            invalid_type_error: `vehicleType must be either 'BOX_TRUCK',
                'REFRIGERATED_BOX_TRUCK',
                'OPEN_BODY_TRUCK',
                'TANKER',
                'HAZARDOUS_MATERIAL_TRUCK',
                'RADIOACTIVE_MATERIAL_TRUCK',
                'FLATBED_TRUCK',
                'LOADER_TRUCK',
                'TRAILER',
                'VAN',`,
        },
    ),
    vehicleNumber: z.string({ message: 'vehicleNumber is required' }).min(1, {
        message: 'vehicleNumber is required',
    }),
    capacityInKgs: z.number({ message: 'capacityInKgs is required' }).int().positive({
        message: 'capacityInKgs must be a positive integer',
    }),
    entityId: z.number({ message: 'entityId is required' }).int().positive(),
});

export const createPartnerVehicleSchema = z.object({
    body: createPartnerVehicleSchemaBody,
    query: z.object({}).optional(),
    params: z.object({}).optional(),
});
