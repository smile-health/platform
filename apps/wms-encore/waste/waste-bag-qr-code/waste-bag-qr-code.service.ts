import { APIError, ErrCode } from "encore.dev/api";
import { IntKeyspace, expireInHours } from "encore.dev/storage/cache";
import { cacheCluster } from "../../shared/cache/cache";
import * as repo from "./waste-bag-qr-code.repository";
import {
  createWasteBagQrCodeSchema,
  updateWasteBagQrCodeSchema,
} from "./waste-bag-qr-code.schema";
import type {
  CreateWasteBagQrCodeItem,
  PaginatedWasteBagQrCode,
  WasteBagQrCode,
} from "./waste-bag-qr-code.types";

// wasteBagQrCodeController.ts's res.fail(...) calls: the plain 400s
// (FailedPrecondition, no options object) are the "ID/entityId parameter is
// required" guards. Every other res.fail(..., {isValidationError:true}) ->
// InvalidArgument (422) — including, importantly, the repository's
// 'NOT_FOUND' string returns for get/update, which the controller routes
// through the *string* branch (422), not the `data === null` branch (400).
// That `=== null` branch is dead code in the original: getWasteBagQrCodeById
// and the update use-case never actually return null for a not-found qrCode
// — only 'NOT_FOUND' (get) or null only when the *update*'s own existence
// check fails (a separate, real null path — see updateWasteBagQrCode below).

// Mirrors WasteBagQrCodeRepoitoryImpl.createWasteBagQrCode's daily counter:
// a per-day Redis INCR (48h TTL, refreshed on every increment) keeps the
// 4-digit prefix collision-free across concurrent creates on the same day.
const dailyCounter = new IntKeyspace<string>(cacheCluster, {
  keyPattern: "wastebag_qrcode_counter/:key",
  defaultExpiry: expireInHours(48),
});

async function newQrCode(): Promise<string> {
  const now = new Date();
  const dateKey = `${now.getFullYear()}-${(now.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${now.getDate().toString().padStart(2, "0")}`;

  const nextId = await dailyCounter.increment(dateKey, 1);
  const digits = nextId.toString().padStart(4, "0");

  const formattedDate = `${now.getDate().toString().padStart(2, "0")}${(now.getMonth() + 1)
    .toString()
    .padStart(2, "0")}${now.getFullYear()}`;
  return `${digits}${formattedDate}`;
}

export async function getWasteBagQrCodeById(qrCode: string, entityId: number): Promise<WasteBagQrCode> {
  // res.fail('ID parameter is required') — no flag -> FailedPrecondition (400)
  if (!qrCode) {
    throw new APIError(ErrCode.FailedPrecondition, "ID parameter is required");
  }
  // res.fail('entityId is required') — no flag -> FailedPrecondition (400)
  if (!entityId) {
    throw new APIError(ErrCode.FailedPrecondition, "entityId is required");
  }

  // Business rule ported from the original's pre-check against waste_bag
  // (see waste-bag-qr-code.repository.ts's findWasteBagByQrCode doc comment).
  const wasteBag = await repo.findWasteBagByQrCode(qrCode);
  if (wasteBag) {
    if (!wasteBag.minimunDecayDay) {
      // res.fail(t('...ALREADY_REGISTERED'), {isValidationError:true}) -> 422
      throw new APIError(ErrCode.InvalidArgument, "ALREADY_REGISTERED");
    }
    const nowDate = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" });
    const endDate = wasteBag.scheduledStorageEndDatetime
      ? new Date(wasteBag.scheduledStorageEndDatetime).toLocaleDateString("en-CA", {
          timeZone: "Asia/Jakarta",
        })
      : undefined;
    if (endDate && nowDate < endDate) {
      // res.fail(t('...RADIOACTIVE_STILL_IN_STORAGE'), {isValidationError:true}) -> 422
      throw new APIError(ErrCode.InvalidArgument, "RADIOACTIVE_STILL_IN_STORAGE");
    }
  }

  const data = await repo.findByQrCode(qrCode, entityId);
  if (!data) {
    // repo returns 'NOT_FOUND' (a string) here in the original, routed
    // through the isValidationError:true branch -> 422, NOT the plain
    // NOT_FOUND-message 400 branch. Preserved: this is InvalidArgument, not
    // ErrCode.NotFound.
    throw new APIError(ErrCode.InvalidArgument, "NOT_FOUND");
  }
  return data;
}

export async function getAllWasteBagQrCode(input: {
  limit?: number;
  page?: number;
  entityId: number;
  search?: string; // accepted, intentionally unused — see types.ts note
}): Promise<PaginatedWasteBagQrCode> {
  const { limit: safeLimit, page: safePage } = sanitizePagination(input.limit, input.page);
  return repo.findPaginated({
    limit: safeLimit,
    page: safePage,
    healthcareFacilityId: input.entityId,
  });
}

function sanitizePagination(
  limit?: number,
  page?: number
): { limit: number; page: number } {
  const maxLimit = 1000;
  const safeLimit = Number.isInteger(limit) && (limit as number) > 0 ? Math.min(limit as number, maxLimit) : 10;
  const safePage = Number.isInteger(page) && (page as number) > 0 ? (page as number) : 1;
  return { limit: safeLimit, page: safePage };
}

export async function createWasteBagQrCode(
  items: CreateWasteBagQrCodeItem[],
  createdBy: string
): Promise<WasteBagQrCode[]> {
  const parsed = createWasteBagQrCodeSchema.safeParse({ items });
  if (!parsed.success) {
    throw new APIError(ErrCode.InvalidArgument, parsed.error.issues[0]?.message ?? "Invalid request");
  }

  const wasteSourceIds = parsed.data.items
    .map((item) => item.wasteSourceId)
    .filter((id): id is number => id !== undefined);
  const wasteClassificationIds = parsed.data.items
    .map((item) => item.wasteClassificationId)
    .filter((id): id is number => id !== undefined);

  const [existingWasteSourceIds, existingClassificationIds] = await Promise.all([
    repo.existingWasteSourceIds(wasteSourceIds),
    repo.existingWasteClassificationIds(wasteClassificationIds),
  ]);

  const createdIds: number[] = [];
  for (const item of parsed.data.items) {
    if (item.wasteSourceId !== undefined && !existingWasteSourceIds.has(item.wasteSourceId)) {
      // Original: return 'NOT_FOUND_WS' -> isValidationError:true -> 422
      throw new APIError(ErrCode.InvalidArgument, "NOT_FOUND_WS");
    }
    if (
      item.wasteClassificationId !== undefined &&
      !existingClassificationIds.has(item.wasteClassificationId)
    ) {
      // Original: return 'NOT_FOUND_CLASSIFICATION' -> 422
      throw new APIError(ErrCode.InvalidArgument, "NOT_FOUND_CLASSIFICATION");
    }

    const inserts = await Promise.all(
      Array.from({ length: item.labelCount }, async () =>
        repo.create({
          createdBy,
          // Original DOES take healthcareFacilityId straight from the
          // request body for create (unlike update, which overrides it from
          // auth) — preserved as-is, defaulting to 0 if omitted, same as the
          // original's implicit `undefined` passthrough to the DB column.
          healthcareFacilityId: item.healthcareFacilityId ?? 0,
          wasteSourceId: item.wasteSourceId,
          wasteClassificationId: item.wasteClassificationId,
          qrCode: await newQrCode(),
        })
      )
    );
    createdIds.push(...inserts.map((row) => row.id as number));
  }

  return repo.findByIds(createdIds);
}

export async function updateWasteBagQrCode(input: {
  id: string; // qrCode — see types.ts note
  healthcareFacilityId: number; // from auth, not the body
  wasteSourceId?: number;
  wasteClassificationId?: number;
  qrCode: string;
}): Promise<WasteBagQrCode> {
  // res.fail('ID parameter is required') — no flag -> FailedPrecondition (400)
  if (!input.id) {
    throw new APIError(ErrCode.FailedPrecondition, "ID parameter is required");
  }

  const parsed = updateWasteBagQrCodeSchema.safeParse({
    wasteSourceId: input.wasteSourceId,
    wasteClassificationId: input.wasteClassificationId,
    qrCode: input.qrCode,
  });
  if (!parsed.success) {
    throw new APIError(ErrCode.InvalidArgument, parsed.error.issues[0]?.message ?? "Invalid request");
  }

  const existing = await repo.findByQrCode(input.id, input.healthcareFacilityId);
  if (!existing || existing.id === undefined) {
    // Original: use-case returns null here -> controller's `data === null`
    // branch -> res.fail(NOT_FOUND) with NO flag -> FailedPrecondition (400).
    // (Genuinely different from getWasteBagQrCodeById's not-found, which is
    // 422 — this really is the one real `null` path in the original.)
    throw new APIError(ErrCode.FailedPrecondition, "WasteBagQrCode not found");
  }

  // Deviation from the original: it calls
  // `wasteSourceRepository.getWasteSourceById(wasteSourceId.toString())`
  // unconditionally, which throws at runtime (TypeError on
  // `undefined.toString()`) if wasteSourceId is omitted from the body —
  // caught by the controller's try/catch and surfaced as a generic 500. This
  // port throws an explicit, documented 400 instead of reproducing the crash
  // (same convention as global-settings.service.ts's analogous deviations).
  if (input.wasteSourceId === undefined) {
    throw new APIError(ErrCode.FailedPrecondition, "wasteSourceId is required to update a waste bag qr code");
  }
  if (input.wasteClassificationId === undefined) {
    throw new APIError(
      ErrCode.FailedPrecondition,
      "wasteClassificationId is required to update a waste bag qr code"
    );
  }

  const [wasteSourceExists, classificationExists] = await Promise.all([
    repo.existingWasteSourceIds([input.wasteSourceId]),
    repo.existingWasteClassificationIds([input.wasteClassificationId]),
  ]);
  if (!wasteSourceExists.has(input.wasteSourceId)) {
    // Original: return `Qr Code Config with ID ${wasteSourceId} not found`
    // -> isValidationError:true -> 422
    throw new APIError(ErrCode.InvalidArgument, `Qr Code Config with ID ${input.wasteSourceId} not found`);
  }
  if (!classificationExists.has(input.wasteClassificationId)) {
    // Original: return `Waste Classification with ID ${id} not found` -> 422
    throw new APIError(
      ErrCode.InvalidArgument,
      `Waste Classification with ID ${input.wasteClassificationId} not found`
    );
  }

  await repo.updateById(existing.id, {
    healthcareFacilityId: input.healthcareFacilityId,
    wasteSourceId: input.wasteSourceId,
    wasteClassificationId: input.wasteClassificationId,
    qrCode: input.qrCode,
  });

  return {
    ...existing,
    healthcareFacilityId: input.healthcareFacilityId,
    wasteSourceId: input.wasteSourceId,
    wasteClassificationId: input.wasteClassificationId,
    qrCode: input.qrCode,
  };
}

export async function deleteWasteBagQrCode(id: string, deletedBy?: number): Promise<boolean> {
  // res.fail('ID parameter is required') — no flag -> FailedPrecondition (400)
  if (!id) {
    throw new APIError(ErrCode.FailedPrecondition, "ID parameter is required");
  }
  const numericId = Number(id);

  const deleted = await repo.softDeleteById(numericId, deletedBy);
  if (!deleted) {
    // Deviation from the original: WasteBagQrCodeRepoitoryImpl.
    // deleteWasteBagQrCode() returns the STRING 'NOT_FOUND' when the row
    // doesn't exist, and the controller's `if (!data)` check treats that
    // non-empty string as truthy — the not-found case silently falls through
    // to res.success('NOT_FOUND'), a real bug (200 OK with the literal
    // string "NOT_FOUND" as the payload). This port throws a proper error
    // instead of reproducing a false-success response, matching the
    // documented-deviation convention used throughout global-settings.service.ts.
    throw new APIError(ErrCode.FailedPrecondition, "NOT_FOUND");
  }
  return true;
}
