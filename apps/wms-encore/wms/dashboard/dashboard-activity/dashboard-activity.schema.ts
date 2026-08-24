import { z } from "zod";
import { isValidDateString } from "../../../shared/utils/date-range";

// Mirrors exportActivitySummariesForEntities' manual
// `if (!startDate || !endDate) throw new Error(...)` guard — applied inside
// dashboard-activity.service.ts, not as an api() request type (gotcha #3).
// `.refine(isValidDateString)` closes a real bug found in production: the
// frontend's date-range picker sends the literal placeholder string "-" for
// "nothing selected" rather than omitting the param, which passed the
// original's plain truthy/`.min(1)` check but isn't a parseable date —
// Postgres rejects it (error 22007) rather than silently tolerating it the
// way MySQL did.
export const exportDateRangeSchema = z.object({
  startDate: z
    .string({ message: "startDate and endDate are required." })
    .min(1, { message: "startDate and endDate are required." })
    .refine(isValidDateString, { message: "startDate and endDate are required." }),
  endDate: z
    .string({ message: "startDate and endDate are required." })
    .min(1, { message: "startDate and endDate are required." })
    .refine(isValidDateString, { message: "startDate and endDate are required." }),
});
