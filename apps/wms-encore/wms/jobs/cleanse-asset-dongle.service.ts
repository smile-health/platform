import * as repo from "./cleanse-asset-dongle.repository";

const PAGE_SIZE = 100;

// TODO(SMILE API client): the original (CleanseAssetDongleWasteScale.ts,
// getSmileAssetInventoryIds) calls an internal "SMILE" backend
// (`axios.create({ baseURL: process.env.SMILE_BE_URL })`) to fetch the
// canonical list of waste-scale asset-inventory ids for a facility:
//   POST {SMILE_BE_URL}/auth/login (form-encoded username/password — the
//     original falls back to hardcoded credentials 'albian'/'Smile12*' if
//     the env vars are unset, which is a real security issue, NOT
//     reproduced here — see the note below)
//   GET  {SMILE_BE_URL}/core/asset-inventories?paginate=100&health_center_id=
//     {entityId}&asset_type_ids=40
// Investigated as part of a later pass: apps/core DOES have a matching
// module today (apps/core/src/modules/asset-inventory/, mounted at
// /asset-inventories in apps/core/src/wire.ts — same GET /:id and GET /
// shape the original's SMILE_BE_URL calls expected), so the *data* endpoint
// itself is not the blocker. The blocker is authentication: the original
// logs in with a username/password grant against {SMILE_BE_URL}/auth/login,
// a custom endpoint that has no equivalent in apps/core (apps/core's auth is
// Keycloak-based — see apps/core/src/modules/auth/auth.keycloak.service.ts —
// and no client_credentials/service-account flow for calling apps/core
// machine-to-machine was found anywhere else in this monorepo to copy). Per
// this migration's approach of never guessing at authentication mechanics,
// this is left as an explicit gap for whoever owns the answer to how
// service-to-service calls against apps/core actually authenticate today,
// rather than invented here. The reconciliation engine below (grouping,
// action generation, action execution) is fully ported and ready to run —
// only this data source is missing. Until it's wired in, this throws so the
// job fails loudly (and skips that facility, logging why) instead of
// silently reconciling against an empty/wrong list, which could otherwise
// soft-delete or renumber real WMS assets.
//
// Security note for whoever wires this up: do NOT reproduce the original's
// hardcoded credential fallback (`SMILE_USERNAME || 'albian'`, `SMILE_PASSWORD
// || 'Smile12*'`) — require the env vars and fail startup if they're absent.
//
// Also note the original has a real bug worth fixing when this is wired up:
// getSmileAssetInventoryIds's pagination loop hardcodes `params.page = 1` on
// every iteration instead of using the incrementing loop variable, so any
// facility with more than 100 waste-scale assets in SMILE never gets pages
// 2+ — it just re-fetches page 1 `totalPage` times.
async function getSmileAssetInventoryIds(_entityId: number): Promise<number[]> {
  throw new Error(
    "cleanse-asset-dongle: SMILE backend client is not ported to wms-encore yet (SMILE_BE_URL asset-inventories API) — see TODO in cleanse-asset-dongle.service.ts",
  );
}

// Mirrors generateActions. Both branches are positional/index-based
// heuristics in the original (paired purely by array order, not by any real
// correlation key) — preserved faithfully rather than "fixed", since a
// smarter matching strategy would be a behavior change, not a port.
function generateActions(
  smileIds: number[],
  wmsAssets: repo.WmsAsset[],
  sameIds: number[],
  missingAssets: repo.WmsAsset[],
): repo.CleanseAction[] {
  const actions: repo.CleanseAction[] = [];

  if (sameIds.length === 0 && smileIds.length === missingAssets.length) {
    // Rule A: zero overlap and SMILE has exactly as many assets as WMS is
    // missing — assume a 1:1 positional id mismatch.
    for (let i = 0; i < missingAssets.length; i++) {
      actions.push({ type: "replace_id", oldId: missingAssets[i].id, newId: smileIds[i] });
    }
    return actions;
  }

  // Rule B.
  const sourceAssets = missingAssets.filter((a) => !!a.assetId);
  const targetAssets = wmsAssets.filter((a) => sameIds.includes(a.id) && !a.assetId);
  const pairCount = Math.min(sourceAssets.length, targetAssets.length);
  for (let i = 0; i < pairCount; i++) {
    actions.push({ type: "update_asset_id", id: targetAssets[i].id, assetId: sourceAssets[i].assetId as string });
  }
  if (missingAssets.length > 0) {
    // Note (preserved from the original): an asset used as a source for
    // update_asset_id above still gets deleted here — its asset_id value is
    // "transplanted" onto a different row, and its own row is removed.
    actions.push({ type: "delete", ids: missingAssets.map((a) => a.id) });
  }
  return actions;
}

async function reconcileEntity(entityId: number, wmsAssets: repo.WmsAsset[]): Promise<void> {
  let smileIds: number[];
  try {
    smileIds = await getSmileAssetInventoryIds(entityId);
  } catch (err) {
    // See getSmileAssetInventoryIds's TODO — expected until the SMILE
    // client is wired up. Skip this facility rather than reconcile against
    // no data (which would otherwise look like "everything is missing").
    console.warn(
      `cleanse-asset-dongle: skipping entity ${entityId} — ${err instanceof Error ? err.message : String(err)}`,
    );
    return;
  }

  const wmsIds = wmsAssets.map((a) => a.id);
  const sameIds = wmsIds.filter((id) => smileIds.includes(id));
  const missingAssets = wmsAssets.filter((a) => !smileIds.includes(a.id));

  const actions = generateActions(smileIds, wmsAssets, sameIds, missingAssets);
  for (const action of actions) {
    await repo.executeCleanseAction(action);
  }
}

// Mirrors cleanse-asset-dongle-waste-scale (CleanseAssetDongleWasteScale.ts):
// reconciles WMS `healthcare_asset` rows of type 'Waste Scale' against the
// SMILE backend's canonical per-facility asset-inventory list, fixing
// positionally-mismatched ids, transplanting orphaned asset_id values, and
// soft-deleting assets SMILE no longer reports.
//
// The original wraps its entire multi-page, multi-entity run in one
// Sequelize transaction with no explicit rollback on uncaught error (a gap
// noted in the porting research, not a feature to preserve). This port runs
// each entity's reconciliation independently instead of one giant
// transaction — Postgres/Kysely has no such implicit "everything or
// nothing" requirement here, and independent per-entity application matches
// how the SMILE-client TODO above already causes partial runs (some
// entities reconciled, some skipped) by necessity.
export async function runCleanseAssetDongleWasteScale(entityIds?: number[]): Promise<void> {
  let offset = 0;
  for (;;) {
    const assets = await repo.findWasteScaleAssets(entityIds, PAGE_SIZE, offset);
    if (assets.length === 0) break;

    const byEntity = new Map<number, repo.WmsAsset[]>();
    for (const asset of assets) {
      const list = byEntity.get(asset.entityId) ?? [];
      list.push(asset);
      byEntity.set(asset.entityId, list);
    }
    for (const [entityId, entityAssets] of byEntity) {
      await reconcileEntity(entityId, entityAssets);
    }

    if (assets.length < PAGE_SIZE) break;
    offset += PAGE_SIZE;
  }
}
