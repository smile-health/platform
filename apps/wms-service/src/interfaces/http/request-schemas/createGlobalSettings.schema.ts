import { z } from 'zod';

const createGlobalSettingsSchemaBody = z.object({
    createdBy: z.string().min(1, { message: 'createdBy is required' }),
    settingName: z.string({ message: 'setting name is required' }),
    settingValue: z.string({ message: 'settings value is reuired' }),
});

export const createGlobalSettingsSchema = z.object({
    body: createGlobalSettingsSchemaBody,
    query: z.object({}).optional(),
    params: z.object({}).optional(),
});
