import { z } from "zod";
import { ALLOWED_STATUS_VALUES, TRANSPORTATION_STATUS_VALUES } from "./waste-treatment-external-group.types";

// There is no body-validating schema in the original (both endpoints are
// GET with only query params, and the original controller does its own
// inline, ad-hoc query parsing rather than going through a validation
// layer). This schema exists purely to give
// waste-treatment-external-group.service.ts a single place to validate the
// `transportationStatus` query param against its enum, matching the
// project-wide convention of validating enum-like wire fields via Zod in the
// service layer rather than trusting the plain-string wire type.
export const transportationStatusSchema = z.enum(TRANSPORTATION_STATUS_VALUES);

// Not actually enforced anywhere at runtime — see
// waste-treatment-external-group.service.ts's getAllWasteTreatmentExternalGroup
// for why: the original's equivalent check is a no-op bug (its `.map()`
// callback never returns a value, so the truthiness check it feeds is always
// true for any string). Kept here only as documentation of the *intended*
// allow-list.
export const allowedStatusSchema = z.enum(ALLOWED_STATUS_VALUES);
