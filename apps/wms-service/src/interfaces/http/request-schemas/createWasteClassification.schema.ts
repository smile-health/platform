import { z } from 'zod';

const createWasteClassificationSchemaBody = z.object({
    createdBy: z.string().min(1, { message: 'createdBy is required' }),
    regionId: z
        .number()
        .int()
        .positive({ message: 'regionId must be a positive integer' })
        .optional(),
    effectiveFrom: z.string().date().min(1, { message: 'effectiveFrom is required' }).optional(),
    effectiveTo: z.string().date().min(1, { message: 'effectiveTo is required' }).optional(),
    wasteTypeId: z
        .number({
            required_error: 'wasteTypeId is required',
            invalid_type_error: 'wasteTypeId must be a number',
        })
        .int()
        .positive(),
    wasteGroupId: z
        .number({
            required_error: 'wasteGroupId is required',
            invalid_type_error: 'wasteGroupId must be a number',
        })
        .int()
        .positive(),
    wasteCharacteristicsId: z
        .number({
            required_error: 'wasteCharacteristicsId is required',
            invalid_type_error: 'wasteCharacteristicsId must be a number',
        })
        .int()
        .positive(),
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
    isActive: z.boolean().optional().default(false),
    hasMultipleTransporters: z
        .union([z.boolean(), z.number().int().min(0).max(1)])
        .transform((val) => Boolean(val)),
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

export const createWasteClassificationSchema = z.object({
    body: createWasteClassificationSchemaBody,
    query: z.object({}).optional(),
    params: z.object({}).optional(),
});
