import { z } from 'zod';

const mobileWastePostTreatmentSchemaBody = z.object({
    wasteBagQrCodeIds: z.array(z.string().min(1, { message: 'wasteBagQrCodeId is required' })),
    actionType: z.enum(['DISINFECTION', 'PYROLYSIS', 'LANDFILLED', 'RECYCLED', 'DISPOSED'], {
        message:
            'actionType must be one of the valid post treatment actions DISINFECTION, PYROLYSIS, LANDFILLED, RECYCLED, DISPOSED',
    }),
    healthcareFacilityId: z.number({ message: 'healthcareFacilityId is required' }).int().positive(),
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
});

export const mobileWastePostTreatmentSchema = z.object({
    body: mobileWastePostTreatmentSchemaBody,
    query: z.object({}).optional(),
    params: z.object({}).optional(),
});
