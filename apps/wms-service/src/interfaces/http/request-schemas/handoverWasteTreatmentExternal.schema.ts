import { z } from 'zod';

const handoverTransportExternalWasteSchemaBody = z.object({
    wasteBagQrCodeIds: z
        .array(z.string().min(1, { message: 'wasteBagQrCodeId is required' }))
        .optional(),
    wasteTransportationGroupId: z
        .number()
        .min(1, { message: 'wasteBagQrCodeId is required' })
        .optional(),
    wasteTransportationExternalGroupIds: z
        .array(z.number().min(1, { message: 'wasteBagQrCodeId is required' }).optional())
        .optional(),
    healthcareFacilityId: z.number().min(1, { message: 'wasteBagQrCodeId is required' }).optional(),
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
    treatmentId: z.number({ message: 'treatment id is required' }).optional(),
    entityId: z.number({ message: 'entityId id is required' }).optional(),
    treatmentLocationId: z.number({ message: 'treatmentLocationId id is required' }).optional(),
    isReadOnly: z
        .boolean({ message: 'isReadOnly must be a valid boolean' })
        .default(false)
        .optional(),
});

export const handoverTransportExternalWasteSchema = z.object({
    body: handoverTransportExternalWasteSchemaBody,
    query: z.object({}).optional(),
    params: z.object({}).optional(),
});
