import { APIError, ErrCode } from "encore.dev/api";
import { distanceLimitTypeSchema } from "./region.schema";
import * as repo from "./region.repository";
import type { Region } from "./region.types";

// regionController.ts's res.fail(...) calls all omit the options object, so every
// one of these is a plain 400 with a string `data` payload — not 404/422, despite
// having a "not found" or "validation" flavor. ErrCode.FailedPrecondition (→400,
// see shared/http/envelope.ts) matches that verbatim; ErrCode.NotFound/
// InvalidArgument (→404/422) would be a behavior change from the original.

export async function getRegionById(id: string): Promise<Region> {
  const numericId = Number(id);
  if (!id || Number.isNaN(numericId)) {
    throw new APIError(ErrCode.FailedPrecondition, "ID parameter is required");
  }

  const region = await repo.findRegionById(numericId);
  if (!region) throw new APIError(ErrCode.FailedPrecondition, "Region not found");
  return region;
}

export async function getDistanceLimit(input: {
  lat1: number;
  lon1: number;
  lat2: number;
  lon2: number;
  type: string;
  entityId: number;
}): Promise<boolean> {
  const parsedType = distanceLimitTypeSchema.safeParse(input.type);
  if (!parsedType.success) {
    throw new APIError(ErrCode.FailedPrecondition, "Type is not correct HF / TP / TRM");
  }

  return repo.getValidationDistanceLimit(
    input.lat1,
    input.lon1,
    input.lat2,
    input.lon2,
    parsedType.data,
    input.entityId
  );
}
