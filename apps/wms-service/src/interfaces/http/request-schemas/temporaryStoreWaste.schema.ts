import { z } from 'zod';

const temporaryStoreWasteSchemaBody = z.object({
    wasteBagQrCodeIds: z.array(z.string().min(1, { message: 'wasteBagQrCodeId is required' })),
});

export const temporaryStoreWasteSchema = z.object({
    body: temporaryStoreWasteSchemaBody,
    query: z.object({}).optional(),
    params: z.object({}).optional(),
});
