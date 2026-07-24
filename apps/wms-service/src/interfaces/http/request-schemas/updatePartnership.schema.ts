import { z } from 'zod';

const updatePartnershipSchemaBody = z.object({
    updatedBy: z
        .string({ message: 'updatedBy is required' })
        .min(1, { message: 'updatedBy is required' }),
    contractStartDate: z.coerce
        .date({
            required_error: 'Contract Start Date is required',
            invalid_type_error: 'Invalid start date format',
        })
        .optional(),
    contractEndDate: z.coerce
        .date({
            required_error: 'Contract End Date is required',
            invalid_type_error: 'Invalid end date format',
        })
        .optional(),
    contractId: z.string().min(1).optional(),
    partnershipStatus: z.enum(['PENDING', 'ACTIVE', 'SUSPENDED', 'TERMINATED', 'EXPIRED'], {
        message: `partnershipStatus must be one of 'PENDING','ACTIVE','SUSPENDED','TERMINATED','EXPIRED'`,
    }),
    providerType: z.enum(
        [
            'LANDFILLER',
            'TREATMENT_PROVIDER',
            'RECYCLER',
            'TREATMENT',
            'SPECIALIZED_TREATMENT_PROVIDER',
            'TRANSPORTER',
            'TRANSPORTER_RECYCLER',
            'TRANSPORTER_SPECIALIZED_TREATMENT_PROVIDER',
            'TRANSPORTER_LANDFILL',
            'TRANSPORTER_TREATMENT_PROVIDER',
            'TRANSPORTER_TREATMENT',
            'TRANSPORTER_GOVERNMENT',
            'TRANSPORTER_GOVERNMENT_WASTE_BANK'
        ],
        {
            message: `providerType must be one of 'LANDFILLER',
                'TREATMENT_PROVIDER', 'RECYCLER', 'SPECIALIZED_TREATMENT_PROVIDER', 'TRANSPORTER', 'TRANSPORTER_GOVERNMENT_WASTE_BANK' ,'TRANSPORTER_RECYCLER', 'TRANSPORTER_SPECIALIZED_TREATMENT_PROVIDER', 'TRANSPORTER_LANDFILL','TRANSPORTER_TREATMENT_PROVIDER', 'TRANSPORTER_GOVERNMENT'`,
        },
    ),
    hasIncinerator: z.boolean({ message: 'hasIncinerator is required' }).default(false),
    hasAutoclave: z.boolean({ message: 'hasAutoclave is required' }).default(false),
    consumerId: z.number({ message: 'consumerId is required' }).int().positive(),
    consumerType: z.enum(
        [
            'HEALTHCARE_FACILITY',
            'TRANSPORTER',
            'TRANSPORTER_RECYCLER',
            'TRANSPORTER_SPECIALIZED_TREATMENT_PROVIDER',
            'TRANSPORTER_LANDFILL',
            'TRANSPORTER_TREATMENT_PROVIDER',
        ],
        {
            message: `consumerType must be one of 'HEALTHCARE_FACILITY', 'TRANSPORTER', 'TRANSPORTER_RECYCLER', 'TRANSPORTER_SPECIALIZED_TREATMENT_PROVIDER', 'TRANSPORTER_LANDFILL', 'TRANSPORTER_TREATMENT_PROVIDER'.`,
        },
    ),
    wasteClassificationId: z
        .number({ message: 'wasteClassificationId is required' })
        .int()
        .positive()
        .optional(),
    providerId: z.number({ message: 'providerId is required' }).int().positive(),
    picName: z.string().optional(),
    picPosition: z.string().optional(),
    picPhoneNumber: z.string().optional(),
    pricePerKg: z.number().int().positive().optional(),
});

export const updatePartnershipSchema = z.object({
    body: updatePartnershipSchemaBody,
    query: z.object({}).optional(),
    params: z.object({}).optional(),
});
