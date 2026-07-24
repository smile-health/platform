import { z } from 'zod';

const mobileHomePagetSchemaBody = z.object({
    startDate: z.coerce
        .date({
            required_error: 'startDate Date is required',
            invalid_type_error: 'Invalid end date format',
        })
        .optional(),
    endDate: z.coerce
        .date({
            required_error: 'endDate Date is required',
            invalid_type_error: 'Invalid end date format',
        })
        .optional(),
    wasteType: z.string().optional(),
    wasteGroup: z.string().optional(),
    wasteCharacteristics: z.string().optional(),
    wasteTreatment: z
      .enum(['in_temporary_storage', 'in_cold_storage', 'sterilised', 'incinerated'])
      .optional(),
    query: z.string().optional(),
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
  });

export const mobileHomepageSchema = z.object({
    body: z.object({}).optional(),
    query: mobileHomePagetSchemaBody,
    params: z.object({}).optional(),
});
