import { z } from 'zod';

const updateWasteClassificationSchemaBody = z.object({
    effectiveFrom: z.string().date().min(1, { message: 'effectiveFrom is required' }).optional(),
    effectiveTo: z.string().date().min(1, { message: 'effectiveTo is required' }).optional(),
    regionId: z
        .number()
        .int()
        .positive({ message: 'wasteTypeId must be a positive integer' })
        .optional(),
    wasteTypeId: z.number().int().positive({ message: 'wasteTypeId must be a positive integer' }),
    wasteGroupId: z.number().int().positive({ message: 'wasteGroupId must be a positive integer' }),
    wasteCharacteristicsId: z
        .number()
        .int()
        .positive({ message: 'wasteCharacteristicsId must be a positive integer' }),
    wasteCode: z
        .string()
        .min(1, { message: 'wasteCode is required' })
        .max(64, { message: 'wasteCode max input 64 character' }),
    wasteBagColorCode: z.enum(['BLACK', 'GRAY', 'YELLOW', 'PURPLE', 'BROWN', 'RED', 'NONE'], {
        message:
            'scaleMethod must be either BLACK OR GRAY OR YELLOW OR PURPLE OR BROWN OR RED OR NONE',
    }),
    storageRuleType: z
        .enum(['STATIC', 'RULE_BASED'], {
            message: 'scaleMethod must be either STATIC OR RULE_BASED ',
        })
        .optional(),
    useColdStorage: z
        .union([z.boolean(), z.number().int().min(0).max(1)])
        .transform((val) => Boolean(val)),
    coldStorageMinHours: z
        .number()
        .int()
        .positive({ message: 'coldStorageMinHours must be a positive integer' })
        .optional(),
    coldStorageMaxHours: z
        .number()
        .int()
        .positive({ message: 'coldStorageMaxHours must be a positive integer' })
        .optional(),
    tempStorageMinHours: z
        .number()
        .int()
        .positive({ message: 'tempStorageMinHours must be a positive integer' })
        .optional(),
    tempStorageMaxHours: z
        .number()
        .int()
        .nonnegative({ message: 'tempStorageMaxHours must be a non-negative integer (0 or more)' })
        .optional(),
    minimunDecayDay: z
        .number()
        .int()
        .positive({ message: 'minimunDecayDay must be a positive integer' })
        .optional(),
    storageRule: z.string().optional(),
    hasMultipleTransporters: z
        .union([z.boolean(), z.number().int().min(0).max(1)])
        .transform((val) => Boolean(val)),
    allowHealthcareFacilityTreatment: z
        .union([z.boolean(), z.number().int().min(0).max(1)])
        .transform((val) => Boolean(val)),
    treatmentMethod: z
        .string()
        .min(1, { message: 'treatmentMethod is required' })
        .max(255, { message: 'treatmentMethod max input 255 character' })
        .optional(),
    disposalMethod: z
        .string()
        .min(1, { message: 'disposalMethod is required' })
        .max(255, { message: 'disposalMethod max input 255 character' }),
    allowedVehicleTypes: z
        .enum(
            [
                'BOX_TRUCK',
                'REFRIGERATED_BOX_TRUCK',
                'OPEN_BODY_TRUCK',
                'TANKER',
                'HAZARDOUS_MATERIAL_TRUCK',
                'RADIOACTIVE_MATERIAL_TRUCK',
                'FLATBED_TRUCK',
                'LOADER_TRUCK',
                'TRAILER',
                'VAN',
            ],
            {
                message:
                    'scaleMethod must be either BOX_TRUCK OR REFRIGERATED_BOX_TRUCK OR OPEN_BODY_TRUCK OR TANKER OR HAZARDOUS_MATERIAL_TRUCK OR RADIOACTIVE_MATERIAL_TRUCK OR FLATBED_TRUCK OR LOADER_TRUCK OR TRAILER OR VAN ',
            },
        )
        .optional(),
});

export const updateWasteClassificationSchema = z.object({
    body: updateWasteClassificationSchemaBody,
    query: z.object({}).optional(),
    params: z.object({}).optional(),
});
