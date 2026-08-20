import { APIError, ErrCode } from "encore.dev/api";
import * as repo from "./healthcare-asset.repository";
import {
  createHealthcareAssetBodySchema,
  updateHealthcareAssetBodySchema,
} from "./healthcare-asset.schema";
import type { HealthcareAsset } from "./healthcare-asset.types";
import { getAssetInventoryById } from "../../shared/core/asset-inventory-client";

// healthcareAssetController.ts's own bearer-token checks are superseded by
// Encore's `auth: true` + authHandler.ts. The original's `validateRequest`
// middleware (which runs the create/update zod schemas BEFORE the
// controller, failing with res.fail(errors, {isValidationError:true}) ->
// 422 InvalidArgument) has no Encore-native equivalent, so its schema checks
// are re-run here in the service instead.

export async function createHealthcareAsset(input: {
  id: number;
  assetId?: string;
  healthcareFacilityId: number;
  assetTypeName: string;
  assetWorkingStatusName: string;
  createdAt: string;
  updatedAt: string;
}): Promise<HealthcareAsset> {
  const parsed = createHealthcareAssetBodySchema.safeParse(input);
  if (!parsed.success) {
    throw new APIError(ErrCode.InvalidArgument, parsed.error.issues[0]?.message ?? "Invalid request");
  }

  return repo.create({
    id: parsed.data.id,
    assetId: parsed.data.assetId ?? null,
    assetTypeName: parsed.data.assetTypeName,
    healthcareFacilityId: parsed.data.healthcareFacilityId,
    assetWorkingStatusName: parsed.data.assetWorkingStatusName,
    createdAt: parsed.data.createdAt,
    updatedAt: parsed.data.updatedAt,
  });
}

// Mirrors HealthcareAssetImpl.getHealthcareAssetById: cross-checks the local
// `healthcare_asset` row against apps/core's asset-inventory service (see
// shared/core/asset-inventory-client.ts), auto-creating/updating the local
// row from that response, and returning `{ assetId, ...assetInventories }`.
export async function getHealthcareAssetById(
  id: string,
  healthcareFacilityIdInput: number | undefined,
  authEntityId: number,
  token: string | undefined,
  lang = "id"
): Promise<Record<string, unknown>> {
  const numericId = Number(id);

  // Original: healthcareFacilityId comes from query/body, defaulting to
  // req.user?.entity_id. If neither is present -> res.fail(..., {
  // isValidationError: true }) -> 422 InvalidArgument.
  const healthcareFacilityId = healthcareFacilityIdInput ?? authEntityId;
  if (!healthcareFacilityId) {
    throw new APIError(ErrCode.InvalidArgument, "healthcareFacilityId or entityId required");
  }

  const [existingDataById, existingData, assetInventories] = await Promise.all([
    repo.findById(numericId),
    repo.findByIdAndFacility(numericId, healthcareFacilityId),
    token ? getAssetInventoryById(numericId, token, lang) : Promise.resolve(undefined),
  ]);

  if (!existingData && assetInventories) {
    if (healthcareFacilityId === assetInventories.entity?.id && !existingDataById) {
      await repo.create({
        id: assetInventories.id,
        assetId: (assetInventories.asset_id as string | null | undefined) ?? null,
        assetTypeName: assetInventories.asset_type?.name ?? "",
        healthcareFacilityId: assetInventories.entity?.id ?? healthcareFacilityId,
        assetWorkingStatusName: String(assetInventories.working_status?.id ?? ""),
        createdAt: assetInventories.created_at ? new Date(assetInventories.created_at) : new Date(),
        updatedAt: assetInventories.updated_at ? new Date(assetInventories.updated_at) : new Date(),
      });
    } else {
      await repo.update(assetInventories.id, {
        assetTypeName: assetInventories.asset_type?.name,
        healthcareFacilityId: assetInventories.entity?.id,
        assetWorkingStatusName: String(assetInventories.working_status?.id ?? ""),
        status: Boolean((assetInventories.status as { id?: number } | undefined)?.id),
        updatedAt: assetInventories.updated_at ? new Date(assetInventories.updated_at) : new Date(),
      });
    }
  } else if (!assetInventories) {
    // Original: `else if (!assetInventories) { console.error(...); return null }`
    // — this is a sibling of the branch above, not gated on `existingData`
    // at all, so a failed/unavailable remote lookup ALWAYS resolves to
    // "not found" here even when a valid local row exists. Surprising, but
    // the original's real behavior — preserved rather than "fixed" to fall
    // back to the local row.
    throw new APIError(ErrCode.FailedPrecondition, "Healthcare Asset not found");
  }

  // Mirrors the original's exact return literal — note this really does
  // mean the response is (almost) entirely the *remote* payload when it's
  // available, with only `assetId` patched from local data as a fallback;
  // when the remote call fails/is unavailable, the response degrades to
  // just `{ assetId }` (spreading `undefined` contributes nothing) rather
  // than falling back to the full local row. That's the original's actual
  // behavior, not something to "fix" here.
  return {
    assetId:
      (assetInventories?.asset_id as string | null | undefined) ??
      existingData?.assetId ??
      existingDataById?.assetId ??
      null,
    ...assetInventories,
  };
}

export async function updateHealthcareAsset(
  input: {
    id: string;
    assetId?: string | null;
    healthcareFacilityId?: number;
    assetTypeName?: string;
    assetWorkingStatusName?: string;
    status?: boolean;
    createdAt?: string;
    updatedAt?: string;
  },
  token: string | undefined
): Promise<HealthcareAsset> {
  const numericId = Number(input.id);
  if (!numericId) {
    // Original use-case: `if (!id) throw new Error('ID is required to
    // update an asset model')` — a plain, un-flagged Error, uncaught by the
    // use-case's own try/catch (it wraps it in another plain Error and
    // rethrows), so it propagates to the controller's outer catch ->
    // res.error(...) -> 500, NOT a res.fail(...) 400. A plain Error (not
    // APIError) preserves that, same convention as entity-location's
    // updateEntityLocation/deleteEntityLocation.
    throw new Error("ID is required to update an asset model");
  }

  const parsed = updateHealthcareAssetBodySchema.safeParse(input);
  if (!parsed.success) {
    throw new APIError(ErrCode.InvalidArgument, parsed.error.issues[0]?.message ?? "Invalid request");
  }

  // Mirrors HealthcareAssetImpl.updateHealthcareAsset: when no local row
  // exists yet, fetches apps/core's asset-inventory record and auto-creates
  // a bare local row from it BEFORE applying the caller's update below —
  // unlike getHealthcareAssetById, this never returns "not found" just
  // because the remote lookup came back empty; if the row is missing both
  // locally and remotely, the original crashes on `assetInventories.id`
  // (undefined), which is preserved here as a clear thrown error instead of
  // a cryptic TypeError.
  const existing = await repo.findById(numericId);
  if (!existing) {
    const assetInventories = token ? await getAssetInventoryById(numericId, token) : undefined;
    if (!assetInventories) {
      throw new APIError(ErrCode.FailedPrecondition, "HealthcareFacilityAsset not found");
    }
    await repo.create({
      id: assetInventories.id,
      assetId: parsed.data.assetId ?? null,
      assetTypeName: assetInventories.asset_type?.name ?? "",
      // Mirrors the original's untyped `assetInventories.entity?.id` read
      // verbatim — no fallback there either, so this can end up storing an
      // undefined healthcareFacilityId if apps/core's response omits it.
      healthcareFacilityId: (assetInventories.entity?.id ?? parsed.data.healthcareFacilityId) as number,
      assetWorkingStatusName: String(assetInventories.working_status?.id ?? ""),
      createdAt: assetInventories.created_at ? new Date(assetInventories.created_at) : new Date(),
      updatedAt: assetInventories.updated_at ? new Date(assetInventories.updated_at) : new Date(),
    });
  }

  const updated = await repo.update(numericId, {
    assetId: parsed.data.assetId,
    assetTypeName: parsed.data.assetTypeName,
    healthcareFacilityId: parsed.data.healthcareFacilityId,
    assetWorkingStatusName: parsed.data.assetWorkingStatusName,
    status: parsed.data.status,
    updatedAt: parsed.data.updatedAt,
  });
  if (!updated) {
    throw new APIError(ErrCode.FailedPrecondition, "HealthcareFacilityAsset not found");
  }
  return updated;
}
