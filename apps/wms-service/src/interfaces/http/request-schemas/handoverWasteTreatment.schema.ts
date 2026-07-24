import { z } from 'zod';

const handoverTreatmentWasteSchemaBody = z.object({
    wasteBagQrCodeId: z
        .string({ message: 'wasteBagQrCodeIds must be an array of strings' })
        .optional(),
    wasteBagQrCodeIds: z.array(z.string().min(1, { message: 'wasteBagQrCodeId is required' })),
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
                message: 'treatmentStartTime must be a valid date',
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
                message: 'treatmentEndTime must be a valid date',
            }),
        )
        .optional(),
});

export const handoverTreatmentWasteSchema = z.object({
    body: handoverTreatmentWasteSchemaBody,
    query: z.object({}).optional(),
    params: z.object({}).optional(),
});
