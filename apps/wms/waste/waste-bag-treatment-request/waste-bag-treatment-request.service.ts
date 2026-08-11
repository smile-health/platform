import { APIError, ErrCode } from "encore.dev/api";
import * as repo from "./waste-bag-treatment-request.repository";
import { wasteBagTreatmentRequestBodySchema } from "./waste-bag-treatment-request.schema";
import type { WasteBagTreatmentRequest, PaginatedWasteBagTreatmentRequest } from "./waste-bag-treatment-request.types";

// wasteBagTreatmentRequestController.ts's res.fail(...) calls are all called
// with no options object -> plain 400s (FailedPrecondition), EXCEPT the two
// "treatment group not found" branches (create + update use-cases returning
// a string), which the controller forwards via
// res.fail(data, { isValidationError: true }) -> 422 (InvalidArgument) —
// noted at each call site below.

export async function getWasteBagTreatmentRequestById(id: string): Promise<WasteBagTreatmentRequest> {
  const numericId = Number(id);
  if (!id || Number.isNaN(numericId)) {
    // res.fail('ID parameter is required') — no flag
    throw new APIError(ErrCode.FailedPrecondition, "ID parameter is required");
  }
  const data = await repo.findById(numericId);
  if (!data) {
    // res.fail('Waste bag treatment request not found') — no flag
    throw new APIError(ErrCode.FailedPrecondition, "Waste bag treatment request not found");
  }
  return data;
}

export async function getAllWasteBagTreatmentRequests(input: {
  limit?: number;
  page?: number;
  search?: string;
}): Promise<PaginatedWasteBagTreatmentRequest> {
  // Original: paginationUtils.sanitizePaginationParams applies its own
  // defaults inside the repository impl — mirrored here via the same
  // safeLimit/safePage convention used by every other ported module.
  const safeLimit = input.limit && input.limit > 0 ? input.limit : 10;
  const safePage = input.page && input.page > 0 ? input.page : 1;
  return repo.findPaginated({ limit: safeLimit, page: safePage, search: input.search });
}

export async function createWasteBagTreatmentRequest(input: {
  createdBy: string;
  requestStatus: string;
  treatmentGroupId: number;
  requestCreatorId?: number;
  requestApproverId?: number;
}): Promise<WasteBagTreatmentRequest> {
  const parsed = wasteBagTreatmentRequestBodySchema.safeParse(input);
  if (!parsed.success) {
    // Request-shape validation equivalent (createWasteBagTreatmentRequest.schema.ts
    // is enforced upstream via validateRequest middleware in the original,
    // ahead of the use-case even running — mapped to InvalidArgument the same
    // way global-settings.service.ts's createGlobalSettings does).
    throw new APIError(ErrCode.InvalidArgument, parsed.error.issues[0]?.message ?? "Invalid request");
  }

  const groupExists = await repo.existsTreatmentGroup(parsed.data.treatmentGroupId);
  if (!groupExists) {
    // CreateWasteBagTreatmentRequest.ts's use-case returns the string
    // `Waste bag treatment group with ID ${treatmentGroupId} not found`,
    // which the controller forwards via res.fail(data, { isValidationError: true })
    // -> 422 (InvalidArgument).
    throw new APIError(
      ErrCode.InvalidArgument,
      `Waste bag treatment group with ID ${parsed.data.treatmentGroupId} not found`
    );
  }

  return repo.create({
    createdBy: input.createdBy,
    requestStatus: parsed.data.requestStatus,
    treatmentGroupId: parsed.data.treatmentGroupId,
    requestCreatorId: parsed.data.requestCreatorId,
    requestApproverId: parsed.data.requestApproverId,
  });
}

export async function updateWasteBagTreatmentRequest(input: {
  id: string;
  updatedBy: string;
  requestStatus: string;
  treatmentGroupId: number;
  requestCreatorId?: number;
  requestApproverId?: number;
}): Promise<WasteBagTreatmentRequest> {
  const numericId = Number(input.id);
  if (!input.id || Number.isNaN(numericId)) {
    // res.fail('ID parameter is required') — no flag (the controller checks
    // `req.params.id` up front before even reaching the use-case).
    throw new APIError(ErrCode.FailedPrecondition, "ID parameter is required");
  }

  const parsed = wasteBagTreatmentRequestBodySchema.safeParse(input);
  if (!parsed.success) {
    throw new APIError(ErrCode.InvalidArgument, parsed.error.issues[0]?.message ?? "Invalid request");
  }

  const existing = await repo.findById(numericId);
  if (!existing) {
    // UpdateWasteBagTreatmentRequest.ts's use-case returns `null` when the
    // row doesn't exist -> controller's res.fail('Waste bag treatment
    // request not found') — no flag.
    throw new APIError(ErrCode.FailedPrecondition, "Waste bag treatment request not found");
  }

  const groupExists = await repo.existsTreatmentGroup(parsed.data.treatmentGroupId);
  if (!groupExists) {
    // Same string-return -> isValidationError:true -> 422 branch as create.
    throw new APIError(
      ErrCode.InvalidArgument,
      `Waste bag treatment group with ID ${parsed.data.treatmentGroupId} not found`
    );
  }

  const updated = await repo.update(numericId, {
    updatedBy: input.updatedBy,
    requestStatus: parsed.data.requestStatus,
    treatmentGroupId: parsed.data.treatmentGroupId,
    requestCreatorId: parsed.data.requestCreatorId,
    requestApproverId: parsed.data.requestApproverId,
  });
  if (!updated) {
    throw new APIError(ErrCode.FailedPrecondition, "Waste bag treatment request not found");
  }
  return updated;
}

export async function deleteWasteBagTreatmentRequest(id: string, deletedBy?: number): Promise<boolean> {
  if (!id) {
    // res.fail('ID parameter is required') — no flag
    throw new APIError(ErrCode.FailedPrecondition, "ID parameter is required");
  }
  const numericId = Number(id);
  const deleted = await repo.softDelete(numericId, deletedBy);
  if (!deleted) {
    // res.fail('Waste bag treatment request not found') — no flag
    throw new APIError(ErrCode.FailedPrecondition, "Waste bag treatment request not found");
  }
  return true;
}
