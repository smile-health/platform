import { z } from "zod";

// Mirrors createWasteTransportationGroup.schema.ts / updateWasteTransportationGroup.schema.ts.
//
// NOTE (preserved original bug, not fixed here): the original schemas'
// `transportationStatus` enum lists WasteBag-lifecycle values ('GENERATED',
// 'CLASSIFIED', 'SCALED', ... 'DISPOSED') that don't overlap AT ALL with the
// DB column's actual enum ('READY_FOR_TRANSPORT' | 'TRANSPORTATION_REQUEST_CREATED',
// per WasteTransportationGroupModel.ts / WasteTransportationGroup.ts). Any
// request that would pass this validation would then fail (or silently
// coerce oddly) against the real column. Ported byte-for-byte anyway per
// task instructions — matching the original's bugs verbatim.
//
// NOTE (preserved original bug): `transporterOperatorId` is validated here as
// a number, but the domain entity / DB column (`transporter_operator_id
// varchar(36)`) is a string (uuid-like operator id). Ported as-is; the
// repository casts it to string for the DB write.
const transportationStatusEnum = z.enum([
  "GENERATED",
  "CLASSIFIED",
  "SCALED",
  "STORED_FOR_TREATMENT",
  "STORED_FOR_TRANSPORT",
  "TREATED",
  "RESIDUE_CLASSIFIED",
  "RESIDUE_SCALED",
  "RESIDUE_STORED_FOR_TRANSPORT",
  "IN_TRANSIT",
  "DISPOSED",
]);

export const createWasteTransportationGroupBodySchema = z.object({
  wasteBagIds: z
    .array(z.int().positive(), {
      error: "wasteBagIds must be an array of positive integers",
    })
    .nonempty({ error: "wasteBagIds is required and must not be empty" }),
  totalBagsCount: z.int()
    .positive({
        error: "totalBagsCount must be a positive integer"
    }),
  totalWeightInKgs: z
    .number({
        error: "totalWeightInKgs is required"
    })
    .positive({
        error: "totalWeightInKgs must be a positive integer"
    }),
  transporterVehicleId: z.int()
    .positive({
        error: "transporterVehicleId must be a positive integer"
    })
    .optional(),
  transporterOperatorId: z.int()
    .positive({
        error: "transporterOperatorId must be a positive integer"
    })
    .optional(),
  handoverLattitude: z.number({
      error: "handoverLattitude is required"
}).optional(),
  handoverLongitude: z.number({
      error: "handoverLongitude is required"
}).optional(),
  transportationStatus: transportationStatusEnum,
});

export const updateWasteTransportationGroupBodySchema = z.object({
  totalBagsCount: z.int()
    .positive({
        error: "totalBagsCount must be a positive integer"
    }),
  totalWeightInKgs: z.int()
    .positive({
        error: "totalWeightInKgs must be a positive integer"
    }),
  transporterVehicleId: z.int()
    .positive({
        error: "transporterVehicleId must be a positive integer"
    })
    .optional(),
  transporterOperatorId: z.int()
    .positive({
        error: "transporterOperatorId must be a positive integer"
    })
    .optional(),
  handoverLattitude: z.number({
      error: "handoverLattitude is required"
}).optional(),
  handoverLongitude: z.number({
      error: "handoverLongitude is required"
}).optional(),
  transportationStatus: transportationStatusEnum,
});
