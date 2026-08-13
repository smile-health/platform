import { z } from "zod";

// Mirrors the allow-lists inline in wasteTransportExternalGroupController.ts's
// getAllWasteTransportExternalGroup — the original silently drops any query
// value not in the list (leaves the param `undefined`) rather than erroring,
// so these are exposed as `parseOrUndefined` helpers, not throwing schemas.

export const allowedStatusValues = [
  "IN_TEMPORARY_STORAGE",
  "IN_COLD_STORAGE",
  "INCINERATION_IN_PROCESS",
  "STERILIZATION_IN_PROCESS",
  "INCINERATED",
  "STERILISED",
  "READY_FOR_TRANSPORT",
  "TRANSPORTATION_REQUEST_CREATED",
  "IN_TRANSIT",
  "READY_FOR_TREATMENT",
  "RECYCLED",
  "LANDFILLED",
  "COLLECTED",
  "DISPOSED",
] as const;

export const allowedExternalTreatmentValues = [
  "TRANSPORTER_LANDFILL",
  "TRANSPORTER_RECYCLER",
  "TRANSPORTER_TREATMENT",
  "TRANSPORTER_GOVERNMENT",
  "TRANSPORTER_GOVERNMENT_WASTE_BANK",
  "SPECIALIZED_TREATMENT_PROVIDER",
] as const;

export const allowedTransportationStatusValues = [
  "READY_FOR_TRANSPORT",
  "TRANSPORTATION_REQUEST_CREATED",
  "IN_TRANSIT",
] as const;

const statusSchema = z.enum(allowedStatusValues);
const externalTreatmentSchema = z.enum(allowedExternalTreatmentValues);
const transportationStatusSchema = z.enum(allowedTransportationStatusValues);

export function parseStatusOrUndefined(value?: string): string | undefined {
  const parsed = statusSchema.safeParse(value);
  return parsed.success ? parsed.data : undefined;
}

export function parseExternalTreatmentOrUndefined(value?: string): string | undefined {
  const parsed = externalTreatmentSchema.safeParse(value);
  return parsed.success ? parsed.data : undefined;
}

export function parseTransportationStatusOrUndefined(value?: string): string | undefined {
  const parsed = transportationStatusSchema.safeParse(value);
  return parsed.success ? parsed.data : undefined;
}
