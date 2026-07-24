import { z } from 'zod';

export const updateWasteTransportationRequestSchemaBody = z.object({
    updatedBy: z.string().min(1, { message: 'updatedBy is required' }),
    requestStatus: z
        .enum(['PENDING', 'ACCEPTED', 'REJECTED'], {
            message: 'requestStatus must be one of PENDING, ACCEPTED, or REJECTED',
        })
        .optional(),
    transportationGroupId: z
        .number({
            message: 'transportationGroupId is required',
        })
        .int()
        .positive({
            message: 'transportationGroupId must be a positive integer',
        }),
    requestCreatorId: z
        .number({
            message: 'requestCreatorId is required',
        })
        .int()
        .positive({
            message: 'requestCreatorId must be a positive integer',
        })
        .optional(),
    requestApproverId: z
        .number({
            message: 'requestApproverId is required',
        })
        .int()
        .positive({
            message: 'requestApproverId must be a positive integer',
        })
        .optional(),
});

export const updateWasteTransportationRequestSchema = z.object({
    body: updateWasteTransportationRequestSchemaBody,
    query: z.object({}).optional(),
    params: z.object({}).optional(),
});
