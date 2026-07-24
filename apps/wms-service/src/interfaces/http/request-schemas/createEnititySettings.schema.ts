import { z } from 'zod';

const createEntitySettingsSchemaBody = z.object({
    createdBy: z.string().min(1, { message: 'createdBy is required' }),
    entityId: z.number({ message: 'entiti id is required' }).positive().optional(),
    settingName: z.string({ message: 'setting name is required' }),
    settingValue: z.string({ message: 'settings value is reuired' }),
});

export const createEntitySettingsSchema = z.object({
    body: createEntitySettingsSchemaBody,
    query: z.object({}).optional(),
    params: z.object({}).optional(),
});
