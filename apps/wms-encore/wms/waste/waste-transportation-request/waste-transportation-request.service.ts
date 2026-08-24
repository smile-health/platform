import { APIError, ErrCode } from "encore.dev/api";
import * as repo from "./waste-transportation-request.repository";
import { wasteTransportationRequestBodySchema } from "./waste-transportation-request.schema";
import type { WasteTransportationRequest, PaginatedWasteTransportationRequests } from "./waste-transportation-request.types";

// wasteTransportationRequestController.ts's res.fail(...) calls with no
// options object -> plain 400s (FailedPrecondition). The two exceptions are
// create/update's zod-validation-failure branch and the group-not-found
// branch, both of which the original passes {isValidationError:true} for
// (via validateRequest middleware, and via the use-case returning a string
// that the controller re-wraps with isValidationError:true) -> 422
// (InvalidArgument) — noted at each call site below.

export async function getWasteTransportationRequestById(id: string): Promise<WasteTransportationRequest> {
  const numericId = Number(id);
  if (!id || Number.isNaN(numericId)) {
    // res.fail('ID parameter is required') — no flag
    throw new APIError(ErrCode.FailedPrecondition, "ID parameter is required");
  }
  const data = await repo.findById(numericId);
  if (!data) {
    // res.fail('Waste Transportation Request not found') — no flag
    throw new APIError(ErrCode.FailedPrecondition, "Waste Transportation Request not found");
  }
  return data;
}

// Original's getAllWasteTransportationRequests use-case delegates straight
// to the repository without its own limit/page sanitization — sanitization
// happens one layer down, in paginationUtils.sanitizePaginationParams (mirrored
// in this port's own default here, same shape as every other module).
export async function getAllWasteTransportationRequests(input: {
  limit?: number;
  page?: number;
  search?: string;
}): Promise<PaginatedWasteTransportationRequests> {
  const safeLimit = input.limit && input.limit > 0 ? input.limit : 10;
  const safePage = input.page && input.page > 0 ? input.page : 1;
  return repo.findPaginated({ limit: safeLimit, page: safePage, search: input.search });
}

export async function createWasteTransportationRequest(input: {
  createdBy: string;
  requestStatus?: string;
  transportationGroupId: number;
  requestCreatorId?: number;
  requestApproverId?: number;
}): Promise<WasteTransportationRequest> {
  const parsed = wasteTransportationRequestBodySchema.safeParse(input);
  if (!parsed.success) {
    // Mirrors validateRequest middleware's res.fail(errors, {isValidationError: true}) -> 422.
    throw new APIError(ErrCode.InvalidArgument, parsed.error.issues[0]?.message ?? "Invalid request");
  }

  // Mirrors CreateWasteTransportationRequest.ts's existence check against
  // WasteTransportationGroupRepository before writing.
  const groupExists = await repo.transportationGroupExists(parsed.data.transportationGroupId);
  if (!groupExists) {
    // Original use-case returns a string here, which the controller
    // re-wraps as res.fail(data, {isValidationError: true}) -> 422.
    throw new APIError(
      ErrCode.InvalidArgument,
      `Waste transportation group with ID ${parsed.data.transportationGroupId} not found`
    );
  }

  return repo.create({
    createdBy: input.createdBy,
    requestStatus: parsed.data.requestStatus,
    transportationGroupId: parsed.data.transportationGroupId,
    requestCreatorId: parsed.data.requestCreatorId,
    requestApproverId: parsed.data.requestApproverId,
  });
}

export async function updateWasteTransportationRequest(input: {
  id: string;
  updatedBy: string;
  requestStatus?: string;
  transportationGroupId: number;
  requestCreatorId?: number;
  requestApproverId?: number;
}): Promise<WasteTransportationRequest> {
  const numericId = Number(input.id);
  if (!input.id || Number.isNaN(numericId)) {
    // res.fail('ID parameter is required') — no flag (the controller checks
    // req.params.id before ever invoking the use-case, unlike updateGlobalSettings's
    // analogous string-return bug — no deviation needed here).
    throw new APIError(ErrCode.FailedPrecondition, "ID parameter is required");
  }

  const parsed = wasteTransportationRequestBodySchema.safeParse(input);
  if (!parsed.success) {
    throw new APIError(ErrCode.InvalidArgument, parsed.error.issues[0]?.message ?? "Invalid request");
  }

  const existing = await repo.findById(numericId);
  if (!existing) {
    // res.fail('Waste Transportation Request not found') — no flag
    throw new APIError(ErrCode.FailedPrecondition, "Waste Transportation Request not found");
  }

  // Mirrors UpdateWasteTransportationRequest.ts's existence check against
  // WasteTransportationGroupRepository before writing (run using the
  // *incoming* transportationGroupId, same as the original — even though the
  // update itself may fall back to the existing value for other fields).
  const groupExists = await repo.transportationGroupExists(parsed.data.transportationGroupId);
  if (!groupExists) {
    // Original use-case returns a string here, which the controller
    // re-wraps as res.fail(data, {isValidationError: true}) -> 422.
    throw new APIError(
      ErrCode.InvalidArgument,
      `Waste transportation group with ID ${parsed.data.transportationGroupId} not found`
    );
  }

  const updated = await repo.update(numericId, {
    updatedBy: input.updatedBy,
    requestStatus: parsed.data.requestStatus,
    transportationGroupId: parsed.data.transportationGroupId,
    requestCreatorId: parsed.data.requestCreatorId,
    requestApproverId: parsed.data.requestApproverId,
  });
  if (!updated) {
    throw new APIError(ErrCode.FailedPrecondition, "Waste Transportation Request not found");
  }
  return updated;
}

export async function deleteWasteTransportationRequest(id: string, deletedBy?: number): Promise<boolean> {
  if (!id) {
    // res.fail('ID parameter is required') — no flag
    throw new APIError(ErrCode.FailedPrecondition, "ID parameter is required");
  }
  const numericId = Number(id);
  const deleted = await repo.softDelete(numericId, deletedBy);
  if (!deleted) {
    // res.fail('Waste Transportation Request not found') — no flag
    throw new APIError(ErrCode.FailedPrecondition, "Waste Transportation Request not found");
  }
  return true;
}
