import { z } from 'zod';

const pickUprTransportWasteSchemaBody = z.object({
    wasteTransportationGroupId: z
        .number()
        .min(1, { message: 'wasteBagQrCodeId is required' })
        .optional(),
    wasteTransportationExternalGroupId: z
        .number()
        .min(1, { message: 'wasteBagQrCodeId is required' })
        .optional(),
    wasteTransportationExternalGroupIds: z
        .array(z.number().min(1, { message: 'wasteBagQrCodeId is required' }).optional())
        .optional(),
    healthcareFacilityId: z.number().min(1, { message: 'healthcareFacilityId is required' }).optional(),
    transporterId: z.number().min(1, { message: 'wasteBagQrCodeId is required' }).optional(),
    handoverLattitude: z.number({ message: 'handoverLattitude must be a number' }).optional(),
    handoverLongitude: z.number({ message: 'handoverLongitude must be a number' }).optional(),
    transporterVehicleId: z
        .number({ message: 'transporterVehicleId is required' })
        .int()
        .positive({ message: 'transporterVehicleId must be a positive integer' })
        .optional(),
    transporterOperatorId: z.string({ message: 'transporterOperatorId is required' }).optional(),
    startTime: z.preprocess(
        (val) => {
            if (typeof val === 'string' || typeof val === 'number') {
                const date = new Date(val);
                return isNaN(date.getTime()) ? undefined : date;
            }
            return val;
        },
        z.date({
            message: 'treatmentStartTime must be a valid date',
        }),
    ),
    endTime: z.preprocess(
        (val) => {
            if (typeof val === 'string' || typeof val === 'number') {
                const date = new Date(val);
                return isNaN(date.getTime()) ? undefined : date;
            }
            return val;
        },
        z.date({
            message: 'treatmentEndTime must be a valid date',
        }),
    ),
    wasteBagQrCodeIds: z
        .array(z.string({ message: 'wasteBagQrCodeIds is required' }).optional())
        .optional(),
    isReadOnly: z
        .boolean({ message: 'isReadOnly must be a valid boolean' })
        .default(false)
        .optional(),
});

export const pickUprTransportWasteSchema = z.object({
    body: pickUprTransportWasteSchemaBody,
    query: z.object({}).optional(),
    params: z.object({}).optional(),
});
