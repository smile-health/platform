import { z } from "zod";
import {
  WASTE_STATUS_VALUES,
  SCALE_METHOD_VALUES,
  IOT_METHOD_VALUES,
} from "./waste-bag.types";

// Mirrors createWaste.schema.ts (request-schemas/createWaste.schema.ts).
export const createWasteBagSchema = z.object({
  healthcareFacilityId: z.number().int().positive(),
  wasteSourceId: z.number().int().positive(),
  wasteClassificationId: z.number().int().positive(),
  sourceTreatmentGroupId: z.string().optional(),
  scaleMethod: z.enum(SCALE_METHOD_VALUES),
  weightInKgs: z.number().nonnegative().optional(),
  wasteBagQrCodeId: z.string().min(1, "wasteBagQrCodeId is required"),
  assetId: z.number().int().positive().optional(),
  binNumber: z.string().optional(),
  wasteGroupIds: z.string().optional(),
  bastNo: z.string().optional(),
  materialIds: z.string().optional(),
  iotMethod: z.enum(IOT_METHOD_VALUES).optional(),
  isTreated: z.boolean().optional(),
  isRadioActive: z.boolean().optional(),
});

// Mirrors temporaryStoreWaste.schema.ts (also reused for follow-up-treatment,
// which validates the same `wasteBagQrCodeIds` shape in the original).
export const bulkWasteBagQrCodeSchema = z.object({
  wasteBagQrCodeIds: z.array(z.string().min(1)).min(1, "wasteBagQrCodeIds is required"),
  endTime: z.string().optional(),
});

// Mirrors sterilisedWaste.schema.ts / incinerateWaste.schema.ts (identical
// shape in the original for internal_landfill/sterilise/incinerate).
export const treatmentActionSchema = z.object({
  wasteBagQrCodeIds: z.array(z.string().min(1)).min(1, "wasteBagQrCodeIds is required"),
  treatmentStartTime: z.string().min(1, "treatmentStartTime is required"),
  treatmentEndTime: z.string().min(1, "treatmentEndTime is required"),
});

// Mirrors followUpWasteTransport.schema.ts.
export const followUpTransportSchema = z.object({
  wasteBagQrCodeIds: z.array(z.string().min(1)).min(1, "wasteBagQrCodeIds is required"),
  providerType: z.string().min(1, "providerType is required"),
  transporterVehicleId: z.number().int().positive().optional(),
  vehicleNumber: z.string().optional(),
  treatmentProviderId: z.number().int().positive().optional(),
  treatmentOperatorId: z.string().optional(),
  isReadOnly: z.boolean().optional(),
  transporterId: z.number().int().positive().optional(),
  thirdPartyId: z.number().int().positive().optional(),
  // Mirrors TransportRequestDTO's startTime/endTime — carried through so the
  // WASTE_BAG_FOLLOW_UP_TO_TRANSPORTER(_EXTERNAL) scheduled follow-up can use
  // a real completion time instead of a fabricated one (see
  // ScheduleEventForWasteStatusUpdateUseCase.ts's `metadata.endTime`).
  startTime: z.string().optional(),
  endTime: z.string().optional(),
});

// Mirrors handoverWasteTransport.schema.ts / handoverWasteTreatmentExternal.schema.ts.
export const handoverTransportSchema = z.object({
  wasteTransportationGroupIds: z.array(z.number().int().positive()).min(1),
  handoverLatitude: z.number(),
  handoverLongitude: z.number(),
  vehicleNumber: z.string().min(1),
  handoverTimestamp: z.string().min(1),
  manifestDocNumber: z.string().min(1),
  manifestDocPath: z.string().min(1, "manifest document is required"),
  transporterOperatorId: z.string().optional(),
  treatmentProviderId: z.number().int().positive().optional(),
  treatmentOperatorId: z.string().optional(),
  isReadOnly: z.boolean().optional(),
});

// Mirrors pickupWasteTransport.schema.ts.
export const pickUpTransportExternalSchema = z.object({
  wasteTransportationExternalGroupIds: z.array(z.number().int().positive()).min(1),
  healthcareFacilityId: z.number().int().positive(),
  handoverLatitude: z.number(),
  handoverLongitude: z.number(),
  treatmentProviderId: z.number().int().positive().optional(),
  treatmentOperatorId: z.string().optional(),
  isReadOnly: z.boolean().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
});

export const handoverTreatmentExternalSchema = z.object({
  wasteTransportationExternalGroupIds: z.array(z.number().int().positive()).min(1),
  startTime: z.string().min(1),
  endTime: z.string().min(1),
  treatmentLocationId: z.number().int().positive(),
  treatmentId: z.number().int().positive().optional(),
  entityId: z.number().int().positive().optional(),
});

export const receivingTreatmentExternalSchema = z.object({
  wasteBagQrCodeIds: z.array(z.string().min(1)).min(1),
  startTime: z.string().min(1),
  endTime: z.string().min(1),
  entityId: z.number().int().positive().optional(),
});

export function isValidWasteStatus(value: string): boolean {
  return (WASTE_STATUS_VALUES as readonly string[]).includes(value);
}
