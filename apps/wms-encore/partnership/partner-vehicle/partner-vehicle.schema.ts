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
      error: (issue) => issue.input === undefined ? "vehicleType is required" : `vehicleType must be either 'BOX_TRUCK',
        'REFRIGERATED_BOX_TRUCK',
        'OPEN_BODY_TRUCK',
        'TANKER',
        'HAZARDOUS_MATERIAL_TRUCK',
        'RADIOACTIVE_MATERIAL_TRUCK',
        'FLATBED_TRUCK',
        'LOADER_TRUCK',
        'TRAILER',
        'VAN',`
},
);

// Mirrors createPartnerVehicle.schema.ts's body shape.
export const createPartnerVehicleBodySchema = z.object({
  vehicleType: vehicleTypeSchema,
  vehicleNumber: z.string({
      error: "vehicleNumber is required"
}).min(1, {
    error: "vehicleNumber is required"
}),
  capacityInKgs: z.int().positive({
    error: "capacityInKgs must be a positive integer"
}),
  entityId: z.int().positive(),
});

// Mirrors updatePartnerVehicle.schema.ts's body shape (identical field set to
// create, minus createdBy/plus updatedBy — updatedBy/createdBy are both
// derived server-side from auth in this port, not part of the validated body).
export const updatePartnerVehicleBodySchema = createPartnerVehicleBodySchema;

// Mirrors createMultipleHealthcarePartnerVehicle.schema.ts's body shape.
export const createMultipleHealthcarePartnerVehicleBodySchema = z.object({
  vehicleType: vehicleTypeSchema,
  vehicleNumber: z.string({
      error: "vehicleNumber is required"
}).min(1, {
    error: "vehicleNumber is required"
}),
  capacityInKgs: z.int().positive({
    error: "capacityInKgs must be a positive integer"
}),
  entityIds: z.string({
      error: "entityIds is required"
}).min(1, {
    error: "entityIds is required"
}),
});
