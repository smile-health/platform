import { z } from 'zod';

const createDisposedBastSchemaBody = z.object({
    bast_no: z
        .string({ message: 'BAST number is required' })
        .min(1, { message: 'BAST number cannot be empty' }),
    disposal_comments: z.string({ message: 'Disposal comments must be a string' }).optional(),
    instruction_type_id: z
        .number({ message: 'Instruction type ID must be a number' })
        .int({ message: 'Instruction type ID must be an integer' }),
    instruction_type_label: z
        .string({ message: 'Instruction type label is required' })
        .min(1, { message: 'Instruction type label cannot be empty' }),

    sender: z.object({
        address: z
            .string({ message: 'Address is required' })
            .min(1, { message: 'Address cannot be empty' }),
        entity_id: z
            .number({ message: 'Entity ID must be a number' })
            .int({ message: 'Entity ID must be an integer' }),
        entity_name: z
            .string({ message: 'Entity name is required' })
            .min(1, { message: 'Entity name cannot be empty' }),
        province_name: z.string({ message: 'Province name is required' }),
        regency_name: z.string({ message: 'Regency name is required' }),
        status: z
            .number({ message: 'Status must be a number' })
            .int({ message: 'Status must be an integer' }),
        type: z
            .number({ message: 'Type must be a number' })
            .int({ message: 'Type must be an integer' }),
        type_label: z.string({ message: 'Type label is required' }),
    }),

    disposal_items: z
        .array(
            z.object({
                material_id: z
                    .number({ message: 'Material ID must be a number' })
                    .int({ message: 'Material ID must be an integer' }),
                material_name: z
                    .string({ message: 'Material name is required' })
                    .min(1, { message: 'Material name cannot be empty' }),
                qty: z
                    .number({ message: 'Quantity must be a number' })
                    .int({ message: 'Quantity must be an integer' })
                    .positive({ message: 'Quantity must be greater than 0' }),
            }),
        )
        .min(1, { message: 'At least one disposal item is required' }),

    user_created_by: z.object({
        email: z
            .string({ message: 'Email is required' })
            .email({ message: 'Invalid email format' }),
        firstname: z.string({ message: 'First name is required' }),
        lastname: z.string({ message: 'Last name must be a string' }).optional(),
        username: z
            .string({ message: 'Username is required' })
            .min(1, { message: 'Username cannot be empty' }),
        user_uuid: z
            .string({ message: 'User UUID is required' })
            .uuid({ message: 'User UUID must be a valid UUID' }),
    }),

    created_at: z
        .string({ message: 'Created at timestamp is required' })
        .datetime({ message: 'Invalid datetime format for created_at' }),
    updated_at: z
        .string({ message: 'Updated at timestamp is required' })
        .datetime({ message: 'Invalid datetime format for updated_at' }),
});

export const createDisposedBastSchema = z.object({
    body: createDisposedBastSchemaBody,
    query: z.object({}).optional(),
    params: z.object({}).optional(),
});
