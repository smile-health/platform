import { z } from 'zod';

const validateSelectWastebagGroupBody = z.object({
    wasteGroupId: z.array(z.string().min(1, { message: 'wasteBagQrCodeId is required' })),
});

export const validateSelectWastebagGroup = z.object({
    body: validateSelectWastebagGroupBody,
    query: z.object({}).optional(),
    params: z.object({}).optional(),
});
