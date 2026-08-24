import { z } from "zod";

// Mirrors updateUsers.schema.ts. The original accepted boolean OR 0/1 and
// transformed to boolean; users.types.ts already narrows the wire field to a
// plain boolean (gotcha #3), so this schema's union branch on `number` only
// matters if a caller sends the legacy numeric form despite the declared
// type — kept for parity with the original's leniency.
export const isActiveSchema = z
  .union([z.boolean(), z.number().int().min(0).max(1)])
  .transform((val) => Boolean(val));

export const updateUsersBodySchema = z.object({
  is_active: isActiveSchema,
});
