import { z } from "zod";
import { isValidDateString } from "../../shared/utils/date-range";

// Mirrors getWasteGroupByTreatment's manual
// `if (!disposalTreatment) res.fail('disposalTreatment required', {isValidationError: true})`
// guard — the ONE reachable, flagged validation branch in this whole
// controller (see dashboard.service.ts's top comment for why every other
// guard in the original maps to a plain 500, not this).
export const disposalTreatmentSchema = z.object({
  disposalTreatment: z.string().min(1, "disposalTreatment required"),
});

// Mirrors DashboardRepositoryImpl.getWasteCharacteristicsSummary's manual
// `if (!startDate || !endDate) throw new Error('startDate and endDate are required.')`
// guard, applied inside dashboard.service.ts.
// `.refine(isValidDateString)` closes a real bug found in production: the
// frontend's date-range picker sends the literal placeholder string "-" for
// "nothing selected" rather than omitting the param, which passed the
// original's plain `.min(1)` (and the original's own `!startDate` truthy
// check) but isn't a parseable date — Postgres rejects it (error 22007)
// rather than silently tolerating it the way MySQL did.
export const wasteCharacteristicsDateRangeSchema = z.object({
  startDate: z.string().min(1, "startDate and endDate are required.").refine(isValidDateString, "startDate and endDate are required."),
  endDate: z.string().min(1, "startDate and endDate are required.").refine(isValidDateString, "startDate and endDate are required."),
});
