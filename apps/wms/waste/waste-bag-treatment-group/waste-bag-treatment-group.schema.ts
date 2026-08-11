import { z } from "zod";
import { ALLOWED_LISTING_STATUS_VALUES } from "./waste-bag-treatment-group.types";

// Mirrors getAllWasteBagTreatmentGroup's inline AllowedStatus check: an
// unrecognized status string is silently ignored (treated as "no filter"),
// never rejected — so this is a permissive `z.enum(...).optional()` used only
// to test membership, not a hard validator at the API boundary. See
// waste-bag-treatment-group.service.ts's getAllWasteBagTreatmentGroup.
export const allowedListingStatusSchema = z.enum(ALLOWED_LISTING_STATUS_VALUES);
