import { z } from 'zod';

const mobileWasteFollowUpSchemaBody = z.object({
    wasteBagQrCodeIds: z.array(z.string().min(1, { message: 'wasteBagQrCodeId is required' })),
    actionType: z.enum(
        [
            'TEMPORARY_STORAGE',
            'COLD_STORAGE',
            'DISINFECTION',
            'PYROLYSIS',
            'INTERNAL_LANDFILLER',
            'TRANSPORTER_LANDFILL',
            'TRANSPORTER_RECYCLER',
            'TRANSPORTER_TREATMENT',
            'SPECIALIZED_TREATMENT_PROVIDER',
            'TRANSPORTER_GOVERNMENT',
            'TRANSPORTER_GOVERNMENT_WASTE_BANK'
        ],
        {
            message:
                'actionType must be one of the valid follow-up actions TEMPORARY_STORAGE, COLD_STORAGE, DISINFECTION, PYROLYSIS, INTERNAL_LANDFILLER, TRANSPORTER_LANDFILL, TRANSPORTER_RECYCLER, TRANSPORTER_TREATMENT, SPECIALIZED_TREATMENT_PROVIDER, TRANSPORTER_GOVERNMENT, TRANSPORTER_GOVERNMENT_WASTE_BANK',
        },
    ),
    startTime: z
        .preprocess(
            (val) => {
                if (typeof val === 'string' || typeof val === 'number') {
                    const date = new Date(val);
                    return isNaN(date.getTime()) ? undefined : date;
                }
                return val;
            },
            z.date({
                message: 'startTime must be a valid date',
            }),
        )
        .optional(),
    endTime: z
        .preprocess(
            (val) => {
                if (typeof val === 'string' || typeof val === 'number') {
                    const date = new Date(val);
                    return isNaN(date.getTime()) ? undefined : date;
                }
                return val;
            },
            z.date({
                message: 'endTime must be a valid date',
            }),
        )
        .optional(),
    transporterVehicleId: z
        .number({ message: 'transporterVehicleId is required' })
        .int()
        .positive({ message: 'transporterVehicleId must be a positive integer' })
        .optional(),
    transporterId: z
        .number({ message: 'transporterId is required' })
        .int()
        .positive({ message: 'transporterId must be a positive integer' })
        .optional(),
    thirdPartyId: z
        .number({ message: 'thirdPartyId is required' })
        .int()
        .positive({ message: 'thirdPartyId must be a positive integer' })
        .optional(),

});

export const mobileWasteFollowUpSchema = z.object({
    body: mobileWasteFollowUpSchemaBody,
    query: z.object({}).optional(),
    params: z.object({}).optional(),
});
