import { z } from "zod";

// Mirrors createDisposedBastSchemaBody (request-schemas/createDisposedBast.schema.ts).
export const createBastBodySchema = z.object({
  bast_no: z.string({
      error: "BAST number is required"
}).min(1, {
    error: "BAST number cannot be empty"
}),
  disposal_comments: z.string({
      error: "Disposal comments must be a string"
}).optional(),
  instruction_type_id: z.int({
          error: "Instruction type ID must be an integer"
      }),
  instruction_type_label: z
    .string({
        error: "Instruction type label is required"
    })
    .min(1, {
        error: "Instruction type label cannot be empty"
    }),
  sender: z.object({
    address: z.string({
        error: "Address is required"
    }).min(1, {
        error: "Address cannot be empty"
    }),
    entity_id: z.int({
            error: "Entity ID must be an integer"
        }),
    entity_name: z.string({
        error: "Entity name is required"
    }).min(1, {
        error: "Entity name cannot be empty"
    }),
    province_name: z.string({
        error: "Province name is required"
    }),
    regency_name: z.string({
        error: "Regency name is required"
    }),
    status: z.int({
            error: "Status must be an integer"
        }),
    type: z.int({
            error: "Type must be an integer"
        }),
    type_label: z.string({
        error: "Type label is required"
    }),
  }),
  disposal_items: z
    .array(
      z.object({
        material_id: z.int({
                      error: "Material ID must be an integer"
                  }),
        material_name: z.string({
            error: "Material name is required"
        }).min(1, {
            error: "Material name cannot be empty"
        }),
        qty: z.int({
                      error: "Quantity must be an integer"
                })
          .positive({
              error: "Quantity must be greater than 0"
        }),
      })
    )
    .min(1, {
        error: "At least one disposal item is required"
    }),
  user_created_by: z.object({
    email: z.email({
              error: "Invalid email format"
          }),
    firstname: z.string({
        error: "First name is required"
    }),
    lastname: z.string({
        error: "Last name must be a string"
    }).optional(),
    username: z.string({
        error: "Username is required"
    }).min(1, {
        error: "Username cannot be empty"
    }),
    user_uuid: z.guid({
            error: "User UUID must be a valid UUID"
        }),
  }),
  created_at: z.iso.datetime({
      error: "Invalid datetime format for created_at"
  }),
  updated_at: z.iso.datetime({
      error: "Invalid datetime format for updated_at"
  }),
});

// Mirrors updateDisposedBastSchemaBody (request-schemas/updateDisposedBast.schema.ts).
export const confirmBastBodySchema = z.object({
  bastNo: z.string({
      error: "BAST number is required"
}).min(1, {
    error: "BAST number cannot be empty"
}),
  status: z.enum(["APPROVED", "REJECTED"], {
      error: "Only APPROVED and REJECTED can accept in status"
}),
  reason: z.string().optional(),
});
