import { z } from 'zod';

export const createWasteTransportationGroupSchemaBody = z.object({
    createdBy: z.string().min(1, { message: 'createdBy is required' }),
    wasteBagIds: z
        .array(z.number().int().positive(), {
            message: 'wasteBagIds must be an array of positive integers',
        })
        .nonempty({ message: 'wasteBagIds is required and must not be empty' }),
    totalBagsCount: z
        .number({ message: 'totalBagsCount is required' })
        .int()
        .positive({ message: 'totalBagsCount must be a positive integer' }),
    totalWeightInKgs: z
        .number({ message: 'totalWeightInKgs is required' })
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

export const createWasteTransportationGroupSchema = z.object({
    body: createWasteTransportationGroupSchemaBody,
    query: z.object({}).optional(),
    params: z.object({}).optional(),
});
