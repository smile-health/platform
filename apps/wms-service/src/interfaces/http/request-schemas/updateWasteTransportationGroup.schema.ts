import { z } from 'zod';

export const updateWasteTransportationGroupSchemaBody = z.object({
    updatedBy: z.string().min(1, { message: 'updatedBy is required' }),
    totalBagsCount: z
        .number({ message: 'totalBagsCount is required' })
        .int()
        .positive({ message: 'totalBagsCount must be a positive integer' }),
    totalWeightInKgs: z
        .number({ message: 'totalWeightInKgs is required' })
        .int()
        .positive({ message: 'totalWeightInKgs must be a positive integer' }),
    transporterVehicleId: z
        .number({ message: 'transporterVehicleId is required' })
        .int()
        .positive({ message: 'transporterVehicleId must be a positive integer' })
        .optional(),
    transporterOperatorId: z
        .number({ message: 'transporterOperatorId is required' })
        .int()
        .positive({ message: 'transporterOperatorId must be a positive integer' })
        .optional(),
    handoverLattitude: z.number({ message: 'handoverLattitude is required' }).optional(),
    handoverLongitude: z.number({ message: 'handoverLongitude is required' }).optional(),
    transportationStatus: z.enum(
        [
            'GENERATED',
            'CLASSIFIED',
            'SCALED',
            'STORED_FOR_TREATMENT',
            'STORED_FOR_TRANSPORT',
            'TREATED',
            'RESIDUE_CLASSIFIED',
            'RESIDUE_SCALED',
            'RESIDUE_STORED_FOR_TRANSPORT',
            'IN_TRANSIT',
            'DISPOSED',
        ],
        {
            message:
                "transportationStatus must be one of 'GENERATED', 'CLASSIFIED','SCALED', 'STORED_FOR_TREATMENT', 'STORED_FOR_TRANSPORT','TREATED', 'RESIDUE_CLASSIFIED', 'RESIDUE_SCALED', 'RESIDUE_STORED_FOR_TRANSPORT', 'IN_TRANSIT','DISPOSED'",
        },
    ),
});

export const updateWasteTransportationGroupSchema = z.object({
    body: updateWasteTransportationGroupSchemaBody,
    query: z.object({}).optional(),
    params: z.object({}).optional(),
});
