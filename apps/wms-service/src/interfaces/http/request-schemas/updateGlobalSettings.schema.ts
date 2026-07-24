import { z } from 'zod';

const updateGlobalSettingsSchemaBody = z.object({
    createdBy: z.string().min(1, { message: 'createdBy is required' }),
    settingName: z.string({ message: 'setting name is required' }),
    settingValue: z.string({ message: 'settings value is reuired' }),
});

export const updateGlobalSettingsSchema = z.object({
    body: updateGlobalSettingsSchemaBody,
    query: z.object({}).optional(),
    params: z.object({}).optional(),
});
