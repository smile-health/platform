import { z } from "zod";

// The original userFcmTokenController.ts never used a validation library —
// every check was a manual `if (!x)` guard with a hand-written message (see
// GetByIdentity.ts / userFcmTokenController.ts). These schemas exist for the
// dotted-file convention and are not substituted for those hand-written
// messages in user-fcm-token.service.ts, to keep the ported error text
// byte-for-byte identical to the original.
export const getUserFcmTokenQuerySchema = z.object({
  id: z.string().min(1).optional(),
  entityId: z.string().min(1).optional(),
});

export const fcmTokenParamSchema = z.string().min(1);
