import { z } from 'zod';

const coldStoreWasteSchemaBody = z.object({
    wasteBagQrCodeIds: z.array(z.string().min(1, { message: 'wasteBagQrCodeId is required' })),
    endTime: z.coerce
        .date({
            required_error: 'endTime is required',
            invalid_type_error: 'endTime date format',
        })
        .optional(),
});

export const coldStoreWasteSchema = z.object({
    body: coldStoreWasteSchemaBody,
    query: z.object({}).optional(),
    params: z.object({}).optional(),
});
