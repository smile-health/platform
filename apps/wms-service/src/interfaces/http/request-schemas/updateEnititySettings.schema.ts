import { z } from 'zod';

const updateEntitySettingsSchemaBody = z.object({
    updatedBy: z.string().min(1, { message: 'updatedBy is required' }),
    entityId: z.number({ message: 'entiti id is required' }).positive().optional(),
    settingName: z.string({ message: 'setting name is required' }),
    settingValue: z.string({ message: 'settings value is reuired' }),
});

export const updateEntitySettingsSchema = z.object({
    body: updateEntitySettingsSchemaBody,
    query: z.object({}).optional(),
    params: z.object({}).optional(),
});
