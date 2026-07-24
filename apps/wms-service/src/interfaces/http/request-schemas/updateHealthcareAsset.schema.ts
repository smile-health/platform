import { optional, z } from 'zod';

const updateHealthcareAssetSchemaBody = z.object({
  assetId: z
    .string({ message: 'asset_id must be a positive integer' })
    .transform((val) => (val === '' ? undefined : val))
    .optional()
    .nullable()
    .refine((val) => val == null || val.length >= 3, {
      message: 'asset_id must be at least 3 characters long',
    }),
  healthcareFacilityId: z
    .number({ message: 'Heathcare facility id is required' })
    .int()
    .positive({ message: 'entity_id must be a positive integer' })
    .optional(),
  assetTypeName: z.string().optional(),
  assetWorkingStatusName: z.string().optional(),
  status: z
    .union([z.boolean(), z.number().int().min(0).max(1)])
    .transform((val) => Boolean(val))
    .optional(),
  createdAt: z
    .string()
    .transform((val) => new Date(val))
    .optional(),
  updatedAt: z
    .string()
    .transform((val) => new Date(val))
    .optional(),
});

export const updateHealthcareAssetSchema = z.object({
  body: updateHealthcareAssetSchemaBody,
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});
