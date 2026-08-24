import { z } from "zod";

// Mirrors createPartnership.schema.ts / updatePartnership.schema.ts's shared
// enum sets exactly — applied manually inside partnership.service.ts, not as
// the api() request type (gotcha #3: Encore's request-type decoding can't
// take a union literal directly off the wire).
export const consumerTypeSchema = z.enum(
  [
    "HEALTHCARE_FACILITY",
    "TRANSPORTER",
    "TRANSPORTER_RECYCLER",
    "TRANSPORTER_SPECIALIZED_TREATMENT_PROVIDER",
    "TRANSPORTER_LANDFILL",
    "TRANSPORTER_TREATMENT",
    "TRANSPORTER_TREATMENT_PROVIDER",
  ],
  {
    message:
      "consumerType must be one of 'HEALTHCARE_FACILITY', 'TRANSPORTER', 'TRANSPORTER_RECYCLER', 'TRANSPORTER_SPECIALIZED_TREATMENT_PROVIDER', 'TRANSPORTER_LANDFILL', 'TRANSPORTER_TREATMENT', 'TRANSPORTER_TREATMENT_PROVIDER'.",
  },
);

// updatePartnership.schema.ts's consumerType enum, preserved verbatim
// including its quirk: it's missing 'TRANSPORTER_TREATMENT' (present in
// create's list above) — a genuine inconsistency in the original, not a
// mistake introduced by this port.
export const updateConsumerTypeSchema = z.enum(
  [
    "HEALTHCARE_FACILITY",
    "TRANSPORTER",
    "TRANSPORTER_RECYCLER",
    "TRANSPORTER_SPECIALIZED_TREATMENT_PROVIDER",
    "TRANSPORTER_LANDFILL",
    "TRANSPORTER_TREATMENT_PROVIDER",
  ],
  {
    message:
      "consumerType must be one of 'HEALTHCARE_FACILITY', 'TRANSPORTER', 'TRANSPORTER_RECYCLER', 'TRANSPORTER_SPECIALIZED_TREATMENT_PROVIDER', 'TRANSPORTER_LANDFILL', 'TRANSPORTER_TREATMENT_PROVIDER'.",
  },
);

export const providerTypeSchema = z.enum(
  [
    "LANDFILLER",
    "TREATMENT_PROVIDER",
    "RECYCLER",
    "TREATMENT",
    "SPECIALIZED_TREATMENT_PROVIDER",
    "TRANSPORTER",
    "TRANSPORTER_RECYCLER",
    "TRANSPORTER_SPECIALIZED_TREATMENT_PROVIDER",
    "TRANSPORTER_LANDFILL",
    "TRANSPORTER_TREATMENT",
    "TRANSPORTER_TREATMENT_PROVIDER",
    "TRANSPORTER_GOVERNMENT",
    "TRANSPORTER_GOVERNMENT_WASTE_BANK",
  ],
  {
    message:
      "providerType must be one of 'LANDFILLER', 'TREATMENT_PROVIDER', 'RECYCLER', 'TREATMENT', 'SPECIALIZED_TREATMENT_PROVIDER', 'TRANSPORTER', 'TRANSPORTER_RECYCLER', 'TRANSPORTER_SPECIALIZED_TREATMENT_PROVIDER', 'TRANSPORTER_LANDFILL', 'TRANSPORTER_TREATMENT', 'TRANSPORTER_TREATMENT_PROVIDER', 'TRANSPORTER_GOVERNMENT', 'TRANSPORTER_GOVERNMENT_WASTE_BANK'.",
  },
);

export const partnershipStatusSchema = z.enum(
  ["PENDING", "ACTIVE", "SUSPENDED", "TERMINATED", "EXPIRED"],
  {
    message: "partnershipStatus must be one of 'PENDING','ACTIVE','SUSPENDED','TERMINATED','EXPIRED'",
  },
);

// Mirrors createPartnership.schema.ts's body shape.
export const createPartnershipBodySchema = z.object({
  contractStartDate: z.coerce.date().optional(),
  contractEndDate: z.coerce.date().optional(),
  contractId: z.string().min(1).optional(),
  partnershipStatus: partnershipStatusSchema,
  providerType: providerTypeSchema.optional(),
  hasIncinerator: z.boolean({ message: "hasIncinerator is required" }).default(false),
  hasAutoclave: z.boolean({ message: "hasAutoclave is required" }).default(false),
  consumerId: z.number({ message: "consumerId is required" }).int().positive(),
  consumerType: consumerTypeSchema,
  providerId: z.number({ message: "providerId is required" }).int().positive(),
  picName: z.string().optional(),
  picPosition: z.string().optional(),
  picPhoneNumber: z.string().optional(),
  pricePerKg: z.number().int().positive().optional(),
  wasteClassification: z
    .array(
      z.object({
        wasteClassificationId: z.number({ message: "wasteClassificationId is required" }).int().positive(),
        price: z.number().int().positive().optional(),
        providerTypes: z
          .enum(["LANDFILLER", "RECYCLER", "TREATMENT"], {
            message: "providerType must be one of 'LANDFILLER','RECYCLER', 'TREATMENT'",
          })
          .optional(),
      }),
    )
    .min(1, { message: "At least one wasteClassification is required" })
    .optional(),
});

// Mirrors updatePartnership.schema.ts's body shape (partnershipStatus/
// providerType/consumerType required here — unlike create, update.schema.ts
// doesn't default/optional them out).
export const updatePartnershipBodySchema = z.object({
  contractStartDate: z.coerce.date().optional(),
  contractEndDate: z.coerce.date().optional(),
  contractId: z.string().min(1).optional(),
  partnershipStatus: partnershipStatusSchema,
  providerType: providerTypeSchema,
  hasIncinerator: z.boolean({ message: "hasIncinerator is required" }).default(false),
  hasAutoclave: z.boolean({ message: "hasAutoclave is required" }).default(false),
  consumerId: z.number({ message: "consumerId is required" }).int().positive(),
  consumerType: updateConsumerTypeSchema,
  wasteClassificationId: z.number().int().positive().optional(),
  providerId: z.number({ message: "providerId is required" }).int().positive(),
  picName: z.string().optional(),
  picPosition: z.string().optional(),
  picPhoneNumber: z.string().optional(),
  pricePerKg: z.number().int().positive().optional(),
});
