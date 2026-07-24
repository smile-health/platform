import { z } from 'zod';

const followUpTransportWasteSchemaBody = z.object({
    wasteBagQrCodeIds: z.array(z.string().min(1, { message: 'wasteBagQrCodeId is required' })),
    handoverLattitude: z.number({ message: 'handoverLattitude is required' }).optional(),
    handoverLongitude: z.number({ message: 'handoverLongitude is required' }).optional(),
    providerType: z.string({
        message: 'providerType is required',
    }),
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
    treatmentProviderId: z
        .number({ message: 'treatmentProviderId is required' })
        .int()
        .positive({ message: 'treatmentProviderId must be a positive integer' })
        .optional(),
    treatmentOperatorId: z.string({ message: 'treatmentOperatorId is required' }).optional(),
    isReadOnly: z.boolean({ message: 'hasIncinerator is required' }).default(false),
});

export const followUpTransportWasteSchema = z.object({
    body: followUpTransportWasteSchemaBody,
    query: z.object({}).optional(),
    params: z.object({}).optional(),
});
