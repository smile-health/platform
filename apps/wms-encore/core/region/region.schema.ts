import { z } from "zod";

// Matches regionRoutes.ts's manual `['HF','TP','TRM'].includes(type)` check.
export const distanceLimitTypeSchema = z.enum(["HF", "TP", "TRM"]);
