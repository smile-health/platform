import { z } from "zod";

// Mirrors createPartnerVehicle.schema.ts / updatePartnerVehicle.schema.ts's
// shared field set exactly — applied manually inside partner-vehicle.service.ts,
// not as the api() request type (gotcha #3).
export const vehicleTypeSchema = z.enum(
  [
    "BOX_TRUCK",
    "REFRIGERATED_BOX_TRUCK",
    "OPEN_BODY_TRUCK",
    "TANKER",
    "HAZARDOUS_MATERIAL_TRUCK",
    "RADIOACTIVE_MATERIAL_TRUCK",
    "FLATBED_TRUCK",
    "LOADER_TRUCK",
    "TRAILER",
    "VAN",
  ],
  {
    required_error: "vehicleType is required",
    invalid_type_error: `vehicleType must be either 'BOX_TRUCK',
        'REFRIGERATED_BOX_TRUCK',
        'OPEN_BODY_TRUCK',
        'TANKER',
        'HAZARDOUS_MATERIAL_TRUCK',
        'RADIOACTIVE_MATERIAL_TRUCK',
        'FLATBED_TRUCK',
        'LOADER_TRUCK',
        'TRAILER',
        'VAN',`,
  },
);

// Mirrors createPartnerVehicle.schema.ts's body shape.
export const createPartnerVehicleBodySchema = z.object({
  vehicleType: vehicleTypeSchema,
  vehicleNumber: z.string({ message: "vehicleNumber is required" }).min(1, {
    message: "vehicleNumber is required",
  }),
  capacityInKgs: z.number({ message: "capacityInKgs is required" }).int().positive({
    message: "capacityInKgs must be a positive integer",
  }),
  entityId: z.number({ message: "entityId is required" }).int().positive(),
});

// Mirrors updatePartnerVehicle.schema.ts's body shape (identical field set to
// create, minus createdBy/plus updatedBy — updatedBy/createdBy are both
// derived server-side from auth in this port, not part of the validated body).
export const updatePartnerVehicleBodySchema = createPartnerVehicleBodySchema;

// Mirrors createMultipleHealthcarePartnerVehicle.schema.ts's body shape.
export const createMultipleHealthcarePartnerVehicleBodySchema = z.object({
  vehicleType: vehicleTypeSchema,
  vehicleNumber: z.string({ message: "vehicleNumber is required" }).min(1, {
    message: "vehicleNumber is required",
  }),
  capacityInKgs: z.number({ message: "capacityInKgs is required" }).int().positive({
    message: "capacityInKgs must be a positive integer",
  }),
  entityIds: z.string({ message: "entityIds is required" }).min(1, {
    message: "entityIds is required",
  }),
});
