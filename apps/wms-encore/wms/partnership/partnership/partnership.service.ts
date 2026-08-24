import { APIError, ErrCode } from "encore.dev/api";
import log from "encore.dev/log";
import { StringKeyspace, expireInSeconds } from "encore.dev/storage/cache";
import { cacheCluster } from "../../../shared/cache/cache";
import * as repo from "./partnership.repository";
import { createPartnershipBodySchema, updatePartnershipBodySchema } from "./partnership.schema";
import { ScheduledEventTypes } from "../../messaging/topics";
import { scheduling, notification } from "~encore/clients";
import type { ScheduledEventTrigger, ScheduledEventMetadata } from "../../messaging/topics";
import { getLocalEntityName, getLocalUserName } from "../../../shared/core/entity-user-lookup";
import { findByUserUuid } from "../../../core/users/users.repository";
import type {
  CreatePartnershipInput,
  DeletePartnershipInput,
  FindOneThirdPartyInput,
  GetAllPartnershipsInput,
  GetHasMultiplePartnershipInput,
  GetPartnershipByThirdPartyAdminInput,
  GetWasteClassificationByConsumerIdAndProviderIdInput,
  GetWasteClassificationByHealthcareInput,
  HealthcareSelect,
  MultipleTransporterPartnership,
  PaginatedPartnershipWasteClassifications,
  PaginatedPartnerships,
  Partnership,
  PartnershipProviderType,
  PartnershipSelect,
  ThirdPartyMatch,
  UpdatePartnershipInput,
  WasteClassificationSelect,
} from "./partnership.types";

// partnershipController.ts's res.fail(...)/res.error(...) calls, audited call-by-call:
//   - createPartnership/updatePartnership: every plain Error thrown out of the use-case's
//     own try/catch (duplicate-partnership checks, missing wasteClassification) is rethrown
//     as another plain Error -> controller's outer catch -> res.error(...) -> 500
//     (ErrCode.Internal). validateRequest(...) middleware's own zod failure is the one path
//     mapped to isValidationError:true -> 422 (ErrCode.InvalidArgument).
//   - getPartnershipById/updatePartnership/deletePartnership: `if (!id) res.fail('ID
//     parameter is required')` — no flag -> 400 (ErrCode.FailedPrecondition).
//     `if (data === null) res.fail(...)` — also no flag -> 400.
//   - deletePartnership: `if (!data) res.fail('Data partnership tidak ada atau partnership
//     sudah digunakan di partnership operator')` — no flag -> 400.
//   - getHasMultiplePartnership/findOneThirdParty (not ported — see this module's
//     controller): `entityId required`/`wasteClassificationId required` calls DO pass
//     isValidationError:true -> 422.

const TRANSPORTER_ROUTE_PROVIDER_TYPES: PartnershipProviderType[] = [
  "TRANSPORTER",
  "TRANSPORTER_RECYCLER",
  "TRANSPORTER_SPECIALIZED_TREATMENT_PROVIDER",
  "TRANSPORTER_LANDFILL",
  "TRANSPORTER_TREATMENT",
  "TRANSPORTER_GOVERNMENT",
  "TRANSPORTER_GOVERNMENT_WASTE_BANK",
  "SPECIALIZED_TREATMENT_PROVIDER",
];
const NON_TRANSPORTER_ROUTE_PROVIDER_TYPES: PartnershipProviderType[] = ["RECYCLER", "TREATMENT", "LANDFILLER"];

// Mirrors CreatePartnership.ts's `for await` loop over wasteClassification[]
// exactly — one request can fan out into several created rows (one per waste
// classification), each independently duplicate-checked. Cross-service
// enrichment (getEntityDetail for the notification message) is now populated
// from the local `entities` table (see the notification block below);
// the notification/logInfo side-effect itself IS reproduced (via
// notification's triggerPushNotification, Novu-backed).
export async function createPartnership(input: CreatePartnershipInput): Promise<Partnership[]> {
  const parsed = createPartnershipBodySchema.safeParse(input);
  if (!parsed.success) {
    throw new APIError(ErrCode.InvalidArgument, parsed.error.issues[0]?.message ?? "Invalid request");
  }
  const body = parsed.data;

  if (!body.wasteClassification || body.wasteClassification.length === 0) {
    // Original: `throw new Error('wasteClassification must not be empty')` inside the
    // use-case's own try/catch -> rethrown -> controller's outer catch -> res.error(...) -> 500.
    throw new APIError(ErrCode.Internal, "wasteClassification must not be empty");
  }

  const created: Partnership[] = [];

  // Original also calls notificationService.sendMultiNotification(...) once
  // per created row (a pre-existing inefficiency — consumerId/providerId
  // don't change across the wasteClassification loop, so this sends the
  // exact same notification once per waste classification; preserved as-is,
  // not deduped, since the point is matching real behavior, not improving
  // it). Names/recipient resolved once here since they're loop-invariant,
  // and reused per iteration below — same notifications sent, no redundant
  // lookups. Recipient is the caller (input.createdBy), same
  // recipient-is-the-caller quirk as manual-scale-request.service.ts.
  const [healthcareFacilityName, thirdPartyName, creator] = await Promise.all([
    getLocalEntityName(body.consumerId),
    getLocalEntityName(body.providerId),
    findByUserUuid(input.createdBy),
  ]);

  for (const wc of body.wasteClassification) {
    let resolvedProviderType = wc.providerTypes;

    const hasMultipleTransporters = await repo.getWasteClassificationHasMultipleTransporters(
      wc.wasteClassificationId,
    );

    if (input.transporterId === undefined) {
      resolvedProviderType = body.providerType as any;
      const existing = hasMultipleTransporters
        ? await repo.findActiveByCondition({
            consumerId: body.consumerId,
            wasteClassificationId: wc.wasteClassificationId,
            providerTypeIn: TRANSPORTER_ROUTE_PROVIDER_TYPES,
            providerId: body.providerId,
          })
        : await repo.findActiveByCondition({
            consumerId: body.consumerId,
            wasteClassificationId: wc.wasteClassificationId,
            providerTypeIn: TRANSPORTER_ROUTE_PROVIDER_TYPES,
          });
      if (existing) {
        throw new APIError(
          ErrCode.Internal,
          `Partnership with providerId ${body.providerId} and wasteClassificationId ${wc.wasteClassificationId} already exists`,
        );
      }
    } else {
      const existing = await repo.findActiveByCondition({
        consumerId: body.consumerId,
        wasteClassificationId: wc.wasteClassificationId,
        providerTypeIn: NON_TRANSPORTER_ROUTE_PROVIDER_TYPES,
        providerId: body.providerId,
        transporterId: hasMultipleTransporters ? input.transporterId : undefined,
      });
      if (existing) {
        throw new APIError(
          ErrCode.Internal,
          `Partnership with providerId ${body.providerId} and wasteClassificationId ${wc.wasteClassificationId} already exists`,
        );
      }
    }

    const row = await repo.create({
      createdBy: input.createdBy,
      consumerId: body.consumerId,
      consumerType: body.consumerType,
      wasteClassificationId: wc.wasteClassificationId,
      providerId: body.providerId,
      providerType: resolvedProviderType,
      partnershipStatus: body.partnershipStatus,
      hasIncinerator: body.hasIncinerator,
      hasAutoclave: body.hasAutoclave,
      contractId: body.contractId,
      contractStartDate: body.contractStartDate,
      contractEndDate: body.contractEndDate,
      picName: body.picName,
      picPosition: body.picPosition,
      picPhoneNumber: body.picPhoneNumber,
      pricePerKg: wc.price,
      transporterId: input.transporterId,
    });

    if (creator?.id) {
      await notification.triggerPushNotification({
        userId: creator.id,
        title: PARTNERSHIP_NOTIFICATION_EVENT_TYPE.PARTNERSHIP_CREATED.title,
        message: PARTNERSHIP_NOTIFICATION_EVENT_TYPE.PARTNERSHIP_CREATED.message({
          healthcare_facility: healthcareFacilityName ?? "",
          third_party: thirdPartyName ?? "",
        }),
        type: PARTNERSHIP_NOTIFICATION_EVENT_TYPE.PARTNERSHIP_CREATED.type,
      });
    }
    created.push(row);

    // Mirrors CreatePartnership.ts raising PARTNERSHIP_CONTRACT_EXPIRED when a
    // contractEndDate is set on creation (see ScheduleEventForPartnershipUseCase.ts).
    // previousStatus intentionally empty — there is no prior status on create,
    // same convention as manual-scale-request.service.ts's createManualScaleRequest.
    const scheduledEvent = buildContractExpiryTrigger({
      id: row.id,
      consumerId: row.consumerId,
      createdBy: input.createdBy,
      contractStartDate: row.contractStartDate,
      contractEndDate: row.contractEndDate,
    });
    if (scheduledEvent) {
      await updateStatus({
        id: row.id,
        previousStatus: "",
        newStatus: row.partnershipStatus,
        createdBy: input.createdBy,
        scheduledEvent,
      });
    }
  }

  if (created.length === 0) {
    // Original: `return partnerships.length > 0 ? partnerships : null` -> controller:
    // `if (data === null) res.fail('Partnership failed to create')` — no flag -> 400.
    throw new APIError(ErrCode.FailedPrecondition, "Partnership failed to create");
  }
  return created;
}

// providerName/consumerName are populated from the local `entities` table
// (see shared/core/entity-user-lookup.ts) rather than the original's
// getEntityDetail(...) HTTP fallback to apps/core.
async function withProviderConsumerNames(partnership: Partnership): Promise<Partnership> {
  const [providerName, consumerName] = await Promise.all([
    getLocalEntityName(partnership.providerId),
    getLocalEntityName(partnership.consumerId),
  ]);
  return { ...partnership, providerName, consumerName };
}

export async function getPartnershipById(id: string): Promise<Partnership> {
  if (!id) {
    throw new APIError(ErrCode.FailedPrecondition, "ID parameter is required");
  }
  const partnership = await repo.findById(Number(id));
  if (!partnership) {
    throw new APIError(ErrCode.FailedPrecondition, "Partnership not found");
  }
  return withProviderConsumerNames(partnership);
}

export async function getAllPartnerships(input: GetAllPartnershipsInput): Promise<PaginatedPartnerships> {
  const limit = input.limit && Number.isFinite(input.limit) && input.limit > 0 ? input.limit : 10;
  const page = input.page && Number.isFinite(input.page) && input.page > 0 ? input.page : 1;

  const result = await repo.findAllPaginated({
    limit,
    page,
    entityId: input.entityId,
    entityTag: input.entityTag,
    search: input.search,
    providerId: input.providerId,
    consumerId: input.consumerId,
    wasteClassificationId: input.wasteClassificationId,
    partnershipStatus: input.partnershipStatus,
  });
  const data = await Promise.all(result.data.map(withProviderConsumerNames));
  return { ...result, data };
}

// Mirrors UpdatePartnership.ts: loads the existing row, nullish-coalesces
// every field the request omits back onto the existing value, and persists.
//
// NOT reproduced here (out of scope for this pass):
//   - the "sync contract dates to the parent (transporter-less) partnership"
//     side effect, gated on providerType being in a specific allow-list —
//     see UpdatePartnershipRepositoryImpl.updatePartnership()'s
//     shouldSyncDateToParent branch.
//   - the ScheduledEventsModel soft-delete+destroy of any
//     PARTNERSHIP_CONTRACT_EXPIRED row referencing this partnership
//     (contract-expiry-date scheduling isn't ported — scheduling/schedule-event's
//     PartnershipFollowUp handler uses a fixed 24h follow-up instead; see
//     that module's header comments).
//
// notificationService.sendMultiNotification(PARTNERSHIP_UPDATED) IS wired up
// (via notification's triggerPushNotification, Novu-backed) — see below.
//
// What IS wired up here: when this update actually changes partnershipStatus,
// service.updateStatus(...) below is invoked — the same pre-existing publish
// this module already exposed at POST /:id/status — so a real status
// transition through the full CRUD PUT endpoint feeds the same
// partnership-status-updated topic scheduling/schedule-event's
// "schedule-event-for-partnership" subscriber already listens on, instead of
// only ever firing when a caller hits the raw status endpoint directly.
export async function updatePartnership(input: UpdatePartnershipInput): Promise<Partnership | null> {
  if (!input.id) {
    throw new APIError(ErrCode.FailedPrecondition, "ID parameter is required");
  }

  const parsed = updatePartnershipBodySchema.safeParse(input);
  if (!parsed.success) {
    throw new APIError(ErrCode.InvalidArgument, parsed.error.issues[0]?.message ?? "Invalid request");
  }
  const body = parsed.data;

  const numericId = Number(input.id);
  const existing = await repo.findById(numericId);
  if (!existing) {
    return null;
  }

  const updated = await repo.update(numericId, {
    updatedBy: input.updatedBy,
    consumerId: body.consumerId,
    consumerType: body.consumerType,
    wasteClassificationId: body.wasteClassificationId ?? existing.wasteClassificationId,
    providerId: body.providerId,
    providerType: body.providerType,
    partnershipStatus: body.partnershipStatus,
    hasIncinerator: body.hasIncinerator,
    hasAutoclave: body.hasAutoclave,
    contractId: body.contractId ?? existing.contractId,
    contractStartDate: body.contractStartDate ?? existing.contractStartDate,
    contractEndDate: body.contractEndDate ?? existing.contractEndDate,
    picName: body.picName ?? existing.picName,
    picPosition: body.picPosition ?? existing.picPosition,
    picPhoneNumber: body.picPhoneNumber ?? existing.picPhoneNumber,
    pricePerKg: body.pricePerKg ?? existing.pricePerKg,
  });

  if (updated) {
    // PARTNERSHIP_CONTRACT_EXPIRED is only (re)triggered when this request
    // actually supplied a contractEndDate — not on every update that merely
    // carries the existing value forward via the `?? existing...` fallback
    // above. Mirrors UpdatePartnership.ts's contract-date scheduling, which
    // is owned by this function (not the generic status-transition path).
    const contractEndDateChanged = body.contractEndDate !== undefined;
    const scheduledEvent = contractEndDateChanged
      ? buildContractExpiryTrigger({
          id: numericId,
          consumerId: updated.consumerId,
          createdBy: input.updatedBy,
          contractStartDate: updated.contractStartDate,
          contractEndDate: updated.contractEndDate,
        })
      : undefined;

    // Mirrors the "sync contract dates to the parent (transporter-less)
    // partnership" side effect: allowedProviderTypes.includes(existing's OLD
    // providerType) && dates changed. Original compares Date objects with
    // `!==` (reference inequality against a freshly-parsed request value vs
    // a freshly-loaded DB value) — which is effectively always true whenever
    // either date is present, not a real value comparison. Ported as an
    // actual value comparison instead (getTime()) since reproducing the
    // reference-inequality quirk byte-for-byte would just mean "always sync
    // when providerType matches," which is more confusing to encode
    // literally than to state directly.
    const PARENT_SYNC_PROVIDER_TYPES: PartnershipProviderType[] = [
      "TRANSPORTER_RECYCLER",
      "TRANSPORTER_TREATMENT",
      "TRANSPORTER_LANDFILL",
      "SPECIALIZED_TREATMENT_PROVIDER",
      "TRANSPORTER_GOVERNMENT",
    ];
    const datesChanged =
      (existing.contractStartDate?.getTime() ?? null) !== (updated.contractStartDate?.getTime() ?? null) ||
      (existing.contractEndDate?.getTime() ?? null) !== (updated.contractEndDate?.getTime() ?? null);
    if (existing.providerType && PARENT_SYNC_PROVIDER_TYPES.includes(existing.providerType) && datesChanged) {
      await repo.syncContractDatesToParent({
        providerId: existing.providerId,
        wasteClassificationId: existing.wasteClassificationId,
        consumerId: existing.consumerId,
        contractStartDate: updated.contractStartDate,
        contractEndDate: updated.contractEndDate,
      });
    }

    if (existing.partnershipStatus !== updated.partnershipStatus) {
      await updateStatus({
        id: numericId,
        previousStatus: existing.partnershipStatus,
        newStatus: updated.partnershipStatus,
        createdBy: input.updatedBy,
        scheduledEvent,
      });
    } else if (scheduledEvent) {
      await updateStatus({
        id: numericId,
        previousStatus: updated.partnershipStatus,
        newStatus: updated.partnershipStatus,
        createdBy: input.updatedBy,
        scheduledEvent,
      });
    }

    // Original also calls notificationService.sendMultiNotification(...)
    // (PARTNERSHIP_UPDATED) here. Recipient is the caller (input.updatedBy),
    // same recipient-is-the-caller quirk as createPartnership above.
    const updater = await findByUserUuid(input.updatedBy);
    if (updater?.id) {
      await notification.triggerPushNotification({
        userId: updater.id,
        title: PARTNERSHIP_NOTIFICATION_EVENT_TYPE.PARTNERSHIP_UPDATED.title,
        message: PARTNERSHIP_NOTIFICATION_EVENT_TYPE.PARTNERSHIP_UPDATED.message({
          contract_id: String(numericId),
        }),
        type: PARTNERSHIP_NOTIFICATION_EVENT_TYPE.PARTNERSHIP_UPDATED.type,
      });
    }
  }

  return updated;
}

export async function deletePartnership(input: DeletePartnershipInput): Promise<boolean> {
  if (!input.id) {
    throw new APIError(ErrCode.FailedPrecondition, "ID parameter is required");
  }
  const numericId = Number(input.id);

  const existing = await repo.findById(numericId);
  if (!existing) {
    throw new APIError(
      ErrCode.FailedPrecondition,
      "Data partnership tidak ada atau partnership sudah digunakan di partnership operator",
    );
  }

  const inUse = await repo.hasOperatorMapUsage(numericId);
  if (inUse) {
    throw new APIError(
      ErrCode.FailedPrecondition,
      "Data partnership tidak ada atau partnership sudah digunakan di partnership operator",
    );
  }

  const deleted = await repo.softDelete(numericId, input.deletedBy);
  if (!deleted) {
    throw new APIError(
      ErrCode.FailedPrecondition,
      "Data partnership tidak ada atau partnership sudah digunakan di partnership operator",
    );
  }
  return true;
}

// Mirrors getPartnershipByThirdPartyAdmin() grouped-by-providerId listing.
// providerName is populated from the local `entities` table, same as
// withProviderConsumerNames above.
export async function getPartnershipByThirdPartyAdmin(
  input: GetPartnershipByThirdPartyAdminInput,
): Promise<PartnershipSelect[]> {
  const rows = await repo.findGroupedByProviderForThirdPartyAdmin(input);
  return Promise.all(
    rows.map(async (row) => ({
      id: row.id,
      providerId: row.providerId,
      providerName: await getLocalEntityName(row.providerId),
    })),
  );
}

// Mirrors GetHasMultiplePartnership.ts / getHasMultiplePartnership()'s raw-SQL query.
export async function getHasMultiplePartnership(
  input: GetHasMultiplePartnershipInput,
): Promise<MultipleTransporterPartnership[]> {
  if (!input.healthcareFacilityId) {
    throw new APIError(ErrCode.InvalidArgument, "entityId required");
  }
  if (!input.wasteClassificationIds.length) {
    throw new APIError(ErrCode.InvalidArgument, "wasteClassificationId required");
  }
  return repo.findMultipleTransporterPartnerships({
    healthcareFacilityId: input.healthcareFacilityId,
    wasteClassificationIds: input.wasteClassificationIds,
  });
}

// Mirrors findOneThirdParty()/FindOneThirdPartyUseCase.ts: same
// entityId-required/wasteClassificationId-required validation as
// getHasMultiplePartnership above (both raise with isValidationError:true ->
// 422/InvalidArgument in the original).
export async function findOneThirdParty(input: FindOneThirdPartyInput): Promise<ThirdPartyMatch | null> {
  if (!input.wasteClassificationIds.length) {
    throw new APIError(ErrCode.InvalidArgument, "wasteClassificationId required");
  }
  if (!input.transporterId || Number.isNaN(input.transporterId)) {
    throw new APIError(ErrCode.InvalidArgument, "transporterId required");
  }
  if (!input.healthcareFacilityId || Number.isNaN(input.healthcareFacilityId)) {
    throw new APIError(ErrCode.InvalidArgument, "entityId required");
  }
  return repo.findOneThirdParty({
    healthcareFacilityId: input.healthcareFacilityId,
    transporterId: input.transporterId,
    wasteClassificationIds: input.wasteClassificationIds,
  });
}

// Mirrors getHealthcareByThirdPartyAdmin() — see partnership.repository.ts's
// findConsumersForThirdPartyAdmin for the consumerName-enrichment simplification.
export async function getHealthcareByThirdPartyAdmin(entityId: number): Promise<HealthcareSelect[]> {
  return repo.findConsumersForThirdPartyAdmin(entityId);
}

// Mirrors getWasteClassificationByHealthcare()/GetWasteClassificationByHealthcareUseCase.ts.
export async function getWasteClassificationByHealthcare(
  input: GetWasteClassificationByHealthcareInput,
): Promise<WasteClassificationSelect[]> {
  if (!input.providerId || Number.isNaN(input.providerId)) {
    throw new APIError(ErrCode.InvalidArgument, "entityId required");
  }
  const rows = await repo.findWasteClassificationsByHealthcare({
    consumerId: Number(input.consumerId),
    providerId: input.providerId,
    isSameCompany: input.isSameCompany,
  });
  return rows.map((row) => ({
    id: row.id,
    wasteClassificationId: row.wasteClassificationId ?? 0,
    wasteCharacteristicName: row.wasteCharacteristicName,
    providerType: row.providerType,
    contractId: row.contractId,
    contractStartDate: row.contractStartDate,
    contractEndDate: row.contractEndDate,
    wasteCode: row.wasteCode,
  }));
}

// Mirrors getWasteClassificationByConsumerIdAndProviderId()/
// GetWasteClassificationByConsumerIdAndProviderIdUseCase.ts, including its
// paginationUtils.sanitizePaginationParams default (limit/page fall back to
// sane positive defaults, same convention as getAllPartnerships above).
export async function getWasteClassificationByConsumerIdAndProviderId(
  input: GetWasteClassificationByConsumerIdAndProviderIdInput,
): Promise<PaginatedPartnershipWasteClassifications> {
  if (!input.providerId) {
    throw new APIError(ErrCode.FailedPrecondition, "providerId parameter is required");
  }
  const limit = input.limit && Number.isFinite(input.limit) && input.limit > 0 ? input.limit : 10;
  const page = input.page && Number.isFinite(input.page) && input.page > 0 ? input.page : 1;

  return repo.findWasteClassificationsByConsumerAndProvider({
    limit,
    page,
    providerId: input.providerId,
    consumerId: input.consumerId,
  });
}

// ---------------------------------------------------------------------------
// updateStatus — pre-existing. CORRECTION (previously wrong): used to publish
// onto partnershipStatusUpdate for scheduling/schedule-event to pick up via
// subscription. That topic had exactly one subscriber (scheduling) and no
// other reason to exist, so this now calls scheduling directly via
// ~encore/clients whenever a ScheduledEventTrigger is present — a real
// cross-service RPC, just without the pub/sub indirection this relationship
// never needed. When no trigger is present, this is a no-op (there's nothing
// else left to notify — see messaging/topics.ts's note on the removed topic).
// Called both directly (POST /:id/status, below) and internally from
// updatePartnership() above whenever a PUT actually changes the status.
// ---------------------------------------------------------------------------
export async function updateStatus(input: {
  id: number;
  previousStatus: string;
  newStatus: string;
  createdBy: string;
  scheduledEvent?: ScheduledEventTrigger;
}): Promise<{ partnershipId: number; newStatus: string }> {
  if (input.scheduledEvent) {
    await scheduling.scheduleFollowUpForPartnership({
      partnershipId: input.id,
      previousStatus: input.previousStatus,
      newStatus: input.newStatus,
      createdBy: input.createdBy,
      scheduledEvent: input.scheduledEvent,
    });
  }

  return { partnershipId: input.id, newStatus: input.newStatus };
}

// Mirrors ScheduleEventForPartnershipUseCase.ts's PARTNERSHIP_CONTRACT_EXPIRED
// trigger: scheduledAt is the contract's real end date (metadata.endTime),
// not a fixed delay. Built here (not inline) so both createPartnership and
// updatePartnership can reuse the same shape whenever a contractEndDate is
// present/being set.
function buildContractExpiryTrigger(row: {
  id: number;
  consumerId: number;
  createdBy: string;
  contractStartDate?: Date | string | null;
  contractEndDate?: Date | string | null;
}): ScheduledEventTrigger | undefined {
  if (!row.contractEndDate) {
    return undefined;
  }
  const endTime = new Date(row.contractEndDate).toISOString();
  return {
    scheduledEventType: ScheduledEventTypes.PartnershipContractExpired,
    scheduledAt: endTime,
    metadata: {
      partnershipId: row.id,
      entityId: row.consumerId,
      createdBy: row.createdBy,
      startTime: row.contractStartDate ? new Date(row.contractStartDate).toISOString() : undefined,
      endTime,
    },
  };
}

// ---------------------------------------------------------------------------
// Scheduled-event advance — this domain's half of what used to live entirely
// inside scheduled-event-dispatcher/scheduled-event-dispatcher.service.ts
// (full port of ProcessScheduledEventUseCase.ts's PARTNERSHIP_CONTRACT_EXPIRED
// branch). Moved here because this module owns `partnership`; the dispatcher
// is now a thin router that just calls this. Unlike the waste-bag family,
// there's no synchronous-vs-precondition mismatch here — a contract's real
// expiry date is inherently in the future when scheduled, so this step is
// still the only place that actually flips the status.
const PARTNERSHIP_NOTIFICATION_EVENT_TYPE = {
  // Mirrors shared/types/notificationHelper.ts's PARTNERSHIP_CREATED/
  // _UPDATED entries, already mapped to real Novu workflow ids in
  // shared/notifications/notification-workflow-map.ts.
  PARTNERSHIP_CREATED: {
    type: "partnership.partnership_created",
    title: "New Partnership Created",
    message: (data: { healthcare_facility: string; third_party: string }) =>
      `A new partnership contract has been created between ${data.healthcare_facility} and ${data.third_party}.`,
  },
  PARTNERSHIP_UPDATED: {
    type: "partnership.partnership_updated",
    title: "Partnership Updated",
    message: (data: { contract_id: string }) =>
      `Partnership contract ${data.contract_id} has been updated. Please check the latest details.`,
  },
  PARTNERSHIP_EXPIRED_EXCEED: {
    type: "partnership.partnership_expired_exceed",
    title: "Partnership Expired",
    message: (data: { expiry_date: string }) =>
      `Partnerhsip contract has expired on ${data.expiry_date}`,
  },
  PARTNERSHIP_EXPIRED: {
    type: "partnership.partnership_expired",
    title: "Partnership Expiry Reminder",
    message: (data: { contract_id: number; expiry_date: string; days_remaining: number }) => {
      const dayText = data.days_remaining === 1 ? "tomorrow" : `in ${data.days_remaining} days`;
      return `Partnership contract ${data.contract_id} will expire ${dayText} on ${data.expiry_date}. Please review and renew if needed.`;
    },
  },
} as const;

// Mirrors the original's `redis.get(key)`/`redis.set(key, 'sent', 'EX', ttlSeconds)`
// dedup around the day-3/day-1 reminder, using wms-encore's real CacheCluster
// instead of the standalone ioredis client the original module used. Key
// shape (`partnership:sent/{id}:{daysRemaining}`) preserved verbatim;
// ttlSeconds is computed per-call from daysRemaining exactly as the original
// does, so this keyspace's own defaultExpiry is never actually relied on.
const partnershipReminderSentKeyspace = new StringKeyspace<string>(cacheCluster, {
  keyPattern: "partnership:sent/:key",
});

interface PartnershipEventMetadata {
  partnershipId: number;
  createdBy?: string;
  startTime?: string;
  endTime?: string;
  userId?: number;
}

// No existing domain event to piggyback on here (partnershipStatusUpdate was
// removed — see messaging/topics.ts's note), so this calls notification
// directly via ~encore/clients rather than publishing to anything.
async function notify(userId: number | undefined, title: string, message: string, type: string): Promise<void> {
  if (!userId) return;
  await notification.triggerPushNotification({ userId, title, message, type });
}

// Returns whether the contract actually expired on this call — the caller
// (scheduled-event-dispatcher) only deletes the scheduled-event row when
// this is true, mirroring the original's `removeEvent` call living strictly
// inside the `!isSameDay && scheduledAtDate < currentDate` branch, not on
// every invocation. The reminder-only path (daysRemaining === 3 or 1)
// returns false — the row must survive so a later tick can still expire it.
export async function expireContractIfDue(
  scheduledAt: string,
  metadata: ScheduledEventMetadata
): Promise<boolean> {
  const meta = metadata as unknown as PartnershipEventMetadata;
  let didExpire = false;

  const currentDate = new Date();
  const scheduledAtDate = new Date(scheduledAt);

  const formattedDate = scheduledAtDate.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const timeDifference = scheduledAtDate.getTime() - currentDate.getTime();
  const daysRemaining = Math.ceil(timeDifference / (1000 * 3600 * 24));
  const isSameDay = scheduledAtDate.toDateString() === currentDate.toDateString();

  if (!isSameDay && scheduledAtDate < currentDate) {
    didExpire = true;
    const partnershipStatus = await repo.updateStatusToExpired(meta.partnershipId);

    await notify(
      meta.userId,
      PARTNERSHIP_NOTIFICATION_EVENT_TYPE.PARTNERSHIP_EXPIRED_EXCEED.title,
      PARTNERSHIP_NOTIFICATION_EVENT_TYPE.PARTNERSHIP_EXPIRED_EXCEED.message({ expiry_date: formattedDate }),
      PARTNERSHIP_NOTIFICATION_EVENT_TYPE.PARTNERSHIP_EXPIRED_EXCEED.type
    );

    if (partnershipStatus) {
      log.info("Partnership contract expired successfully", {
        code: "PARTNERSHIP_CONTRACT_EXPIRED_INFO",
        partnershipId: meta.partnershipId,
        createdBy: meta.createdBy,
        startTime: meta.startTime,
        endTime: meta.endTime,
        partnershipStatus,
      });
    }
  }

  // Kirim notifikasi pada hari ke-3 dan hari ke-1 sebelum expired.
  if (daysRemaining === 3 || daysRemaining === 1) {
    const key = `${meta.partnershipId}:${daysRemaining}`;
    const alreadySent = await partnershipReminderSentKeyspace.get(key);

    if (!alreadySent) {
      await notify(
        meta.userId,
        PARTNERSHIP_NOTIFICATION_EVENT_TYPE.PARTNERSHIP_EXPIRED.title,
        PARTNERSHIP_NOTIFICATION_EVENT_TYPE.PARTNERSHIP_EXPIRED.message({
          contract_id: meta.partnershipId,
          expiry_date: formattedDate,
          days_remaining: daysRemaining,
        }),
        PARTNERSHIP_NOTIFICATION_EVENT_TYPE.PARTNERSHIP_EXPIRED.type
      );
    }

    const ttlSeconds = (daysRemaining + 2) * 24 * 60 * 60;
    if (ttlSeconds > 0) {
      await partnershipReminderSentKeyspace.set(key, "sent", { expiry: expireInSeconds(ttlSeconds) });
    }
  }

  return didExpire;
}

export interface PartnershipOperatorSummary {
  id: string | undefined;
  operatorName: string | null;
  role: Record<string, unknown> | undefined;
}

export interface ProviderNameAndOperatorsResult {
  transportPartnership: {
    providerId: number;
    providerName: string | undefined;
    partnershipOperatorsTransport: PartnershipOperatorSummary[];
  };
  treatmentPartnership: {
    providerId: number;
    providerName: string | undefined;
    partnershipOperatorsTreatment: PartnershipOperatorSummary[];
  };
}

// Mirrors PartnershipRepositoryImpl.getProviderNameAndListOperatorNameByHfIdAndwasteClassificationId
// exactly: two active partnerships for the same (consumerId=healthcareFacilityId,
// wasteClassificationId) — a "transporter leg" (transporter_id IS NULL,
// optionally narrowed to a given transporterId) and a "treatment leg"
// (transporter_id IS NOT NULL, optionally narrowed to a given thirdPartyId) —
// each enriched with its provider's name and its operators' names/roles.
//
// providerName/operatorName come from the local `entities`/`users` tables
// (shared/core/entity-user-lookup.ts) rather than the original's
// getEntityDetail/getUsersDetail HTTP fallback. Returns null when either leg
// has no active partnership — the original returns a plain string in that
// case ("No transporter partnership found for the given consumer and waste
// classification"), which its own callers never actually check for (they
// assign the whole result, string-or-object, straight onto a loosely-typed
// field) — null is the faithful "nothing to enrich with" outcome without
// reproducing that latent type looseness.
export async function getProviderNameAndListOperatorNameByHfIdAndWasteClassificationId(input: {
  healthcareFacilityId: number;
  wasteClassificationId: number;
  transporterId?: number;
  thirdPartyId?: number;
}): Promise<ProviderNameAndOperatorsResult | null> {
  const [transportPartnership, treatmentPartnership] = await Promise.all([
    repo.findActivePartnershipByTransporterCondition({
      consumerId: input.healthcareFacilityId,
      wasteClassificationId: input.wasteClassificationId,
      providerId: input.transporterId,
      transporterIdIsNull: true,
    }),
    repo.findActivePartnershipByTransporterCondition({
      consumerId: input.healthcareFacilityId,
      wasteClassificationId: input.wasteClassificationId,
      providerId: input.thirdPartyId,
      transporterIdIsNull: false,
    }),
  ]);

  if (!transportPartnership || !treatmentPartnership) {
    return null;
  }

  const buildOperators = async (
    providerId: number,
    transporterIdIsNull: boolean,
  ): Promise<PartnershipOperatorSummary[]> => {
    const operatorIds = await repo.findOperatorIdsForProviderConsumer({
      providerId,
      consumerId: input.healthcareFacilityId,
      transporterIdIsNull,
    });
    return Promise.all(
      operatorIds.map(async (operatorId) => {
        const [operatorName, operator] = await Promise.all([
          getLocalUserName(operatorId),
          findByUserUuid(operatorId),
        ]);
        return { id: operatorId, operatorName: operatorName ?? null, role: operator?.externalProperties };
      }),
    );
  };

  const [providerNameTransport, providerNameTreatment, partnershipOperatorsTransport, partnershipOperatorsTreatment] =
    await Promise.all([
      getLocalEntityName(transportPartnership.providerId),
      getLocalEntityName(treatmentPartnership.providerId),
      buildOperators(transportPartnership.providerId, true),
      buildOperators(treatmentPartnership.providerId, false),
    ]);

  return {
    transportPartnership: {
      providerId: transportPartnership.providerId,
      providerName: providerNameTransport,
      partnershipOperatorsTransport,
    },
    treatmentPartnership: {
      providerId: treatmentPartnership.providerId,
      providerName: providerNameTreatment,
      partnershipOperatorsTreatment,
    },
  };
}
