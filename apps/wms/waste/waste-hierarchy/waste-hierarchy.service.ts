import { APIError, ErrCode } from "encore.dev/api";
import * as repo from "./waste-hierarchy.repository";
import { createWasteHierarchyBodySchema, updateWasteHierarchyBodySchema } from "./waste-hierarchy.schema";
import { getLocalUserName } from "../../shared/core/entity-user-lookup";
import type {
  WasteHierarchy,
  PaginatedWasteHierarchy,
  WasteClassificationExplanation,
} from "./waste-hierarchy.types";

// This module's error mapping is unusually split, and worth calling out once
// here rather than at every call site:
//
//  - wasteHierarchyController.ts's own res.fail(...) calls (the `data === null`
//    / missing-required-query-param checks living directly in the controller,
//    not inside a use case) are all called with no options object -> plain
//    400s -> ErrCode.FailedPrecondition. Ported 1:1 below.
//  - Every use case (Create/Update/Delete/Get) wraps its body in
//    try/catch and *rethrows* business-rule violations (duplicate name,
//    region not found, association-guard failures, bad/NaN id, ...) as a
//    plain `Error`. The controller's catch block for these can only see
//    "some Error" and always calls res.error(error) — which is *always* a
//    500 (jsonResponse.ts's res.error hard-codes status 500 regardless of
//    error content). So, byte-for-byte, business-rule violations thrown out
//    of a use case surface as 500 Internal, not 400/404/422 — a real bug
//    upstream, preserved here via ErrCode.Internal rather than "fixed" to a
//    more sensible code.

export async function getWasteHierarchyById(id: string): Promise<WasteHierarchy> {
  // GetWasteHierarchy.execute's `if (!id) throw Error('ID parameter is
  // required')` is effectively dead code via the real route (`:id` always
  // supplies a non-empty string) and would surface as 500 Internal if it
  // ever fired — not reproduced as a live branch since it can't be reached.
  const numericId = Number(id);
  const data = Number.isNaN(numericId) ? null : await repo.findById(numericId);
  if (!data) {
    // controller: res.fail(req.t('waste-hierarchy.error.NOT_FOUND')) — no flag.
    throw new APIError(ErrCode.FailedPrecondition, "Waste hierarchy not found");
  }
  return data;
}

export async function getWasteHierarchyByParentHierarchyId(
  parentHierarchyId?: string
): Promise<WasteHierarchy[]> {
  if (!parentHierarchyId) {
    // controller: res.fail('parent_hierarchy_id parameter is required') — no flag.
    throw new APIError(ErrCode.FailedPrecondition, "parent_hierarchy_id parameter is required");
  }

  const data =
    parentHierarchyId === "null"
      ? await repo.findByParentHierarchyIdNull()
      : await repo.findByParentHierarchyId(Number(parentHierarchyId));

  if (!data || data.length === 0) {
    // controller: res.fail(req.t('waste-hierarchy.error.NOT_FOUND')) — no flag.
    throw new APIError(ErrCode.FailedPrecondition, "Waste hierarchy not found");
  }
  return data;
}

export async function getAllWasteHierarchy(input: {
  limit?: number;
  page?: number;
  search?: string;
  level?: number;
  wasteTypeId?: number;
  wasteGroupId?: number;
  isActive?: number;
}): Promise<PaginatedWasteHierarchy> {
  // Deviation: the original controller manually re-checks the Authorization
  // bearer header here (`res.fail(missing-token, {isValidationError:true})`
  // -> 422) before calling the use case, purely so it has a `token` string
  // to forward into getUsersDetail(token) for the userName enrichment.
  // Encore's own `auth: true` on this endpoint already rejects unauthenticated
  // calls before this service function ever runs, so that redundant re-check
  // is intentionally not reproduced; userName itself IS populated below, just
  // from the local `users` table instead of the HTTP round-trip.
  const safeLimit = input.limit && input.limit > 0 ? input.limit : 10;
  const safePage = input.page && input.page > 0 ? input.page : 1;
  const safeIsActive = input.isActive !== undefined && !Number.isNaN(Number(input.isActive)) ? Number(input.isActive) : 1;

  const result = await repo.findPaginated({
    limit: safeLimit,
    page: safePage,
    search: input.search,
    level: input.level,
    wasteTypeId: input.wasteTypeId,
    wasteGroupId: input.wasteGroupId,
    isActive: safeIsActive === 1,
  });
  const data = await Promise.all(
    result.data.map(async (row) => ({
      ...row,
      userName: row.updatedBy ? await getLocalUserName(row.updatedBy) : undefined,
    })),
  );
  return { ...result, data };
}

export async function createWasteHierarchy(input: {
  createdBy: string;
  regionId?: number;
  parentHierarchyId?: number | null;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn?: string;
  level?: number;
  isResidue?: boolean;
  isActive?: boolean;
}): Promise<WasteHierarchy> {
  const parsed = createWasteHierarchyBodySchema.safeParse(input);
  if (!parsed.success) {
    // No exact equivalent request-shape validation existed in the original
    // (its zod schema ran as Express middleware before the controller/use
    // case), but validating here mirrors that same schema and every other
    // ported module's convention of surfacing shape errors as InvalidArgument.
    throw new APIError(ErrCode.InvalidArgument, parsed.error.issues[0]?.message ?? "Invalid request");
  }
  const body = parsed.data;

  // Below this point mirrors CreateWasteHierarchyUseCase.execute — every
  // thrown Error here is caught by the controller and sent as res.error(),
  // i.e. 500 Internal (see the module-level comment above).
  let regionId = body.regionId;
  if (!regionId) {
    const region = await repo.findOneRegion();
    if (!region) {
      throw new APIError(ErrCode.Internal, "Region not found");
    }
    regionId = region.id;
  }

  let existing =
    body.parentHierarchyId !== undefined
      ? await repo.findByNameAndParent(body.name, body.parentHierarchyId)
      : await repo.findByNameAndParent(body.name);
  if (existing) {
    throw new APIError(ErrCode.Internal, `Waste Hierarchy with Name ${body.name} already exists`);
  }

  // Preserved upstream bug: for level 1/2 with a parentHierarchyId supplied,
  // the original re-runs the *exact same* {name, parent_hierarchy_id} lookup
  // it already just ran above (not an actual "does this parent exist" check
  // despite the error message), and — since `existing` was already null a
  // moment ago and nothing wrote a row in between — this branch can never
  // actually fire in practice. Reproduced verbatim rather than "fixed" into
  // a real parent-existence check, since that would be new behavior, not a
  // port.
  if ((body.level === 1 || body.level === 2) && body.parentHierarchyId) {
    const existingParent = await repo.findByNameAndParent(body.name, body.parentHierarchyId);
    if (existingParent) {
      throw new APIError(ErrCode.Internal, `Waste Hierarchy with ID ${body.parentHierarchyId} not found`);
    }
  }

  return repo.create({
    createdBy: input.createdBy,
    regionId,
    parentHierarchyId: body.parentHierarchyId ?? null,
    name: body.name,
    nameEn: body.nameEn,
    description: body.description,
    descriptionEn: body.descriptionEn,
    level: body.level ?? 0,
    isResidue: body.isResidue,
    isActive: body.isActive,
  });
}

export async function updateWasteHierarchy(input: {
  id: string;
  updatedBy: string;
  parentHierarchyId?: number | null;
  name?: string;
  nameEn?: string;
  description?: string;
  descriptionEn?: string;
  isResidue?: boolean;
  isActive?: boolean;
}): Promise<WasteHierarchy> {
  const parsed = updateWasteHierarchyBodySchema.safeParse(input);
  if (!parsed.success) {
    throw new APIError(ErrCode.InvalidArgument, parsed.error.issues[0]?.message ?? "Invalid request");
  }
  const body = parsed.data;

  const numericId = Number(input.id);
  if (Number.isNaN(numericId)) {
    // Mirrors `if (!id) throw Error('ID parameter is required')` — reachable
    // here because the controller does `id: Number(id)` before calling the
    // use case, so a non-numeric :id param arrives as NaN (falsy). Caught by
    // the controller's catch -> res.error() -> 500 Internal, per the
    // module-level comment above.
    throw new APIError(ErrCode.Internal, "ID parameter is required");
  }

  const existingData = await repo.findById(numericId);
  if (!existingData) {
    // The use case itself would already have returned null a few lines
    // later for a missing row (see below) — this just short-circuits the
    // classification-guard queries an actual 404 doesn't need to pay for.
    throw new APIError(ErrCode.FailedPrecondition, "Waste hierarchy not found");
  }

  // Mirrors the "changing an in-use node's parent is blocked" guard: if the
  // row already has children/associations depending on its current place in
  // the hierarchy (via waste_classification) and the caller is trying to move
  // it (parentHierarchyId !== its current parent), reject.
  if (
    (existingData.level ?? 0) > 0 &&
    existingData.parentHierarchyId !== (body.parentHierarchyId ?? existingData.parentHierarchyId)
  ) {
    const guardId =
      existingData.level === 1 ? existingData.id! : (existingData.parentHierarchyId ?? existingData.id!);
    const referenced = await repo.isReferencedByWasteClassification(guardId);
    if (referenced) {
      throw new APIError(
        ErrCode.Internal,
        "This waste name is already associated with other data. You are only allowed to edit the waste name."
      );
    }
  }

  const name = body.name ?? existingData.name;
  const duplicate = await repo.findByNameAndLevelExcludingId(name, existingData.level ?? 0, numericId);
  if (duplicate && duplicate.name === name) {
    throw new APIError(ErrCode.Internal, `Waste Hierarchy with Name ${name} already exists`);
  }

  // Mirrors: for level 1/2 rows, a parentHierarchyId must be supplied (either
  // in this request or already on the row) or the update is rejected as a
  // "not found" (the original's use case literally `return null` here,
  // which the controller maps to res.fail(NOT_FOUND) -> 400 FailedPrecondition
  // — unlike the Internal-mapped cases above, this one really is a plain
  // 400 in the original).
  if (existingData.level === 1 || existingData.level === 2) {
    if (body.parentHierarchyId === undefined && existingData.parentHierarchyId == null) {
      throw new APIError(ErrCode.FailedPrecondition, "Waste hierarchy not found");
    }
  }

  const updated = await repo.update(numericId, {
    updatedBy: input.updatedBy,
    parentHierarchyId: body.parentHierarchyId ?? existingData.parentHierarchyId,
    name,
    nameEn: body.nameEn ?? existingData.nameEn,
    description: body.description ?? existingData.description,
    descriptionEn: body.descriptionEn ?? existingData.descriptionEn,
    isResidue: body.isResidue ?? existingData.isResidue,
    isActive: body.isActive ?? existingData.isActive,
  });
  if (!updated) {
    throw new APIError(ErrCode.FailedPrecondition, "Waste hierarchy not found");
  }
  return updated;
}

export async function deleteWasteHierarchy(id: string): Promise<boolean> {
  const numericId = Number(id);
  if (!id || Number.isNaN(numericId)) {
    throw new APIError(ErrCode.FailedPrecondition, "ID parameter is required");
  }

  // Mirrors DeleteWasteHierarchyUseCase.execute's two existence guards, in
  // order — both return a string sentinel in the original rather than
  // throwing, which the controller maps via
  // `res.fail(req.t('waste-hierarchy.error.' + data))` -> 400
  // FailedPrecondition (a real 400, unlike the Internal-mapped cases in
  // create/update above — this module's use cases don't uniformly throw).
  const hasChildren = await repo.hasChildren(numericId);
  if (hasChildren) {
    throw new APIError(ErrCode.FailedPrecondition, "ALREADY_EXIST_IN_HIERARCHY");
  }

  const isReferenced = await repo.isReferencedByWasteClassification(numericId);
  if (isReferenced) {
    throw new APIError(ErrCode.FailedPrecondition, "ALREADY_EXIST_IN_CLASSIFICATION");
  }

  // NOT ported: on a successful delete, the original also logs a
  // WasteStatusUpdateService info event and fires a multi-channel
  // notification to super-admins (WasteStatusUpdatePublisher /
  // NotificationPublisher over RabbitMQ). Those cross-cutting side effects
  // are out of scope here — deferred to whichever module wires up the
  // waste domain's RabbitMQ publishers.
  const deleted = await repo.deactivate(numericId);
  if (!deleted) {
    throw new APIError(ErrCode.FailedPrecondition, "Waste hierarchy not found");
  }
  return true;
}

export async function explanationOfWasteClassification(): Promise<WasteClassificationExplanation[]> {
  return repo.findExplanationOfWasteClassification();
}
