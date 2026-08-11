import { APIError, ErrCode } from "encore.dev/api";
import * as repo from "./bast.repository";
import { parseBoolean } from "./bast.utils";
import { confirmBastBodySchema, createBastBodySchema } from "./bast.schema";
import type {
  ConfirmBastRequest,
  CreateBastRequest,
  DisposalDetail,
  DisposalDetailItem,
  GetAllBastRequest,
  PaginatedDisposals,
} from "./bast.types";
import { findByUserUuid } from "../../users/users/users.repository";
import { getLocalEntityName } from "../../shared/core/entity-user-lookup";
import { notification } from "~encore/clients";

// Mirrors shared/types/notificationHelper.ts's REQUEST_BAST_NUMBER entry,
// already mapped to a real Novu workflow id in
// shared/notifications/notification-workflow-map.ts.
const REQUEST_BAST_NUMBER = {
  type: "bast.create_request",
  title: "Bast Number requested",
  message: (bastNo: string) => `Bast number ${bastNo} is ready to review`,
};

// Mirrors CreateDisposalUseCase.execute + createDispose controller.
//
// getEntityDetail(data.sender.entity_id, token) is skipped — the original
// only used it to build `entity` for sendMultiNotification, and (as with
// every other sendMultiNotification call site in this port) the actual
// Novu-triggering recipient is just the caller's own user id, not derived
// from that entity lookup at all.
export async function createDispose(input: CreateBastRequest): Promise<{ bast_no: string }> {
  const parsed = createBastBodySchema.safeParse(input);
  if (!parsed.success) {
    throw new APIError(ErrCode.InvalidArgument, parsed.error.issues[0]?.message ?? "Invalid request");
  }

  const result = await repo.createDisposal({
    bastNo: parsed.data.bast_no,
    description: parsed.data.disposal_comments,
    createdBy: parsed.data.user_created_by.user_uuid,
    createdName: parsed.data.user_created_by.username,
    entityId: parsed.data.sender.entity_id,
    entityName: parsed.data.sender.entity_name,
    items: parsed.data.disposal_items.map((item) => ({
      materialId: item.material_id,
      materialName: item.material_name,
      qty: item.qty,
    })),
  });

  if (result === null) {
    // Original: repo returns null when bast_no/sender.entity_id/user_uuid is
    // missing (already guaranteed by zod above) or "Disposal created failed"
    // when the insert didn't come back with a bast_no -> res.fail(...), a
    // plain 400 in the old envelope.
    throw new APIError(ErrCode.FailedPrecondition, "Creating disposed failed");
  }

  // Original also calls notificationService.sendMultiNotification(...) here
  // (NOTIFICATION_EVENT_TYPE.REQUEST_BAST_NUMBER). Ported via notification's
  // triggerPushNotification (Novu-backed) — recipient is the caller
  // (user_created_by), same recipient-is-the-caller quirk as
  // manual-scale-request/partnership.service.ts's notification calls.
  const creator = await findByUserUuid(parsed.data.user_created_by.user_uuid);
  if (creator?.id) {
    await notification.triggerPushNotification({
      userId: creator.id,
      title: REQUEST_BAST_NUMBER.title,
      message: REQUEST_BAST_NUMBER.message(result.bast_no),
      type: REQUEST_BAST_NUMBER.type,
    });
  }

  return result;
}

// Mirrors ConfirmDisposalUseCase.execute + confirmationBastNumber controller.
//
// TODO: original also calls rejectedDisposalBast(token, bastNo, reason) on
// rejection — PUT {SMILE_BE_URL}/wms/disposal/cancellation. Investigated:
// this is NOT a self-call into this repo's own wms-service (grepped every
// route file there for "disposal/cancellation" — no match), so it's a real
// external system this monorepo doesn't contain the other half of. Left
// unported rather than guessed at.
export async function confirmationBastNumber(input: ConfirmBastRequest & { userUuid: string }): Promise<boolean> {
  const parsed = confirmBastBodySchema.safeParse(input);
  if (!parsed.success) {
    throw new APIError(ErrCode.InvalidArgument, parsed.error.issues[0]?.message ?? "Invalid request");
  }

  const result = await repo.approvalDisposal(parsed.data.bastNo, parsed.data.status, input.userUuid, parsed.data.reason);
  if (!result) {
    // Original: `if (!data) res.fail('Update disposal bast number failed')`.
    throw new APIError(ErrCode.FailedPrecondition, "Update disposal bast number failed");
  }
  return result;
}

// Mirrors GetDisposalUseCase.execute + DisposalRepositoryImpl.getDisposal.
//
// receiver's name/role/address/entity_name are populated from the local
// `users`/`entities` tables (via findByUserUuid/getLocalEntityName) rather
// than the original's getUsersDetail(approvedBy, token) HTTP fallback.
export async function getDisposalDetail(bastNo: string): Promise<DisposalDetail> {
  const disposal = await repo.findByBastNo(bastNo);
  if (!disposal) {
    throw new APIError(ErrCode.FailedPrecondition, "Disposal not found");
  }

  const items = await repo.findItemsByBastNo(bastNo);

  const disposalItems: DisposalDetailItem[] = await Promise.all(
    items.map(async (item) => {
      const wasteBag = await repo.findWasteBagForMaterial(bastNo, item.materialId);
      const histories = wasteBag ? await repo.getWasteBagStatusHistory(wasteBag.waste_bag_qr_code_id) : [];

      return {
        id: item.id,
        material_id: item.materialId,
        name: item.materialName,
        qty: item.qty,
        waste_info: wasteBag
          ? {
              waste_bag_codes: wasteBag.waste_bag_qr_code_id,
              waste_bag_total_weight: wasteBag.weight_in_kgs,
              waste_bag_type_label: wasteBag.wasteTypeName,
              waste_bag_group_label: wasteBag.wasteGroupName,
              waste_bag_characteristics_label: wasteBag.wasteCharacteristicName,
              waste_bag_histories: histories,
            }
          : null,
      };
    })
  );

  const approver = disposal.approvedBy ? await findByUserUuid(disposal.approvedBy) : null;
  const entityName = approver ? await getLocalEntityName(approver.entityId) : undefined;

  return {
    bast_no: disposal.bastNo,
    receiver: {
      name: approver ? [approver.firstname, approver.lastname].filter(Boolean).join(" ") || null : null,
      role: approver?.roleLabel ?? null,
      address: approver?.address ?? null,
      user_uuid: disposal.approvedBy ?? null,
      entity_name: entityName ?? null,
    },
    disposal_items: disposalItems,
  };
}

// Mirrors GetAllDisposalUseCase.execute + getAllDisposalController's
// entity-scoping logic. isSuperAdmin/entityId/entityTypeName come from
// AuthData (shared/auth/authHandler.ts) in place of the original's
// req.user?.external_roles / req.user?.entity.id / req.user?.entity.entity_type.name.
export async function getAllDisposal(
  input: GetAllBastRequest & { callerEntityId: number; callerEntityType: string; isSuperAdmin: boolean }
): Promise<PaginatedDisposals | DisposalDetail> {
  if (input.bast_no) {
    return getDisposalDetail(input.bast_no);
  }

  const allowedTypes = ["healthcare_facility", "regency", "province", "central"];
  let resolvedEntityId = input.healthcareFacilityId;
  if (input.callerEntityId && allowedTypes.includes(input.callerEntityType) && !input.isSuperAdmin) {
    resolvedEntityId = input.callerEntityId;
  }

  const safeLimit = input.limit && input.limit > 0 ? input.limit : 10;
  const safePage = input.page && input.page > 0 ? input.page : 1;

  // Mirrors shared/utils/parseBoolean.ts's TRUE_SET/FALSE_SET (used by the
  // original controller via `parseBoolean(isRead.toString())`).
  const isReadBool = parseBoolean(input.isRead);

  return repo.findPaginated({
    limit: safeLimit,
    page: safePage,
    entityId: resolvedEntityId,
    search: input.search,
    status: input.status,
    isRead: isReadBool,
  });
}
