import { z } from "zod";
import {
  MOBILE_WASTE_FOLLOW_UP_ACTION_TYPES,
  MOBILE_WASTE_POST_TREATMENT_ACTION_TYPES,
} from "./mobile-waste.types";

// Mirrors temporaryStoreWaste.schema.ts (used to validate the
// follow-up-treatment endpoint's body in the original, per wasteRoutes.ts).
export const mobileFollowUpTreatmentSchema = z.object({
  wasteBagQrCodeIds: z.array(z.string().min(1, "wasteBagQrCodeId is required")),
});

// Mirrors handoverWasteTreatment.schema.ts — original allows startTime/endTime
// to be omitted (schema marks them optional); receiving-treatment-external's
// use-case (ReceievmentTreatmentExternal.ts) defaults them to "now" when absent,
// same as ../waste-bag/waste-bag.service.ts's receivingTreatmentExternalRequest.
export const mobileReceivingTreatmentExternalSchema = z.object({
  wasteBagQrCodeIds: z.array(z.string().min(1, "wasteBagQrCodeId is required")),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
});

// Mirrors mobileWasteFollowUp.schema.ts.
export const mobileWasteFollowUpSchema = z.object({
  wasteBagQrCodeIds: z.array(z.string().min(1, "wasteBagQrCodeId is required")),
  actionType: z.enum(MOBILE_WASTE_FOLLOW_UP_ACTION_TYPES),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  transporterVehicleId: z.number().int().positive().optional(),
  transporterId: z.number().int().positive().optional(),
  thirdPartyId: z.number().int().positive().optional(),
});

// Mirrors mobileWastePostTreatment.schema.ts.
export const mobileWastePostTreatmentSchema = z.object({
  wasteBagQrCodeIds: z.array(z.string().min(1, "wasteBagQrCodeId is required")),
  actionType: z.enum(MOBILE_WASTE_POST_TREATMENT_ACTION_TYPES),
  healthcareFacilityId: z.number().int().positive(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  transporterVehicleId: z.number().int().positive().optional(),
});
