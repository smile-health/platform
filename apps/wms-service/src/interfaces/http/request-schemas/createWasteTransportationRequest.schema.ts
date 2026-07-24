import { z } from 'zod';

export const createWasteTransportationRequestSchemaBody = z.object({
    createdBy: z.string().min(1, { message: 'createdBy is required' }),
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

export const createWasteTransportationRequestSchema = z.object({
    body: createWasteTransportationRequestSchemaBody,
    query: z.object({}).optional(),
    params: z.object({}).optional(),
});
