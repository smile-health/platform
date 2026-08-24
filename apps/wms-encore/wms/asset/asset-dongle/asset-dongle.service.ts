import { APIError, ErrCode } from "encore.dev/api";
import * as repo from "./asset-dongle.repository";
import { createAssetDongleBodySchema } from "./asset-dongle.schema";
import type { AssetDongle, PaginatedAssetDongles } from "./asset-dongle.types";

// assetDongleController.ts's res.fail(...)/res.error(...) calls, mapped:
//   - createAssetDongle: use-case returns the string 'ALREADY_EXIST_IN_ASSET_ID'
//     when a dongle already exists for that assetId -> controller calls
//     res.fail(req.t(`asset-dongle.error.${data}`), { isValidationError: true })
//     -> 422 (InvalidArgument).
//   - createAssetDongle: request-shape validation (assetId required, via
//     validateRequest(createAssetDongleSchema) middleware, upstream of the
//     controller) -> a plain 400 in Express (express-validator style
//     middleware failures are not one of the res.fail flags) -> mapped here to
//     FailedPrecondition for the equivalent guard, since there's no
//     "always InvalidArgument" middleware behavior to preserve faithfully;
//     the ALREADY_EXIST case above is the one call site that must be 422.
//   - deleteAssetDongle: use-case returning null (not found) -> controller
//     calls res.fail(req.t('asset-dongle.error.NOT_FOUND')) — no flag -> plain
//     400 (FailedPrecondition).

export async function getAllAssetDongle(input: {
  limit?: number;
  page?: number;
  search?: string;
}): Promise<PaginatedAssetDongles> {
  const safeLimit = input.limit && input.limit > 0 ? input.limit : 10;
  const safePage = input.page && input.page > 0 ? input.page : 1;
  return repo.findPaginated({ limit: safeLimit, page: safePage, search: input.search });
}

export async function createAssetDongle(input: { assetId: string }): Promise<AssetDongle> {
  const parsed = createAssetDongleBodySchema.safeParse(input);
  if (!parsed.success) {
    // validateRequest(createAssetDongleSchema) middleware guard, upstream of
    // the original controller — no res.fail flag associated with it.
    throw new APIError(ErrCode.FailedPrecondition, parsed.error.issues[0]?.message ?? "Invalid request");
  }

  const existing = await repo.findById(parsed.data.assetId);
  if (existing) {
    // res.fail(req.t('asset-dongle.error.ALREADY_EXIST_IN_ASSET_ID'), { isValidationError: true })
    throw new APIError(ErrCode.InvalidArgument, "asset-dongle.error.ALREADY_EXIST_IN_ASSET_ID");
  }

  return repo.create(parsed.data.assetId);
}

export async function deleteAssetDongle(assetId: string, deletedBy?: number): Promise<null> {
  if (!assetId) {
    // Original use-case throws a plain Error('assetId is required...'),
    // caught by the controller's catch block -> res.error(...) -> 500. This
    // would be an unusual choice to preserve deliberately (a required path
    // param being empty should never actually reach here via Encore's
    // routing), so it's mapped to a 400 guard instead, consistent with how
    // this port treats "required identifier missing" everywhere else.
    throw new APIError(ErrCode.FailedPrecondition, "assetId is required to delete an asset dongle");
  }

  const deleted = await repo.deleteAssetDongle(assetId, deletedBy);
  if (!deleted) {
    // res.fail(req.t('asset-dongle.error.NOT_FOUND')) — no flag -> plain 400.
    throw new APIError(ErrCode.FailedPrecondition, "asset-dongle.error.NOT_FOUND");
  }
  return null;
}
