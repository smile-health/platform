import { z } from 'zod';

const sterilisedWasteSchemaBody = z.object({
    wasteBagQrCodeIds: z.array(z.string().min(1, { message: 'wasteBagQrCodeId is required' })),
    treatmentStartTime: z.preprocess(
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
    treatmentEndTime: z.preprocess(
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
});

export const sterilisedWasteSchema = z.object({
    body: sterilisedWasteSchemaBody,
    query: z.object({}).optional(),
    params: z.object({}).optional(),
});
