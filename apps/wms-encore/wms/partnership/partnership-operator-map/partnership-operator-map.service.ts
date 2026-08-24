import { APIError, ErrCode } from "encore.dev/api";
import * as repo from "./partnership-operator-map.repository";
import { partnershipOperatorMapBodySchema } from "./partnership-operator-map.schema";
import type {
  DeletePartnershipOperatorMapInput,
  GetOperatorsFromOperatorMapInput,
  OperatorsSelect,
  PaginatedPartnershipOperatorMaps,
  PartnershipOperatorMap,
  UpdatePartnershipOperatorMapRequest,
} from "./partnership-operator-map.types";

// partnershipOperatorMapController.ts's res.fail(...)/res.error(...) calls, audited
// call-by-call:
//   - createPartnershipOperatorMap: the use-case's `PartnershipOperatorMap | string`
//     return type IS a live code path here (unlike global-settings' dead one) — when
//     the referenced partnership doesn't exist the use-case returns a string, which the
//     controller maps via res.fail(data, { isValidationError: true }) -> 422
//     (ErrCode.InvalidArgument). The "already exists" duplicate-map case instead throws a
//     plain Error from inside the use-case's try, which its own catch rethrows as another
//     plain Error -> controller's outer catch -> res.error(...) -> 500 (ErrCode.Internal).
//   - getAllPartnershipOperatorMaps / getAllPartnershipOperatorMapsByThirdpartyAdmin: the
//     `!authHeader` / malformed-Authorization-header checks pass { isValidationError: true }
//     -> 422, but Encore's auth:true + Gateway already rejects unauthenticated requests
//     before the handler runs, so that branch is unreachable in this port and dropped (same
//     call as entity-location's / partner-vehicle's precedent). getAllPartnershipOperatorMaps'
//     `!providerId` check has no options object -> plain 400 (ErrCode.FailedPrecondition).
//   - updatePartnershipOperatorMap / deletePartnershipOperatorMap: the
//     `!partnership_id || !operator_id` query-param guards and the `data === null`
//     not-found checks are all called with no options object -> plain 400s.
//   - getOperatorsFromOperatorMap: only the (unreachable, dropped) missing-token check can
//     fail() here; everything else that can throw flows to the outer catch -> res.error(...)
//     -> 500. There is no not-found branch — an empty operator-map join simply resolves to [].

export async function createPartnershipOperatorMap(input: {
  partnershipId: number;
  operatorId: string;
}): Promise<PartnershipOperatorMap> {
  const parsed = partnershipOperatorMapBodySchema.safeParse(input);
  if (!parsed.success) {
    // validateRequest(createPartnershipOperatorMapSchema) middleware in the original runs
    // before the controller and rejects malformed bodies itself; reproduced here as
    // InvalidArgument (422), this port's manual-validation convention.
    throw new APIError(ErrCode.InvalidArgument, parsed.error.issues[0]?.message ?? "Invalid request");
  }
  const { partnershipId, operatorId } = parsed.data;

  // Original: `findPartnershipOperatorMapByCondition({partnership_id, operator_id})` — if a
  // row already exists, the use-case throws a plain Error, rethrown by its own catch as
  // another plain Error -> controller's outer catch -> res.error(...) -> 500.
  const existing = await repo.findByCondition(partnershipId, operatorId);
  if (existing) {
    throw new APIError(
      ErrCode.Internal,
      `OperatorId ${operatorId} and PartnershipId ${partnershipId} already exists`,
    );
  }

  // Original: `this.partnership.getPartnershipById(partnershipId.toString(), '')` — if
  // falsy, the use-case returns the string `No partnership for ID ${partnershipId}`, mapped
  // by the controller via res.fail(data, { isValidationError: true }) -> 422.
  const partnershipExists = await repo.existsPartnership(partnershipId);
  if (!partnershipExists) {
    throw new APIError(ErrCode.InvalidArgument, `No partnership for ID ${partnershipId}`);
  }

  await repo.create(partnershipId, operatorId);
  return { partnershipId, operatorId };
}

export async function getAllPartnershipOperatorMaps(input: {
  limit?: number;
  page?: number;
  search?: string;
  providerId?: number;
  authEntityId?: string;
}): Promise<PaginatedPartnershipOperatorMaps> {
  // res.fail('providerId parameter is required') — no flag -> 400
  if (!input.providerId) {
    throw new APIError(ErrCode.FailedPrecondition, "providerId parameter is required");
  }

  // Original: `Number(limit?.toString())` / `Number(page?.toString())` — NaN when absent;
  // paginationUtils.sanitizePaginationParams() is expected to fall back to sane defaults
  // for non-finite input, same convention every other ported module's findPaginated() uses.
  const limit = input.limit && Number.isFinite(input.limit) ? input.limit : 10;
  const page = input.page && Number.isFinite(input.page) ? input.page : 1;

  // Original: `search?.toString() ?? req.user?.entity.id.toString()`, then
  // `healthcareFacilityId: Number(search)` in the repository — falls back to the
  // authenticated user's entityId when no `search` query param is supplied.
  const healthcareFacilityIdRaw = input.search ?? input.authEntityId;
  const healthcareFacilityId = Number(healthcareFacilityIdRaw);

  return repo.findAllPaginated({
    limit,
    page,
    providerId: input.providerId,
    healthcareFacilityId,
  });
}

export async function getAllPartnershipOperatorMapsByThirdpartyAdmin(input: {
  limit?: number;
  page?: number;
  search?: string;
  operatorId?: string;
}): Promise<PaginatedPartnershipOperatorMaps> {
  const limit = input.limit && Number.isFinite(input.limit) ? input.limit : 10;
  const page = input.page && Number.isFinite(input.page) ? input.page : 1;

  return repo.findAllByThirdpartyAdmin({
    limit,
    page,
    search: input.search,
    operatorId: input.operatorId,
  });
}

export async function updatePartnershipOperatorMap(
  input: UpdatePartnershipOperatorMapRequest,
): Promise<PartnershipOperatorMap> {
  // res.fail('partnership_id and operator_id parameter is required') — no flag -> 400
  if (!input.partnership_id || !input.operator_id) {
    throw new APIError(ErrCode.FailedPrecondition, "partnership_id and operator_id parameter is required");
  }

  const parsed = partnershipOperatorMapBodySchema.safeParse(input);
  if (!parsed.success) {
    // validateRequest(updatePartnershipOperatorMapSchema) -> isValidationError:true -> 422
    throw new APIError(ErrCode.InvalidArgument, parsed.error.issues[0]?.message ?? "Invalid request");
  }
  const { partnershipId, operatorId } = parsed.data;

  // Original: use-case first checks whether the *new* (partnershipId, operatorId) pair
  // already exists — if so, throws a plain Error -> outer catch -> res.error(...) -> 500.
  const alreadyExists = await repo.findByCondition(partnershipId, operatorId);
  if (alreadyExists) {
    throw new APIError(
      ErrCode.Internal,
      `OperatorId ${operatorId} and PartnershipId ${partnershipId} already exists`,
    );
  }

  const numericPartnershipId = Number(input.partnership_id);

  // Original: use-case then checks the row identified by the *old* (query-string)
  // partnership_id/operator_id actually exists — if not, throws a plain Error -> outer
  // catch -> res.error(...) -> 500. Note: this is a different behavior from the
  // controller-level `data === null` check below, which is never actually reached because
  // the use-case throws first on this exact condition; preserved verbatim (a real quirk of
  // the original, not a mistake in this port).
  const existingRow = await repo.findByCondition(numericPartnershipId, input.operator_id);
  if (!existingRow) {
    throw new APIError(
      ErrCode.Internal,
      `Partnership OperatorMap with operatorId ${input.operator_id} not found`,
    );
  }

  const updated = await repo.update(numericPartnershipId, input.operator_id, partnershipId, operatorId);
  if (!updated) {
    // Controller: `if (data === null) res.fail('Waste source not found')` — no flag -> 400.
    // (Copy-pasted message from the waste-source module in the original controller;
    // preserved verbatim.) Unreachable in practice per the note above, kept for parity.
    throw new APIError(ErrCode.FailedPrecondition, "Waste source not found");
  }
  return updated;
}

export async function deletePartnershipOperatorMap(
  input: DeletePartnershipOperatorMapInput,
): Promise<boolean> {
  // res.fail('partnership_id and operator_id parameter is required') — no flag -> 400
  if (!input.partnershipId || !input.operatorId) {
    throw new APIError(ErrCode.FailedPrecondition, "partnership_id and operator_id parameter is required");
  }

  const numericPartnershipId = Number(input.partnershipId);

  const deleted = await repo.softDelete(numericPartnershipId, input.operatorId, input.deletedBy);
  if (!deleted) {
    // Controller: `if (data === null) res.fail('Waste source not found')` — no flag -> 400.
    // (Same copy-pasted message as update, preserved verbatim.)
    throw new APIError(ErrCode.FailedPrecondition, "Waste source not found");
  }
  return true;
}

export async function getOperatorsFromOperatorMap(
  input: GetOperatorsFromOperatorMapInput,
): Promise<OperatorsSelect[]> {
  const operatorIds = await repo.findDistinctOperatorIdsByProviderEntity(input.entityId ?? 0);
  // Original enriches each operatorId with a getUsersDetail(token) lookup to build
  // `operatorName` (firstname + lastname, space-joined) — ported as a local `users`
  // join; see partnership-operator-map.repository.ts's header comment.
  return Promise.all(
    operatorIds.map(async (operatorId) => ({
      operatorId,
      operatorName: await repo.findOperatorFullName(operatorId),
    })),
  );
}
