import { APIError, ErrCode } from "encore.dev/api";
import * as repo from "./qr-code-config.repository";
import { qrCodeConfigBodySchema } from "./qr-code-config.schema";
import type { PaginatedQrCodeConfig, QrCodeConfig } from "./qr-code-config.types";
import { getLocalUserName } from "../../shared/core/entity-user-lookup";
import * as wasteSourceRepo from "../../waste/waste-source/waste-source.repository";
import * as wasteClassificationRepo from "../../waste/waste-classification/waste-classification.repository";

// qrCodeConfigController.ts's res.fail(...) calls are all called with no
// options object -> plain 400s (FailedPrecondition), except
// updateQrCodeConfig's `typeof data === 'string'` branch, which passes
// {isValidationError:true} -> 422 (InvalidArgument) — noted at that call site.

export async function getQrCodeConfigById(id: string): Promise<QrCodeConfig> {
  if (!id) {
    // res.fail('ID parameter is required') — no flag
    throw new APIError(ErrCode.FailedPrecondition, "ID parameter is required");
  }
  const data = await repo.findById(Number(id));
  if (!data) {
    // res.fail('Qr Code Config not found') — no flag
    throw new APIError(ErrCode.FailedPrecondition, "Qr Code Config not found");
  }
  // userName is populated from the local `users` table (looked up by
  // user_uuid via getLocalUserName — see shared/core/entity-user-lookup.ts)
  // rather than the original's HTTP fallback to apps/core.
  const userName = data.updatedBy ? await getLocalUserName(data.updatedBy) : undefined;
  const [wasteSource, wasteClassification] = await Promise.all([
    wasteSourceRepo.findById(data.wasteSourceId),
    wasteClassificationRepo.findById(data.wasteClassificationId),
  ]);
  return { ...data, userName, wasteSource: wasteSource ?? undefined, wasteClassification: wasteClassification ?? undefined };
}

export async function getAllQrCodeConfigs(input: {
  limit?: number;
  page?: number;
  search?: string;
  sourceType?: string;
  sortBy?: string;
  sortOrder?: string;
  entityId?: string;
  fallbackHealthcareFacilityId?: number;
}): Promise<PaginatedQrCodeConfig> {
  // Original: rejects with a 422 ({isValidationError:true}) when the
  // Authorization header is missing/malformed, then extracts the bearer
  // token purely to pass to getUsersDetail() for the userName enrichment
  // (see qr-code-config.types.ts) — it plays no role in authorization here,
  // that's handled separately by authenticate/authorizeRoles middleware.
  // Encore's auth:true + authHandler already guarantees a valid token by the
  // time this runs, so that specific re-check is redundant and dropped.
  //
  // userName enrichment (getUsersDetail(updatedBy, token) ->
  // firstname+lastname) is populated below from the local `users` table via
  // getLocalUserName (users.repository.ts's findByUserUuid handles the
  // user_uuid-vs-numeric-id distinction — see shared/core/entity-user-lookup.ts).
  const facilityId =
    input.entityId !== undefined ? Number(input.entityId) : input.fallbackHealthcareFacilityId;

  const validSortBy =
    input.sortBy === "wasteCharacteristicsName" ||
    input.sortBy === "wasteSourceName" ||
    input.sortBy === "updatedAt" ||
    input.sortBy === "updated_at"
      ? input.sortBy
      : "updated_at";
  const validSortOrder = input.sortOrder === "ASC" || input.sortOrder === "DESC" ? input.sortOrder : "ASC";

  const result = await repo.findPaginated({
    limit: input.limit && input.limit > 0 ? input.limit : 10,
    page: input.page && input.page > 0 ? input.page : 1,
    healthcareFacilityId: facilityId,
    search: input.search,
    sourceType: input.sourceType,
    sortBy: validSortBy,
    sortOrder: validSortOrder,
  });
  const data = await Promise.all(
    result.data.map(async (row) => {
      const [userName, wasteSource, wasteClassification] = await Promise.all([
        row.updatedBy ? getLocalUserName(row.updatedBy) : Promise.resolve(undefined),
        wasteSourceRepo.findById(row.wasteSourceId),
        wasteClassificationRepo.findById(row.wasteClassificationId),
      ]);
      return { ...row, userName, wasteSource: wasteSource ?? undefined, wasteClassification: wasteClassification ?? undefined };
    }),
  );
  return { ...result, data };
}

export async function createQrCodeConfig(input: {
  createdBy: string;
  healthcareFacilityId: number;
  wasteSourceId: number;
  wasteClassificationId: number;
  labelCount: number;
}): Promise<QrCodeConfig> {
  const parsed = qrCodeConfigBodySchema.safeParse(input);
  if (!parsed.success) {
    throw new APIError(ErrCode.InvalidArgument, parsed.error.issues[0]?.message ?? "Invalid request");
  }

  // Original use-case (CreateQrCodeConfig.ts) also verifies wasteSourceId /
  // wasteClassificationId exist against WasteSourceRepository /
  // WasteClassificationModel before inserting, returning a plain string
  // ("Waste Source with ID X not found" / "Waste Classification with ID X
  // not found") on failure — which the controller then passes straight to
  // res.success(data), a real bug (a "not found" string silently reported as
  // a success). Now that waste-source/waste-classification are both ported,
  // this wires up the existence check for real — but throws a proper
  // APIError instead of replicating the silent-success bug, per this
  // comment's own original intent (matching how global-settings.service.ts /
  // entity-location.service.ts handle their analogous string-return bugs).
  const [wasteSource, wasteClassification] = await Promise.all([
    wasteSourceRepo.findById(parsed.data.wasteSourceId),
    wasteClassificationRepo.findById(parsed.data.wasteClassificationId),
  ]);
  if (!wasteSource) {
    throw new APIError(
      ErrCode.FailedPrecondition,
      `Waste Source with ID ${parsed.data.wasteSourceId} not found`
    );
  }
  if (!wasteClassification) {
    throw new APIError(
      ErrCode.FailedPrecondition,
      `Waste Classification with ID ${parsed.data.wasteClassificationId} not found`
    );
  }

  return repo.create({
    createdBy: input.createdBy,
    healthcareFacilityId: input.healthcareFacilityId,
    wasteSourceId: parsed.data.wasteSourceId,
    wasteClassificationId: parsed.data.wasteClassificationId,
    labelCount: parsed.data.labelCount,
  });
}

export async function updateQrCodeConfig(input: {
  id: string;
  updatedBy: string;
  healthcareFacilityId: number;
  wasteSourceId: number;
  wasteClassificationId: number;
  labelCount: number;
}): Promise<QrCodeConfig> {
  const numericId = Number(input.id);
  if (!input.id || Number.isNaN(numericId)) {
    // res.fail('ID parameter is required') — no flag
    throw new APIError(ErrCode.FailedPrecondition, "ID parameter is required");
  }

  const parsed = qrCodeConfigBodySchema.safeParse(input);
  if (!parsed.success) {
    // Mirrors the original's `typeof data === 'string'` branch — passed
    // {isValidationError:true} -> 422 (InvalidArgument). That branch is
    // ALSO fed by UpdateQrCodeConfig.ts's own wasteSource/wasteClassification
    // existence checks below (both return a string on failure, same as this
    // parse-failure branch) — kept distinct here only because zod validation
    // necessarily runs first.
    throw new APIError(ErrCode.InvalidArgument, parsed.error.issues[0]?.message ?? "Invalid request");
  }

  // Original use-case (UpdateQrCodeConfig.ts) verifies wasteSourceId then
  // wasteClassificationId exist, in that order, before applying the update.
  // Preserves the original's own bug verbatim: the wasteSourceId not-found
  // message literally reads "Qr Code Config with ID {wasteSourceId} not
  // found", not "Waste Source with ID..." (a copy-paste mistake in the
  // original, not something to silently correct here).
  const [wasteSource, wasteClassification] = await Promise.all([
    wasteSourceRepo.findById(parsed.data.wasteSourceId),
    wasteClassificationRepo.findById(parsed.data.wasteClassificationId),
  ]);
  if (!wasteSource) {
    throw new APIError(
      ErrCode.InvalidArgument,
      `Qr Code Config with ID ${parsed.data.wasteSourceId} not found`
    );
  }
  if (!wasteClassification) {
    throw new APIError(
      ErrCode.InvalidArgument,
      `Waste Classification with ID ${parsed.data.wasteClassificationId} not found`
    );
  }

  const updated = await repo.update(numericId, {
    updatedBy: input.updatedBy,
    healthcareFacilityId: input.healthcareFacilityId,
    wasteSourceId: parsed.data.wasteSourceId,
    wasteClassificationId: parsed.data.wasteClassificationId,
    labelCount: parsed.data.labelCount,
  });
  if (!updated) {
    // res.fail('Qr Code Config not found') — no flag
    throw new APIError(ErrCode.FailedPrecondition, "Qr Code Config not found");
  }
  return updated;
}

export async function deleteQrCodeConfig(id: string, deletedBy?: number): Promise<boolean> {
  if (!id) {
    // res.fail('ID parameter is required') — no flag
    throw new APIError(ErrCode.FailedPrecondition, "ID parameter is required");
  }
  const numericId = Number(id);
  const deleted = await repo.softDelete(numericId, deletedBy);
  if (!deleted) {
    // res.fail('Qr Code Config not found') — no flag
    throw new APIError(ErrCode.FailedPrecondition, "Qr Code Config not found");
  }
  return true;
}
