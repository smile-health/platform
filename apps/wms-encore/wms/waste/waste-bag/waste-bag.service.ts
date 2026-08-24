import { APIError, ErrCode } from "encore.dev/api";
import log from "encore.dev/log";
import {
  ScheduledEventTypes,
  wasteBagCreated,
  wasteBagStored,
  wasteBagTreatmentStarted,
  wasteBagTreated,
  wasteBagTransportRequested,
  wasteBagPickedUp,
  wasteBagHandedOverToTreatment,
  wasteBagReceivedForTreatment,
  wasteBagFinalized,
} from "../../messaging/topics";
import type {
  ScheduledEventTrigger,
  ScheduledEventType,
  ScheduledEventMetadata,
  WasteBagCreatedEvent,
  WasteBagStoredEvent,
  WasteBagTreatmentStartedEvent,
  WasteBagTreatedEvent,
  WasteBagTransportRequestedEvent,
  WasteBagPickedUpEvent,
  WasteBagHandedOverToTreatmentEvent,
  WasteBagReceivedForTreatmentEvent,
  WasteBagFinalizedEvent,
} from "../../messaging/topics";
import * as repo from "./waste-bag.repository";
import * as wasteClassificationRepo from "../waste-classification/waste-classification.repository";
import * as partnerVehicleRepo from "../../partnership/partner-vehicle/partner-vehicle.repository";
import * as wasteBagTreatmentGroupRepo from "../waste-bag-treatment-group/waste-bag-treatment-group.repository";
import { getEntityId } from "../../../core/entities/entities.repository";
import { getEntityRegionNames } from "../../../shared/core/entity-region-lookup";
import { isValidDateString } from "../../../shared/utils/date-range";
import { scheduling } from "~encore/clients";
import {
  createWasteBagSchema,
  bulkWasteBagQrCodeSchema,
  treatmentActionSchema,
  followUpTransportSchema,
  handoverTransportSchema,
  pickUpTransportExternalSchema,
  handoverTreatmentExternalSchema,
  receivingTreatmentExternalSchema,
} from "./waste-bag.schema";
import type {
  WasteBag,
  PaginatedWasteBags,
  BulkActionResult,
  WasteStatus,
  GetAllTransactionWasteBagsRequest,
} from "./waste-bag.types";

// ---------------------------------------------------------------------------
// Status-change publish — the load-bearing side effect this module exists to
// preserve. In the original, there is no dedicated "update status" endpoint;
// every lifecycle action below (createWasteBag/temporaryStore/coldStore/
// internalLandfill/sterilise/incinerate/transport follow-up & handover/etc.)
// mutates waste_status as a side effect of its own action and logs via
// WasteStatusUpdatePublisher.logInfo(...) at that point (see e.g.
// TemporaryStoreWaste.ts's `logInfo('...', 'WASTE_BAG_TEMPORARY_STORED', ...)`
// call). This port collapses all of those ad-hoc log events into 9
// milestone-specific topics (messaging/topics.ts) — one per real business
// occurrence — already relied upon by audit-trail and notification/, so
// every action that changes waste_status calls this helper exactly once per
// affected bag, instead of a standalone status endpoint. This is the
// refactor described in the module's brief: the earlier illustrative
// POST /api/v1/waste-bag/:id/status endpoint has been removed (it didn't
// correspond to any real original route) and its publish call now lives
// inside each real action via this helper.
// CORRECTION (previously wrong): this used to pass `scheduledEvent` through
// on the published event for scheduling/schedule-event to pick up via
// subscription. Scheduling had no OTHER reason to subscribe to this topic —
// unlike audit-trail (a genuinely-independent subscriber), scheduling
// creating a follow-up is a direct consequence of this specific call, not a
// fire-and-forget side effect — so it's a direct ~encore/clients call
// instead of pub/sub indirection. Audit-trail is unaffected: it still gets
// every transition via its topic subscriptions, same as before.
// CORRECTION (previously wrong): this also used to accept a pre-built
// `NotificationPayload` (title/message/type) for notification/ to relay
// verbatim. The waste service has no business deciding notification copy —
// that decision (and the `NOTIFICATION_EVENT_TYPE` template lookup) now
// lives entirely in notification/notification.service.ts, which subscribes
// to these same milestone topics and builds its own content from the raw
// domain data (`groupId`, `treatmentMethod`, etc.) carried below.
// CORRECTION (previously wrong): this used to take the destination Topic as a
// parameter (`topic: Topic<E>`) so one generic helper could publish onto any
// of the 9 milestone topics. Encore's static analyzer requires every
// `topic.publish(...)` call to be a literal, directly-resolvable reference to
// a module-level Topic constant — passing the topic through a function
// parameter breaks that ("invalid topic usage" at build time). Takes a
// `publish` callback instead, so every call site still writes the literal
// `wasteBagX.publish(event)` call itself (just wrapped in a one-line arrow),
// which Encore can see statically.
async function publishMilestone<E extends { wasteBagId: number; previousStatus: string; newStatus: string; updatedAt: string; createdBy: string }>(
  publish: (event: E) => Promise<void>,
  event: Omit<E, "updatedAt">,
  scheduledEvent?: ScheduledEventTrigger
): Promise<void> {
  await publish({ ...event, updatedAt: new Date().toISOString() } as E);

  if (scheduledEvent) {
    await scheduling.scheduleFollowUp({
      wasteBagId: event.wasteBagId,
      previousStatus: event.previousStatus,
      newStatus: event.newStatus,
      createdBy: event.createdBy,
      scheduledEvent,
    });
  }
}

// `buildTrigger`, when given, is called per-bag to compute that bag's
// ScheduledEventTrigger (or undefined, for transitions that don't need one) —
// see ScheduleEventForWasteStatusUpdateUseCase.ts: only a specific subset of
// transitions gets a follow-up, and its `scheduledAt` is always the real
// completion time, never a fixed offset.
async function publishMilestoneForBags<
  E extends { wasteBagId: number; previousStatus: string; newStatus: string; updatedAt: string; createdBy: string }
>(
  publish: (event: E) => Promise<void>,
  before: WasteBag[],
  newStatus: WasteStatus,
  createdBy: string,
  extra: (bag: WasteBag) => Omit<E, "wasteBagId" | "previousStatus" | "newStatus" | "updatedAt" | "createdBy">,
  buildTrigger?: (bag: WasteBag) => ScheduledEventTrigger | undefined
): Promise<void> {
  await Promise.all(
    before
      .filter((bag) => bag.id !== undefined)
      .map((bag) =>
        publishMilestone(
          publish,
          {
            wasteBagId: bag.id as number,
            previousStatus: bag.wasteStatus,
            newStatus,
            createdBy,
            ...extra(bag),
          } as unknown as Omit<E, "updatedAt">,
          buildTrigger?.(bag)
        )
      )
  );
}

// ---------------------------------------------------------------------------
// getAllWasteController — res.fail is never called here (only res.error on
// unexpected exceptions, which Encore's framework-level error handling
// already covers) — no APIError branches to mirror.
export async function getAllWasteBags(input: {
  limit?: number;
  page?: number;
  search?: string;
  healthcareId?: number;
  transporterId?: number;
  thirdPartyId?: number;
  wasteUpdateStart?: string;
  wasteUpdateEnd?: string;
  wasteClassificationId?: number[];
  transportationGroupId?: number;
  transportationExternalGroupId?: number;
  treatmentGroupId?: number;
  treatmentExternalGroupId?: number;
  ownedBy?: string;
  wasteStatus?: string;
  binNumber?: string;
  wasteBagQrCodeId?: string;
  id?: number;
  isTreated?: boolean;
  isDisposed?: boolean;
}): Promise<PaginatedWasteBags> {
  const safeLimit = input.limit && input.limit > 0 ? input.limit : 10;
  const safePage = input.page && input.page > 0 ? input.page : 1;
  return repo.findPaginated({ ...input, limit: safeLimit, page: safePage });
}

export async function getWasteBagById(id: string): Promise<WasteBag> {
  const numericId = Number(id);
  if (!id || Number.isNaN(numericId)) {
    throw new APIError(ErrCode.FailedPrecondition, "ID parameter is required");
  }
  const data = await repo.findById(numericId);
  if (!data) {
    throw new APIError(ErrCode.FailedPrecondition, "WasteBag not found");
  }
  return data;
}

// createWasteController — mirrors CreateWaste.ts / createWasteController.ts:
//   - missing bearer token -> isValidationError:true -> InvalidArgument
//     (the port has no equivalent "raw token" concept — auth:true already
//     guarantees a bearer token reached the handler, so this branch is
//     structurally unreachable here and is not reproduced)
//   - unknown wasteClassificationId -> use-case returns the string
//     'WASTE_CLASSIFICATION_NOT_FOUND', controller does res.fail(t(...), {message:...})
//     with NO isValidationError flag -> FailedPrecondition, not InvalidArgument
//     despite reading like a 404 — preserved verbatim (same class of bug as
//     global-settings's "not found but plain 400" cases).
//   - request-shape validation (this port's addition, not in the original,
//     which has no Zod layer on this route beyond createWasteSchema's own
//     checks) -> InvalidArgument.
export async function createWasteBag(input: {
  createdBy: string;
  healthcareFacilityId: number;
  wasteSourceId: number;
  wasteClassificationId: number;
  sourceTreatmentGroupId?: string;
  scaleMethod: string;
  weightInKgs?: number;
  wasteBagQrCodeId: string;
  assetId?: number;
  binNumber?: string;
  wasteGroupIds?: string;
  bastNo?: string;
  materialIds?: string;
  iotMethod?: string;
  isTreated?: boolean;
  isRadioActive?: boolean;
}): Promise<WasteBag> {
  const parsed = createWasteBagSchema.safeParse(input);
  if (!parsed.success) {
    throw new APIError(ErrCode.InvalidArgument, parsed.error.issues[0]?.message ?? "Invalid request");
  }

  // Ports CreateWaste.ts's wasteClassification lookup + isRadioActive branch.
  const wasteClassification = await wasteClassificationRepo.findById(parsed.data.wasteClassificationId);
  if (!wasteClassification) {
    // Original: use-case returns the string 'WASTE_CLASSIFICATION_NOT_FOUND',
    // controller does res.fail(t(...)) with no isValidationError flag ->
    // FailedPrecondition, not InvalidArgument, despite reading like a 404 —
    // preserved verbatim (documented at this function's top-level comment).
    throw new APIError(ErrCode.FailedPrecondition, "WASTE_CLASSIFICATION_NOT_FOUND");
  }

  const isRadioActive = input.isRadioActive ?? false;
  const startDate = new Date();
  // Original: `Number(getWasteClassification.minimunDecayDay) + 1` — when
  // minimunDecayDay is undefined this is `Number(undefined) + 1` = NaN;
  // preserved verbatim rather than defaulting to 0.
  const decayDay = Number(wasteClassification.minimunDecayDay) + 1;
  const scheduledStorageEndDatetime = isRadioActive
    ? new Date(startDate.getTime() + decayDay * 24 * 60 * 60 * 1000)
    : new Date(startDate.getTime() + Number(wasteClassification.tempStorageMaxHours ?? 0) * 60 * 60 * 1000);

  const wasteGroupIds = parsed.data.wasteGroupIds?.replace(/\s+/g, "");

  if (isRadioActive) {
    // Mirrors CreateWaste.ts's `checkData` lookup + in-place update branch —
    // when a row with this wasteBagQrCodeId already exists, update it
    // instead of inserting a new one (no status change, no publish; see
    // updateById's doc comment in the repository for why).
    const existing = await repo.findByQrCodeId(parsed.data.wasteBagQrCodeId);
    if (existing && existing.id !== undefined) {
      const updated = await repo.updateById(existing.id, {
        updatedBy: input.createdBy,
        scaleMethod: parsed.data.scaleMethod,
        weightInKgs: parsed.data.weightInKgs,
        binNumber: parsed.data.binNumber,
        iotMethod: parsed.data.iotMethod,
        wasteGroupIds,
        bastNo: parsed.data.bastNo,
        materialIds: parsed.data.materialIds,
        assetId: parsed.data.assetId,
      });
      if (updated) {
        return updated;
      }
    }
  }

  // Mirrors CreateWaste.ts's getEntityDetail(healthcareFacilityId, token)
  // enrichment (denormalized onto the row at insert time) — from the local
  // `entities`/`regions` tables rather than the HTTP round-trip.
  const entity = await getEntityId(parsed.data.healthcareFacilityId);
  const regionNames = await getEntityRegionNames(entity);

  const created = await repo.create({
    createdBy: input.createdBy,
    healthcareFacilityId: parsed.data.healthcareFacilityId,
    wasteSourceId: parsed.data.wasteSourceId,
    wasteClassificationId: parsed.data.wasteClassificationId,
    sourceTreatmentGroupId: parsed.data.sourceTreatmentGroupId,
    scaleMethod: parsed.data.scaleMethod,
    weightInKgs: parsed.data.weightInKgs,
    wasteBagQrCodeId: parsed.data.wasteBagQrCodeId,
    assetId: parsed.data.assetId,
    binNumber: parsed.data.binNumber,
    wasteGroupIds,
    bastNo: parsed.data.bastNo,
    materialIds: parsed.data.materialIds,
    iotMethod: parsed.data.iotMethod,
    isTreated: parsed.data.isTreated ?? false,
    scheduledStorageEndDatetime,
    healthcareFacilityName: entity?.name,
    ...regionNames,
  });

  // Original: after create, if wasteGroupIds is set, flips a readonly flag
  // on the referenced waste-bag-treatment-group rows.
  if (wasteGroupIds) {
    await wasteBagTreatmentGroupRepo.updateIsReadOnly(wasteGroupIds);
  }

  // Original logs 'WASTE_BAG_TEMPORARY_STORED' here (see CreateWaste.ts) —
  // a newly created bag has no "previous" in-app status, so previousStatus
  // mirrors the row's own initial value (self-transition) rather than an
  // empty string, keeping the event shape consistent for subscribers.
  await publishMilestone<WasteBagCreatedEvent>(async (e) => void (await wasteBagCreated.publish(e)), {
    wasteBagId: created.id as number,
    previousStatus: created.wasteStatus,
    newStatus: created.wasteStatus,
    createdBy: input.createdBy,
    initialStatus: created.wasteStatus,
  });
  return created;
}

// temporaryStoreWasteController / followUpTreatmentListController — both
// validate `wasteBagQrCodeIds` via the same schema shape and both call
// repository methods that move bags into IN_TEMPORARY_STORAGE (follow-up is
// the "list" precursor to storing; ListFollowUpTreatmentUseCase itself does
// not change waste_status in the original — only TemporaryStoreWaste.ts
// does, followUpTreatment just resolves which bags qualify. Modeled that way
// here too: followUpTreatmentList performs no status change / no publish.
export async function temporaryStoreWasteBags(input: {
  wasteBagQrCodeIds: string[];
  updatedBy: string;
}): Promise<BulkActionResult> {
  const parsed = bulkWasteBagQrCodeSchema.safeParse(input);
  if (!parsed.success) {
    throw new APIError(ErrCode.InvalidArgument, parsed.error.issues[0]?.message ?? "Invalid request");
  }

  const before = await repo.updateStatusByQrCodeIds(
    parsed.data.wasteBagQrCodeIds,
    "IN_TEMPORARY_STORAGE",
    input.updatedBy
  );
  if (before.length === 0) {
    // res.fail('Failed to store waste bag in temporary storage') — no flag
    throw new APIError(ErrCode.FailedPrecondition, "Failed to store waste bag in temporary storage");
  }
  // No scheduledEvent — IN_TEMPORARY_STORAGE isn't one of the original's
  // "_STARTED"/creation transitions that gets a follow-up (see
  // ScheduleEventForWasteStatusUpdateUseCase.ts's exact discriminator list).
  await publishMilestoneForBags<WasteBagStoredEvent>(
    async (e) => void (await wasteBagStored.publish(e)),
    before,
    "IN_TEMPORARY_STORAGE",
    input.updatedBy,
    () => ({ storageType: "TEMPORARY" as const })
  );
  return { affected: before.length };
}

export async function followUpTreatmentList(input: {
  wasteBagQrCodeIds: string[];
  updatedBy: string;
}): Promise<BulkActionResult> {
  const parsed = bulkWasteBagQrCodeSchema.safeParse(input);
  if (!parsed.success) {
    throw new APIError(ErrCode.InvalidArgument, parsed.error.issues[0]?.message ?? "Invalid request");
  }
  const bags = await repo.findManyByQrCodeIds(parsed.data.wasteBagQrCodeIds);
  return { affected: bags.length };
}

// coldStoreWasteController — mirrors ColdStoreWaste.ts:
//   - !isColdStored -> res.fail(no flag) -> FailedPrecondition
//   - typeof isColdStored === 'string' -> res.fail(t(...), no flag) -> FailedPrecondition
export async function coldStoreWasteBags(input: {
  wasteBagQrCodeIds: string[];
  endTime?: string;
  createdBy: string;
}): Promise<BulkActionResult> {
  const parsed = bulkWasteBagQrCodeSchema.safeParse(input);
  if (!parsed.success) {
    throw new APIError(ErrCode.InvalidArgument, parsed.error.issues[0]?.message ?? "Invalid request");
  }

  const before = await repo.updateStatusByQrCodeIds(
    parsed.data.wasteBagQrCodeIds,
    "IN_COLD_STORAGE",
    input.createdBy
  );
  if (before.length === 0) {
    throw new APIError(ErrCode.FailedPrecondition, "Failed to store waste bag in cold storage");
  }
  // Mirrors ColdStoreWaste.ts: WASTE_BAG_COLD_STORED_STARTED, with
  // scheduledAt = metadata.endTime (no treatmentEndTime concept here) —
  // defaults to "now" when the caller didn't supply endTime, same as the
  // original's `data.endTime ? new Date(data.endTime) : new Date()`.
  const coldStoreStartTime = new Date().toISOString();
  const coldStoreEndTime = parsed.data.endTime ? new Date(parsed.data.endTime).toISOString() : coldStoreStartTime;
  await publishMilestoneForBags<WasteBagStoredEvent>(
    async (e) => void (await wasteBagStored.publish(e)),
    before,
    "IN_COLD_STORAGE",
    input.createdBy,
    () => ({ storageType: "COLD" as const }),
    (bag) => ({
      scheduledEventType: ScheduledEventTypes.WasteBagColdStoredStarted,
      scheduledAt: coldStoreEndTime,
      metadata: {
        wasteBagId: bag.id,
        createdBy: input.createdBy,
        startTime: coldStoreStartTime,
        endTime: coldStoreEndTime,
        isGroup: true,
        entityId: bag.healthcareFacilityId,
      },
    })
  );
  return { affected: before.length };
}

// internalLandfillWasteBagController / sterilisedWasteBagController /
// incinerateWasteBagController — all three share the same
// null->FailedPrecondition, string->InvalidArgument shape (InternalLandfill.ts,
// AutoClaveWasteBag.ts, IncinerateWasteBag.ts each return
// null | string | boolean via `postTreatment`).
// eventType distinguishes InternalLandfill.ts / AutoClaveWasteBag.ts /
// IncinerateWasteBag.ts's respective "_STARTED" events — all three share the
// same shape (treatmentStartTime/treatmentEndTime -> metadata, scheduledAt =
// treatmentEndTime) per ScheduleEventForWasteStatusUpdateUseCase.ts.
async function runTreatmentAction(
  input: { wasteBagQrCodeIds: string[]; treatmentStartTime: string; treatmentEndTime: string; createdBy: string },
  newStatus: WasteStatus,
  eventType: ScheduledEventType,
  treatmentMethod: "LANDFILL" | "INCINERATION" | "STERILISATION"
): Promise<boolean> {
  const parsed = treatmentActionSchema.safeParse(input);
  if (!parsed.success) {
    throw new APIError(ErrCode.InvalidArgument, parsed.error.issues[0]?.message ?? "Invalid request");
  }

  const before = await repo.updateStatusByQrCodeIds(parsed.data.wasteBagQrCodeIds, newStatus, input.createdBy, {
    treatment_start_time: new Date(parsed.data.treatmentStartTime),
    treatment_end_time: new Date(parsed.data.treatmentEndTime),
  });
  if (before.length === 0) {
    // result === null -> res.fail('waste.error.UNCOMPLETED_ACTION_TYPE') -> FailedPrecondition
    throw new APIError(ErrCode.FailedPrecondition, "UNCOMPLETED_ACTION_TYPE");
  }
  // Announces the operator's start-of-treatment action (this port's status
  // column already jumps straight to the terminal value synchronously — see
  // this module's "IMPORTANT DEVIATION" comment further down — but the real
  // business milestone here is "treatment was started"; the matching
  // "treatment was completed" confirmation fires later, at treatmentEndTime,
  // from advanceScheduledWasteBagEvent's notification-only branch).
  await publishMilestoneForBags<WasteBagTreatmentStartedEvent>(
    async (e) => void (await wasteBagTreatmentStarted.publish(e)),
    before,
    newStatus,
    input.createdBy,
    () => ({ treatmentMethod, scheduledEndTime: parsed.data.treatmentEndTime }),
    (bag) => ({
      scheduledEventType: eventType,
      scheduledAt: parsed.data.treatmentEndTime,
      metadata: {
        wasteBagId: bag.id,
        createdBy: input.createdBy,
        treatmentStartTime: parsed.data.treatmentStartTime,
        treatmentEndTime: parsed.data.treatmentEndTime,
        isGroup: true,
        entityId: bag.healthcareFacilityId,
      },
    })
  );
  return true;
}

export async function internalLandfillWasteBags(input: {
  wasteBagQrCodeIds: string[];
  treatmentStartTime: string;
  treatmentEndTime: string;
  createdBy: string;
}): Promise<boolean> {
  return runTreatmentAction(input, "INTERNAL_LANDFILLED", ScheduledEventTypes.WasteBagInternalLandfillStarted, "LANDFILL");
}

export async function steriliseWasteBags(input: {
  wasteBagQrCodeIds: string[];
  treatmentStartTime: string;
  treatmentEndTime: string;
  createdBy: string;
}): Promise<boolean> {
  return runTreatmentAction(input, "STERILISED", ScheduledEventTypes.WasteBagSterilisedStarted, "STERILISATION");
}

export async function incinerateWasteBags(input: {
  wasteBagQrCodeIds: string[];
  treatmentStartTime: string;
  treatmentEndTime: string;
  createdBy: string;
}): Promise<boolean> {
  return runTreatmentAction(input, "INCINERATED", ScheduledEventTypes.WasteBagIncinerationStarted, "INCINERATION");
}

// followUpToTransporter / followUpToTransporterExternal — result===null ->
// FailedPrecondition, string result -> InvalidArgument.
export async function followUpTransportRequest(
  input: {
    wasteBagQrCodeIds: string[];
    providerType: string;
    transporterVehicleId?: number;
    vehicleNumber?: string;
    updatedBy: string;
    startTime?: string;
    endTime?: string;
  },
  // Mirrors TransportRequestedWasteBag.ts (internal) vs.
  // TransportExternalRequestedWasteBag.ts (external) — same shape/DTO, only
  // the eventType differs, per ScheduleEventForWasteStatusUpdateUseCase.ts's
  // distinct WASTE_BAG_FOLLOW_UP_TO_TRANSPORTER(_EXTERNAL) discriminators.
  eventType: ScheduledEventType = ScheduledEventTypes.WasteBagFollowUpToTransporter
): Promise<BulkActionResult> {
  const parsed = followUpTransportSchema.safeParse(input);
  if (!parsed.success) {
    throw new APIError(ErrCode.InvalidArgument, parsed.error.issues[0]?.message ?? "Invalid request");
  }
  const before = await repo.updateStatusByQrCodeIds(
    parsed.data.wasteBagQrCodeIds,
    "TRANSPORTATION_REQUEST_CREATED",
    input.updatedBy,
    { transportation_status: "REQUESTED", transportation_status_updated_at: new Date(), transportation_status_updated_by: input.updatedBy }
  );
  if (before.length === 0) {
    throw new APIError(ErrCode.FailedPrecondition, "UNCOMPLETED_ACTION_TYPE");
  }
  const followUpEndTime = parsed.data.endTime ?? new Date().toISOString();
  const isExternal = eventType === ScheduledEventTypes.WasteBagFollowUpToTransporterExternal;
  await publishMilestoneForBags<WasteBagTransportRequestedEvent>(
    async (e) => void (await wasteBagTransportRequested.publish(e)),
    before,
    "TRANSPORTATION_REQUEST_CREATED",
    input.updatedBy,
    () => ({ isExternal }),
    (bag) => ({
      scheduledEventType: eventType,
      scheduledAt: followUpEndTime,
      metadata: {
        wasteBagId: bag.id,
        createdBy: input.updatedBy,
        startTime: parsed.data.startTime,
        endTime: followUpEndTime,
        isGroup: true,
        entityId: bag.healthcareFacilityId,
      },
    })
  );
  return { affected: before.length };
}

export async function followUpTransportExternalRequest(input: {
  wasteBagQrCodeIds: string[];
  providerType: string;
  updatedBy: string;
  startTime?: string;
  endTime?: string;
}): Promise<BulkActionResult> {
  return followUpTransportRequest(input, ScheduledEventTypes.WasteBagFollowUpToTransporterExternal);
}

// handoverUpToTransporter / handoverUpToTransporterExternal — !result ->
// FailedPrecondition, string result -> InvalidArgument. File-upload
// requirement (`!req.file` -> InvalidArgument) is now enforced by
// handoverTransportSchema's manifestDocPath.min(1) check, folded into the
// same InvalidArgument branch as the original's isValidationError:true.
export async function handoverTransportRequest(
  input: {
    wasteTransportationGroupIds: number[];
    handoverLatitude: number;
    handoverLongitude: number;
    vehicleNumber: string;
    handoverTimestamp: string;
    manifestDocNumber: string;
    manifestDocPath: string;
    updatedBy: string;
  },
  // Mirrors HandOverTransport.ts (internal) vs. HandOverTransportExternal.ts
  // (external) — same shape, only the eventType differs.
  eventType: ScheduledEventType = ScheduledEventTypes.WasteBagHandoverToTransporter
): Promise<{ wasteBagQrCodeIds: string[] }> {
  const parsed = handoverTransportSchema.safeParse(input);
  if (!parsed.success) {
    throw new APIError(ErrCode.InvalidArgument, parsed.error.issues[0]?.message ?? "Invalid request");
  }

  // Ports HandOverTransport.ts / createHandoverTransportWasteBag. The
  // sibling waste-transportation-group module doesn't itself join/update
  // waste_bag (see that module's repository.ts TODOs) — but waste_bag
  // already carries waste_transportation_group_id, so the group->bag
  // resolution is done here directly against that column instead.
  const candidate = await repo.findReadyForTransportByGroupIds(parsed.data.wasteTransportationGroupIds);
  if (!candidate || candidate.transporterId == null) {
    // Original: `!wasteBagInstance` -> return 'NOT_FOUND' (string) -> falls
    // into the same UNCOMPLETED_ACTION_TYPE FailedPrecondition path other
    // group actions in this file use for their null/not-found branch.
    throw new APIError(ErrCode.FailedPrecondition, "UNCOMPLETED_ACTION_TYPE");
  }

  const vehicle = await partnerVehicleRepo.findByVehicleNumber(parsed.data.vehicleNumber, candidate.transporterId);
  if (!vehicle || vehicle.id === undefined) {
    // Original: `!vehicleId` -> return 'VEHICLE_NOT_FOUND' (string) ->
    // string-result branch -> InvalidArgument, same pattern as the other
    // group actions' "string result" comments in this file.
    throw new APIError(ErrCode.InvalidArgument, "VEHICLE_NOT_FOUND");
  }

  const after = await repo.applyHandoverTransport({
    wasteTransportationGroupIds: parsed.data.wasteTransportationGroupIds,
    handoverLatitude: parsed.data.handoverLatitude,
    handoverLongitude: parsed.data.handoverLongitude,
    vehicleId: vehicle.id,
    transporterOperatorId: parsed.data.transporterOperatorId,
    handoverTimestamp: new Date(parsed.data.handoverTimestamp),
    manifestDocNumber: parsed.data.manifestDocNumber,
    updatedBy: input.updatedBy,
  });
  if (after.length === 0) {
    throw new APIError(ErrCode.FailedPrecondition, "UNCOMPLETED_ACTION_TYPE");
  }

  // TODO: the original uploads the manifest doc image via
  // S3FileServiceRepository.uploadImage(...) then calls
  // updateFilePath(wasteTransportationGroupId, doc_number, document_path) —
  // this app has no MinIO/S3 client wired yet (wms-encore doesn't depend on
  // @smile-health/lib, see repo root CLAUDE.md) and manifestDocPath is
  // instead trusted as already-provided by the caller/schema. Follow up once
  // file storage is wired in this app.

  // applyHandoverTransport returns rows in their NEW state (post-update),
  // not the before/after pair updateStatusByQrCodeIds returns elsewhere —
  // the "before" status is always 'READY_FOR_TRANSPORT' by construction
  // (findReadyForTransportByGroupIds' own filter), so it's used as a literal
  // here rather than re-fetched.
  // Mirrors HandOverTransport.ts: metadata.endTime = data.handoverTimestamp
  // (not a separate endTime field) — scheduledAt uses that same value.
  const isExternal = eventType === ScheduledEventTypes.WasteBagHandoverToTransporterExternal;
  await Promise.all(
    after
      .filter((bag) => bag.id !== undefined)
      .map((bag) =>
        publishMilestone<WasteBagTransportRequestedEvent>(
          async (e) => void (await wasteBagTransportRequested.publish(e)),
          {
            wasteBagId: bag.id as number,
            previousStatus: "READY_FOR_TRANSPORT",
            newStatus: "TRANSPORTATION_REQUEST_CREATED",
            createdBy: input.updatedBy,
            isExternal,
          },
          {
            scheduledEventType: eventType,
            scheduledAt: parsed.data.handoverTimestamp,
            metadata: {
              wasteBagId: bag.id,
              createdBy: input.updatedBy,
              endTime: parsed.data.handoverTimestamp,
              isGroup: false,
              entityId: bag.healthcareFacilityId,
            },
          }
        )
      )
  );
  return { wasteBagQrCodeIds: after.map((b) => b.wasteBagQrCodeId as string) };
}

export async function handoverTransportExternalRequest(input: {
  wasteTransportationGroupIds: number[];
  handoverLatitude: number;
  handoverLongitude: number;
  vehicleNumber: string;
  handoverTimestamp: string;
  manifestDocNumber: string;
  manifestDocPath: string;
  updatedBy: string;
}): Promise<{ wasteBagQrCodeIds: string[] }> {
  return handoverTransportRequest(input, ScheduledEventTypes.WasteBagHandoverToTransporterExternal);
}

// pickUpToTransporterExternal — only a string-result branch in the original
// (no null check) -> InvalidArgument.
export async function pickUpTransportExternalRequest(input: {
  wasteTransportationExternalGroupIds: number[];
  healthcareFacilityId: number;
  handoverLatitude: number;
  handoverLongitude: number;
  updatedBy: string;
  transporterId: number;
  transporterOperatorId: string;
}): Promise<{ wasteBagQrCodeIds: string[]; healthcareFacilityId?: number }> {
  const parsed = pickUpTransportExternalSchema.safeParse(input);
  if (!parsed.success) {
    throw new APIError(ErrCode.InvalidArgument, parsed.error.issues[0]?.message ?? "Invalid request");
  }
  // Ports PickUpTransportExternal.ts / createPickUpTransportExternalWasteBag,
  // including its healthcareFacilityId/transporterId/transporterOperatorId
  // scoping — see applyPickUpTransportExternal's doc comment.
  const after = await repo.applyPickUpTransportExternal({
    wasteTransportationExternalGroupIds: parsed.data.wasteTransportationExternalGroupIds,
    healthcareFacilityId: parsed.data.healthcareFacilityId,
    transporterId: input.transporterId,
    transporterOperatorId: input.transporterOperatorId,
    handoverLatitude: parsed.data.handoverLatitude,
    handoverLongitude: parsed.data.handoverLongitude,
    treatmentProviderId: parsed.data.treatmentProviderId,
    treatmentOperatorId: parsed.data.treatmentOperatorId,
    isReadOnly: parsed.data.isReadOnly,
    updatedBy: input.updatedBy,
  });
  if (after.length === 0) {
    // Original: no null-check branch in the use-case for this one (only a
    // string-result "NOT_FOUND" -> InvalidArgument per this function's
    // top-level comment) — mirrored here as InvalidArgument, not
    // FailedPrecondition, unlike the other group actions in this file.
    throw new APIError(ErrCode.InvalidArgument, "NOT_FOUND");
  }

  // Mirrors PickUpTransportExternal.ts: WASTE_BAG_PICKUP_TO_TRANSPORTER_EXTERNAL.
  const pickupEndTime = parsed.data.endTime ?? new Date().toISOString();
  await Promise.all(
    after
      .filter((bag) => bag.id !== undefined)
      .map((bag) =>
        publishMilestone<WasteBagPickedUpEvent>(
          async (e) => void (await wasteBagPickedUp.publish(e)),
          {
            wasteBagId: bag.id as number,
            previousStatus: "TRANSPORTATION_REQUEST_CREATED",
            newStatus: "IN_TRANSIT",
            createdBy: input.updatedBy,
            transporterId: input.transporterId,
          },
          {
            scheduledEventType: ScheduledEventTypes.WasteBagPickupToTransporterExternal,
            scheduledAt: pickupEndTime,
            metadata: {
              wasteBagId: bag.id,
              createdBy: input.updatedBy,
              startTime: parsed.data.startTime,
              endTime: pickupEndTime,
              isGroup: false,
              entityId: bag.healthcareFacilityId,
            },
          }
        )
      )
  );
  return {
    wasteBagQrCodeIds: after.map((b) => b.wasteBagQrCodeId as string),
    healthcareFacilityId: after[0]?.healthcareFacilityId,
  };
}

// handoverToTreatmentExternal / receievmentUpToTreatmentExternal — string
// result -> InvalidArgument (no null/falsy branch in either).
export async function handoverTreatmentExternalRequest(input: {
  wasteTransportationExternalGroupIds: number[];
  startTime: string;
  endTime: string;
  treatmentLocationId: number;
  updatedBy: string;
}): Promise<{ wasteBagQrCodeIds: string[]; groupId?: number }> {
  const parsed = handoverTreatmentExternalSchema.safeParse(input);
  if (!parsed.success) {
    throw new APIError(ErrCode.InvalidArgument, parsed.error.issues[0]?.message ?? "Invalid request");
  }
  // Ports HandOverTreatmentExternal.ts / createHandoverTreatmentExternalWasteBag,
  // including its group-creation step (WasteTreatmentExternalGroupImpl.
  // createWasteTreatmentExternalGroup) — done directly against
  // waste_treatment_external_group in the repository, since the sibling
  // waste-treatment-external-group module currently exposes no "create",
  // only report/find helpers (see that module's repository.ts).
  const after = await repo.applyHandoverTreatmentExternal({
    wasteTransportationExternalGroupIds: parsed.data.wasteTransportationExternalGroupIds,
    treatmentProviderId: parsed.data.entityId ?? null,
    thirdPartyId: parsed.data.treatmentId,
    treatmentLocationId: parsed.data.treatmentLocationId,
    updatedBy: input.updatedBy,
  });
  if (after.length === 0) {
    // Original: no null/falsy branch here either — only string results
    // ('WASTE_TRANSPORTATION_GROUP_NOT_FOUND' / 'NOT_FOUND' /
    // 'TRANSPORTATION_GROUP_NOT_FOUND') -> InvalidArgument, per this
    // function's top-level comment ("string result -> InvalidArgument, no
    // null/falsy branch in either").
    throw new APIError(ErrCode.InvalidArgument, "NOT_FOUND");
  }

  // Mirrors HandOverTreatmentExternal.ts: WASTE_BAG_HANDOVER_TO_TREATMENT_EXTERNAL.
  await Promise.all(
    after
      .filter((bag) => bag.id !== undefined)
      .map((bag) =>
        publishMilestone<WasteBagHandedOverToTreatmentEvent>(
          async (e) => void (await wasteBagHandedOverToTreatment.publish(e)),
          {
            wasteBagId: bag.id as number,
            previousStatus: "TRANSPORTATION_REQUEST_CREATED",
            newStatus: "HANDOVER_TO_TREATMENT",
            createdBy: input.updatedBy,
          },
          {
            scheduledEventType: ScheduledEventTypes.WasteBagHandoverToTreatmentExternal,
            scheduledAt: parsed.data.endTime,
            metadata: {
              wasteBagId: bag.id,
              createdBy: input.updatedBy,
              startTime: parsed.data.startTime,
              endTime: parsed.data.endTime,
              isGroup: false,
              entityId: bag.healthcareFacilityId,
            },
          }
        )
      )
  );
  return { wasteBagQrCodeIds: after.map((b) => b.wasteBagQrCodeId as string) };
}

export async function receivingTreatmentExternalRequest(input: {
  wasteBagQrCodeIds: string[];
  startTime: string;
  endTime: string;
  updatedBy: string;
}): Promise<{ wasteBagQrCodeIds: string[]; groupId?: number }> {
  const parsed = receivingTreatmentExternalSchema.safeParse(input);
  if (!parsed.success) {
    throw new APIError(ErrCode.InvalidArgument, parsed.error.issues[0]?.message ?? "Invalid request");
  }
  const before = await repo.updateStatusByQrCodeIds(
    parsed.data.wasteBagQrCodeIds,
    "READY_FOR_TREATMENT",
    input.updatedBy
  );
  // Mirrors ReceivmentTreatmentExternal.ts: WASTE_BAG_RECEIVING_TO_TREATMENT_EXTERNAL,
  // defaulting startTime/endTime to "now" same as the original's
  // `data.startTime ?? new Date().toISOString()` / `data.endTime ?? ...`.
  const receivingStartTime = parsed.data.startTime ?? new Date().toISOString();
  const receivingEndTime = parsed.data.endTime ?? new Date().toISOString();
  await publishMilestoneForBags<WasteBagReceivedForTreatmentEvent>(
    async (e) => void (await wasteBagReceivedForTreatment.publish(e)),
    before,
    "READY_FOR_TREATMENT",
    input.updatedBy,
    () => ({}),
    (bag) => ({
      scheduledEventType: ScheduledEventTypes.WasteBagReceivingToTreatmentExternal,
      scheduledAt: receivingEndTime,
      metadata: {
        wasteBagId: bag.id,
        createdBy: input.updatedBy,
        startTime: receivingStartTime,
        endTime: receivingEndTime,
        isGroup: true,
        entityId: bag.healthcareFacilityId,
      },
    })
  );
  return { wasteBagQrCodeIds: before.map((b) => b.wasteBagQrCodeId as string) };
}

// ---- Reporting pass-throughs (reportWasteBagController.ts) ----------------

export async function getAllTransactionWasteBags(input: GetAllTransactionWasteBagsRequest) {
  const safeLimit = input.limit && input.limit > 0 ? input.limit : 10;
  const safePage = input.page && input.page > 0 ? input.page : 1;
  return repo.findTransactionsPaginated({ ...input, limit: safeLimit, page: safePage });
}

export async function getWasteBagSummaryByCharacteristics(input: {
  wasteUpdateStart?: string;
  wasteUpdateEnd?: string;
  healthcareId?: number;
}) {
  return repo.findSummaryByCharacteristics(input);
}

export async function getWasteSourceSummary(input: {
  wasteUpdateStart?: string;
  wasteUpdateEnd?: string;
  healthcareId?: number;
}) {
  return repo.findWasteSourceSummary(input);
}

export async function getWasteBagLogBook(input: { limit?: number; page?: number; healthcareId?: number }) {
  const safeLimit = input.limit && input.limit > 0 ? input.limit : 10;
  const safePage = input.page && input.page > 0 ? input.page : 1;
  return repo.findLogBookPaginated({ limit: safeLimit, page: safePage, healthcareId: input.healthcareId });
}

export async function getWasteBagHistory(input: { id?: number; limit?: number; page?: number }) {
  const safeLimit = input.limit && input.limit > 0 ? input.limit : 10;
  const safePage = input.page && input.page > 0 ? input.page : 1;
  return repo.findHistory({ id: input.id, limit: safeLimit, page: safePage });
}

export async function getWasteGroupDetails(wasteGroupId: string) {
  if (!wasteGroupId) {
    throw new APIError(ErrCode.FailedPrecondition, "wasteGroupId parameter is required");
  }
  const data = await repo.findWasteGroupDetails(wasteGroupId);
  if (!data) {
    throw new APIError(ErrCode.FailedPrecondition, "Waste group not found");
  }
  return data;
}

export async function getWasteBagInternalTreatmentDetails(wasteBagQrCodeId: string) {
  if (!wasteBagQrCodeId) {
    throw new APIError(ErrCode.FailedPrecondition, "wasteBagQrCodeId parameter is required");
  }
  const data = await repo.findInternalTreatmentDetails(wasteBagQrCodeId);
  if (!data) {
    throw new APIError(ErrCode.FailedPrecondition, "Waste bag not found");
  }
  return data;
}

// ---------------------------------------------------------------------------
// Scheduled-event advance — this domain's half of what used to live entirely
// inside scheduled-event-dispatcher/scheduled-event-dispatcher.service.ts
// (full port of ProcessScheduledEventUseCase.ts's waste-bag branch). Moved
// here because this module owns waste_bag and the precondition/mutation
// rules for it; the dispatcher is now a thin router that just calls this.
//
// IMPORTANT DEVIATION from a verbatim port, found while wiring this up live:
// this port's lifecycle actions above (runTreatmentAction, followUpTransportRequest,
// etc.) already write the bag's real next status SYNCHRONOUSLY at request
// time — unlike the original, which leaves the bag in an intermediate
// "_IN_PROCESS"/pre-transition status until THIS scheduled step later
// verifies a precondition and performs the actual transition. A verbatim port
// of the original's precondition checks against this port's synchronous
// design means several of the 15 event types would ALWAYS fail (the producer
// already wrote the bag past the state the precondition expects) — one type
// (WasteBagFollowUpToTransporter, which has no precondition check in the
// original at all) would be worse: it would silently regress the bag's
// status backward every time it fired. Audited all 15 event types against
// what each producer actually writes (see PR/session notes) and split them
// into three groups below instead of reusing one shared precondition+mutate
// path for all of them.
// Producer already completed the transition synchronously; the scheduled
// event's only remaining job is the original's deferred "done" notification
// (or, for ColdStoredStarted, genuinely nothing — the original's own
// notification call at that site is commented out). A status mismatch here
// is logged, not thrown — there's no real precondition left to enforce once
// the transition already happened at request time.
const NOTIFICATION_ONLY_TYPES: ReadonlySet<ScheduledEventType> = new Set([
  ScheduledEventTypes.WasteBagColdStoredStarted,
  ScheduledEventTypes.WasteBagInternalLandfillStarted,
  ScheduledEventTypes.WasteBagIncinerationStarted,
  ScheduledEventTypes.WasteBagSterilisedStarted,
]);

// No precondition in the original AND this port's producer (followUpTransportRequest)
// already advances the bag past READY_FOR_TRANSPORT by the time this fires —
// mutating here would silently regress it. True no-op: original has no
// notification call at this site either.
const NO_OP_TYPES: ReadonlySet<ScheduledEventType> = new Set([
  ScheduledEventTypes.WasteBagFollowUpToTransporter,
]);

// Real two-phase transitions: producer's synchronously-written status matches
// what the dispatcher's precondition (ported verbatim below) expects, and
// this step performs a genuine further mutation (transportationStatus
// refinement, or — for PickupToTransporterExternal/ReceivingToTreatmentExternal —
// disposal/treatment-method-driven branching the producer doesn't do itself).
interface WasteBagEventMetadata {
  wasteBagId: number;
  createdBy?: string;
  treatmentStartTime?: string;
  treatmentEndTime?: string;
  startTime?: string;
  endTime?: string;
  isGroup?: boolean;
  userId?: number;
}

export async function advanceScheduledWasteBagEvent(
  eventType: ScheduledEventType,
  metadata: ScheduledEventMetadata
): Promise<void> {
  const meta = metadata as unknown as WasteBagEventMetadata;
  const wasteBagId = Number(meta.wasteBagId);
  const createdBy = meta.createdBy ?? "system";

  const wasteBag = await repo.findById(wasteBagId);
  if (!wasteBag) {
    throw new Error(`Waste bag with ID ${meta.wasteBagId} not found`);
  }

  if (NOTIFICATION_ONLY_TYPES.has(eventType)) {
    const expectedFinal: Partial<Record<ScheduledEventType, WasteStatus>> = {
      [ScheduledEventTypes.WasteBagColdStoredStarted]: "IN_COLD_STORAGE",
      [ScheduledEventTypes.WasteBagInternalLandfillStarted]: "INTERNAL_LANDFILLED",
      [ScheduledEventTypes.WasteBagIncinerationStarted]: "INCINERATED",
      [ScheduledEventTypes.WasteBagSterilisedStarted]: "STERILISED",
    };
    const expected = expectedFinal[eventType];
    if (expected && wasteBag.wasteStatus !== expected) {
      log.warn("scheduled waste-bag event fired against unexpected status (notification-only path)", {
        eventType,
        wasteBagId,
        expected,
        actual: wasteBag.wasteStatus,
      });
    }

    const groupId = wasteBag.wasteTreatmentGroupId;
    // Self-transition (previousStatus === newStatus): nothing actually
    // changed at this step — this is the group-level completion confirmation
    // for a treatment that was already carried out synchronously by
    // runTreatmentAction. Only the 3 treatment types re-announce here (as
    // wasteBagTreated, carrying groupId for notification/ to decide whether a
    // group notice is due); ColdStoredStarted has genuinely nothing to do
    // beyond the sanity log above, same as the original.
    const treatmentMethod: "LANDFILL" | "INCINERATION" | "STERILISATION" | undefined =
      eventType === ScheduledEventTypes.WasteBagIncinerationStarted
        ? "INCINERATION"
        : eventType === ScheduledEventTypes.WasteBagSterilisedStarted
          ? "STERILISATION"
          : eventType === ScheduledEventTypes.WasteBagInternalLandfillStarted
            ? "LANDFILL"
            : undefined;
    if (treatmentMethod) {
      await publishMilestone<WasteBagTreatedEvent>(async (e) => void (await wasteBagTreated.publish(e)), {
        wasteBagId,
        previousStatus: wasteBag.wasteStatus,
        newStatus: wasteBag.wasteStatus,
        createdBy,
        groupId,
        userId: meta.userId,
        treatmentMethod,
      });
    }
    return;
  }

  if (NO_OP_TYPES.has(eventType)) {
    return;
  }

  // ---- Real two-phase types below: precondition-gated, ported verbatim ----
  const { disposalMethod, treatmentMethod } = await wasteClassificationRepo
    .findById(wasteBag.wasteClassificationId)
    .then((c) => ({ disposalMethod: c?.disposalMethod, treatmentMethod: c?.treatmentMethod }));

  const disposalMethodsArray = disposalMethod ? disposalMethod.split(",").map((m) => m.trim()) : [];
  const needRecycles = disposalMethodsArray.includes("TRANSPORTER_RECYCLER");
  const needGovTransport = disposalMethodsArray.includes("TRANSPORTER_GOVERNMENT");
  const needGovTransportWasteBank = disposalMethodsArray.includes("TRANSPORTER_GOVERNMENT_WASTE_BANK");
  const needSpecialTransport = disposalMethodsArray.includes("SPECIALIZED_TREATMENT_PROVIDER");

  const treatmentMethodsArray = treatmentMethod ? treatmentMethod.split(",").map((m) => m.trim()) : [];
  const hasDisinfection = treatmentMethodsArray.includes("DISINFECTION");
  const hasPyrolysis = treatmentMethodsArray.includes("PYROLYSIS");

  if (
    eventType === ScheduledEventTypes.WasteBagHandoverToTransporterExternal &&
    wasteBag.wasteStatus !== "TRANSPORTATION_REQUEST_CREATED"
  ) {
    throw "Invalid waste status for handover treatment external: " + wasteBag.wasteStatus;
  } else if (
    eventType === ScheduledEventTypes.WasteBagPickupToTransporterExternal &&
    wasteBag.wasteStatus !== "IN_TRANSIT"
  ) {
    throw "Invalid waste status for pickup to transporter external: " + wasteBag.wasteStatus;
  } else if (
    eventType === ScheduledEventTypes.WasteBagHandoverToTreatmentExternal &&
    wasteBag.wasteStatus !== "HANDOVER_TO_TREATMENT"
  ) {
    throw "Invalid waste status for handover treatment external: " + wasteBag.wasteStatus;
  } else if (
    eventType === ScheduledEventTypes.WasteBagReceivingToTreatmentExternal &&
    wasteBag.wasteStatus !== "READY_FOR_TREATMENT"
  ) {
    throw "Invalid waste status for receive treatment external: " + wasteBag.wasteStatus;
  }

  const patch: repo.ScheduledEventPatch = { wasteStatusUpdatedAt: new Date() };
  const groupId = wasteBag.wasteTreatmentGroupId;

  if (eventType === ScheduledEventTypes.WasteBagHandoverToTransporter) {
    patch.wasteStatus = "TRANSPORTATION_REQUEST_CREATED";
    patch.transportationStatus = "HANDED_OVER";
    patch.transportationStatusUpdatedAt = new Date();
  } else if (eventType === ScheduledEventTypes.WasteBagPickupToTransporterExternal) {
    patch.wasteStatus = "IN_TRANSIT";
    patch.transportationStatus = "IN_TRANSIT";
    patch.ownedBy = "TRANSPORTER";
    patch.transportationStatusUpdatedAt = new Date();

    if (wasteBag.wasteGroupIds && needRecycles) {
      patch.wasteStatus = "RECYCLED";
      patch.ownedBy = "THIRD_PARTY";
      patch.treatmentEndTime = new Date();
      patch.isTreated = true;
      patch.isDisposed = true;
    }
    if (needSpecialTransport) {
      patch.wasteStatus = "COLLECTED";
      patch.ownedBy = "THIRD_PARTY";
      patch.treatmentEndTime = new Date();
      patch.isDisposed = true;
      patch.isTreated = true;
    }
    if (needGovTransport) {
      patch.wasteStatus = "DISPOSED";
      patch.ownedBy = "THIRD_PARTY";
      patch.treatmentEndTime = new Date();
      patch.isDisposed = true;
      patch.isTreated = true;
    }
  } else if (eventType === ScheduledEventTypes.WasteBagHandoverToTransporterExternal) {
    patch.wasteStatus = "TRANSPORTATION_REQUEST_CREATED";
    patch.transportationStatus = "HANDED_OVER";
    patch.transportationStatusUpdatedAt = new Date();
  } else if (eventType === ScheduledEventTypes.WasteBagHandoverToTreatmentExternal) {
    patch.transportationStatus = "HANDED_OVER";
    patch.wasteStatus = "HANDOVER_TO_TREATMENT";
    patch.transportationStatusUpdatedAt = new Date();
  } else if (eventType === ScheduledEventTypes.WasteBagReceivingToTreatmentExternal) {
    patch.wasteStatus = "READY_FOR_TREATMENT";
    patch.ownedBy = "THIRD_PARTY";

    if (needGovTransportWasteBank) {
      patch.wasteStatus = "DISPOSED";
      patch.ownedBy = "THIRD_PARTY";
      patch.treatmentEndTime = new Date();
      patch.isDisposed = true;
      patch.isTreated = true;
    } else if (wasteBag.isTreated === false) {
      patch.wasteStatus = "IN_THIRD_PARTY_STORAGE";
      patch.ownedBy = "THIRD_PARTY";
    } else if (wasteBag.isTreated === true) {
      if (hasPyrolysis) {
        patch.wasteStatus = "LANDFILLED";
        patch.isTreated = true;
        patch.isDisposed = true;
        patch.treatmentEndTime = new Date();
      } else if (hasDisinfection) {
        patch.wasteStatus = "RECYCLED";
        patch.isTreated = true;
        patch.isDisposed = true;
        patch.treatmentEndTime = new Date();
      }
    }
  }
  // WasteBagFollowUpToTransporterExternal: precondition already ran above;
  // original has no dedicated mutation branch for it either (falls through
  // with only wasteStatusUpdatedAt touched, same as the dead-code types
  // Sterilised/Incinerates/Landfilled-External-Started and AlreadyReceived,
  // which have no producer call site in this port at all yet).

  await repo.applyScheduledEventPatch(wasteBagId, patch);

  // FIX (was a real gap, not present in the original): this branch's further
  // mutation (e.g. IN_TRANSIT -> RECYCLED/COLLECTED/DISPOSED) used to be
  // written directly with no announcement at all, so it never reached
  // audit-trail. Checked against the original: WasteStatusUpdatePublisher's
  // logInfoAsync calls inside these exact branches publish onto the SAME
  // queue/listener the synchronous actions use, which always fans out to the
  // audit-trail handler — so the original DOES audit this second transition.
  // Restoring that here (announces to audit-trail, and to notification/ when
  // the resulting status warrants one — that decision now lives entirely in
  // notification/, not here) — fired only when the status actually changed;
  // scheduling isn't called since these terminal states never need a
  // further follow-up.
  const FINALIZED_OUTCOMES = new Set<WasteStatus>([
    "RECYCLED",
    "LANDFILLED",
    "DISPOSED",
    "COLLECTED",
    "IN_THIRD_PARTY_STORAGE",
  ]);
  if (patch.wasteStatus && patch.wasteStatus !== wasteBag.wasteStatus) {
    if (FINALIZED_OUTCOMES.has(patch.wasteStatus)) {
      await publishMilestone<WasteBagFinalizedEvent>(async (e) => void (await wasteBagFinalized.publish(e)), {
        wasteBagId,
        previousStatus: wasteBag.wasteStatus,
        newStatus: patch.wasteStatus,
        createdBy,
        groupId,
        userId: meta.userId,
        outcome: patch.wasteStatus,
      });
    } else {
      // Only the internal WasteBagHandoverToTransporter branch changes
      // wasteStatus without landing on a finalized outcome (READY_FOR_TRANSPORT
      // -> TRANSPORTATION_REQUEST_CREATED) — the External variant and the
      // other event types either precondition on an already-matching status
      // (no real change) or have no mutation branch at all, per the comments
      // above each `if`.
      await publishMilestone<WasteBagTransportRequestedEvent>(
        async (e) => void (await wasteBagTransportRequested.publish(e)),
        {
          wasteBagId,
          previousStatus: wasteBag.wasteStatus,
          newStatus: patch.wasteStatus,
          createdBy,
          groupId,
          userId: meta.userId,
          isExternal: false,
        }
      );
    }
  }
}

// ---------------------------------------------------------------------------
// GET /api/v1/waste/waste-tracking-all/export
//
// Ports WasteTrackingAllExportExcelUseCase.execute + WasteTrackingExportExcel
// RepositoryImpl.exportWasteTrackingAllSheetsExcel (apps/wms-service, lines
// ~1193-1523): a 3-sheet workbook —
//   1. "Ringkasan Karakteristik Limbah" (per-characteristic totals/averages)
//   2. "Ringkasan per Sumber Limbah"    (per-source totals)
//   3. "Timbulan per Kantong Limbah"    (per-bag detail)
// — gated by checkAllSheetWasteTrackingAll(role, type): admin-only callers
// (role === 'admin', i.e. isOnlyAdmin in shared/utils/role.ts) get ONLY
// sheet 1 unless `type` (the caller's numeric entity.type, defaulted to 1 by
// the original when absent) equals 3; every other caller gets all 3 sheets.
//
// GAP: the original derives `type` from req.user?.entity?.type — a numeric
// entity-type id that AuthData (shared/auth/authHandler.ts) doesn't carry in
// this port (AuthData only has entityTypeName, a string). `type` is left at
// its original default of 1 here, so the `type !== 3` branch of the gate
// always holds for admin-role callers — i.e. admin-role callers always get
// the single-sheet form, same as most real traffic under the original's
// default. Flagged rather than silently dropped; revisit if entity.type
// needs to flow through AuthData for real.
//
// Cosmetic parity gap (same tradeoff already taken by
// exportWasteRecordCharacteristicsSummary above): the original's 3-line
// merged title block, thin cell borders, and B-column facility-name row
// merges are NOT reproduced — they're presentation-only and don't affect
// the data contract. The SUM formula total row IS reproduced per sheet,
// since that's a data-facing feature (matches the original's totals row).
export async function exportWasteTrackingAll(filters: {
  startDate?: string;
  endDate?: string;
  provinceId?: number;
  regencyId?: number;
  healthcareFacilityId?: number;
  role?: string;
  type?: number;
}): Promise<{ buffer: Buffer; filename: string }> {
  // Mirrors getWasteTrackingAllExportExcel's `if (!startDate || !endDate)
  // throw new Error(...)` guard — a plain Error, surfaced by the original's
  // catch-all as an unconditional 500. Extended to a real validity check
  // (not just truthy): the frontend's date-range picker sends the literal
  // placeholder string "-" for "nothing selected", which is truthy but not
  // a parseable date — Postgres rejects it outright (unlike MySQL, which
  // silently tolerated bad date literals), so this must reject it here
  // instead of letting it reach the query layer.
  if (!isValidDateString(filters.startDate) || !isValidDateString(filters.endDate)) {
    throw new APIError(ErrCode.Internal, "startDate and endDate are required.");
  }
  const { startDate, endDate } = filters;
  const role = filters.role ?? "admin";
  const type = filters.type ?? 1;

  // isOnlyAdmin(role) — shared/utils/role.ts's `role === 'admin'` check,
  // inlined here since no shared role-util module has been ported into
  // wms-encore yet (same gap as elsewhere in this codebase).
  const isOnlyAdminRole = role === "admin";
  const isAllTable = !(isOnlyAdminRole && type !== 3);

  const exportFilters = {
    startDate,
    endDate,
    provinceId: filters.provinceId,
    regencyId: filters.regencyId,
    healthcareFacilityId: filters.healthcareFacilityId,
  };

  const [characteristics, sources, bags] = await Promise.all([
    repo.findWasteTrackingCharacteristicsSummaryForExport(exportFilters),
    isAllTable ? repo.findWasteTrackingSourceSummaryForExport(exportFilters) : Promise.resolve([]),
    isAllTable ? repo.findWasteTrackingBagsForExport(exportFilters) : Promise.resolve([]),
  ]);

  // Loaded lazily, same reasoning as exportWasteRecordCharacteristicsSummary
  // above and dashboard-activity.service.ts's analogous export — only pull
  // in exceljs's writer machinery when an export is actually requested.
  const ExcelJS = (await import("exceljs")).default;

  const wb = new ExcelJS.Workbook();
  wb.creator = "WMS";
  wb.created = new Date();

  // ---------------- Sheet 1: Ringkasan Karakteristik Limbah ----------------
  const ws1 = wb.addWorksheet("Ringkasan Karakteristik Limbah");
  ws1.columns = [
    { key: "no", header: "No", width: 5 },
    { key: "healthcareFacilityName", header: "Fasyankes", width: 25 },
    { key: "wasteTypeName", header: "Jenis", width: 22 },
    { key: "wasteGroupName", header: "Kelompok", width: 16 },
    { key: "wasteCharacteristicsName", header: "Karakteristik", width: 20 },
    { key: "wasteStatus", header: "Tindak Lanjut", width: 20 },
    { key: "totalWeightInKgs", header: "Total Berat (Kg)", width: 18 },
    { key: "avgWeightPerDay", header: "Rata-rata berat per hari", width: 18 },
    { key: "totalWasteBag", header: "Jumlah kantong", width: 15 },
    { key: "avgWasteBagPerDay", header: "Jumlah Rata-rata kantong per hari (Kantong)", width: 22 },
  ];
  ws1.getRow(1).font = { bold: true };

  characteristics.forEach((item, idx) => {
    ws1.addRow({
      no: idx + 1,
      healthcareFacilityName: item.healthcareFacilityName,
      wasteTypeName: item.wasteTypeName,
      wasteGroupName: item.wasteGroupName,
      wasteCharacteristicsName: item.wasteCharacteristicsName,
      wasteStatus: WASTE_STATUS[item.wasteStatus as string] ?? item.wasteStatus,
      totalWeightInKgs: Number(item.totalWeightInKgs) || 0,
      avgWeightPerDay: Number(item.avgWeightPerDay) || 0,
      totalWasteBag: Number(item.totalWasteBag) || 0,
      avgWasteBagPerDay: Number(item.avgWasteBagPerDay) || 0,
    });
  });
  addTotalRow(ws1, characteristics.length, ["totalWeightInKgs", "avgWeightPerDay", "totalWasteBag", "avgWasteBagPerDay"], 2);

  if (!isAllTable) {
    const buffer = await wb.xlsx.writeBuffer();
    return { buffer: Buffer.from(buffer as ArrayBuffer), filename: exportFilename(startDate, endDate) };
  }

  // ---------------- Sheet 2: Ringkasan per Sumber Limbah ----------------
  const ws2 = wb.addWorksheet("Ringkasan per Sumber Limbah");
  ws2.columns = [
    { key: "no", header: "No", width: 5 },
    { key: "sourceType", header: "Tipe Sumber Limbah", width: 22 },
    { key: "wasteSourceName", header: "Nama Sumber Limbah", width: 30 },
    { key: "totalWasteBag", header: "Total Kantong Limbah", width: 15 },
    { key: "totalWeightInKgs", header: "Total Berat (Kg)", width: 18 },
  ];
  ws2.getRow(1).font = { bold: true };

  sources.forEach((item, idx) => {
    ws2.addRow({
      no: idx + 1,
      sourceType: item.sourceType,
      wasteSourceName: item.wasteSourceName,
      totalWasteBag: Number(item.totalWasteBag) || 0,
      totalWeightInKgs: Number(item.totalWeightInKgs) || 0,
    });
  });
  addTotalRow(ws2, sources.length, ["totalWasteBag", "totalWeightInKgs"], 1);

  // ---------------- Sheet 3: Timbulan per Kantong Limbah ----------------
  const ws3 = wb.addWorksheet("Timbulan per Kantong Limbah");
  ws3.columns = [
    { key: "no", header: "No", width: 5 },
    { key: "qrCode", header: "Kode Kantong Limbah", width: 22 },
    { key: "wasteCode", header: "Kode Limbah", width: 16 },
    { key: "wasteTypeName", header: "Jenis Limbah", width: 22 },
    { key: "wasteGroupName", header: "Kelompok Limbah", width: 22 },
    { key: "wasteCharacteristicsName", header: "Karakteristik Limbah", width: 24 },
    { key: "wasteSource", header: "Sumber Limbah", width: 28 },
    { key: "transporterName", header: "Pengangkut", width: 22 },
    { key: "thirdPartyName", header: "Pengolah Limbah", width: 22 },
    { key: "checkInDate", header: "Tanggal Masuk", width: 20 },
    { key: "storageMax", header: "Maksimal Penyimpanan (Hari)", width: 22 },
    { key: "weightInKgs", header: "Berat Masuk (Kg)", width: 16 },
    { key: "firstName", header: "Nama Operator", width: 22 },
    { key: "wasteStatus", header: "Status", width: 16 },
  ];
  ws3.getRow(1).font = { bold: true };

  bags.forEach((item, idx) => {
    ws3.addRow({
      no: idx + 1,
      qrCode: item.qrCode,
      wasteCode: item.wasteCode || "-",
      wasteTypeName: item.wasteTypeName,
      wasteGroupName: item.wasteGroupName,
      wasteCharacteristicsName: item.wasteCharacteristicsName,
      wasteSource: item.wasteSource,
      transporterName: item.transporterName || "-",
      thirdPartyName: item.thirdPartyName || "-",
      checkInDate: item.checkInDate ? new Date(item.checkInDate as string) : null,
      storageMax: item.storageMax != null ? Number(item.storageMax) : "-",
      weightInKgs: Number(item.weightInKgs) || 0,
      firstName: item.firstName || "-",
      wasteStatus: WASTE_STATUS[item.wasteStatus as string] ?? item.wasteStatus,
    });
  });
  addTotalRow(ws3, bags.length, ["weightInKgs"], 1);

  const buffer = await wb.xlsx.writeBuffer();
  return { buffer: Buffer.from(buffer as ArrayBuffer), filename: exportFilename(startDate, endDate) };
}

// WASTE_STATUS label map — mirrors shared/utils/dictionary.ts's WASTE_STATUS
// (Indonesian labels), used by the original's export to render waste_status
// for both the characteristics summary and per-bag detail sheets.
const WASTE_STATUS: Record<string, string> = {
  IN_TEMPORARY_STORAGE: "Tersimpan",
  IN_COLD_STORAGE: "Penyimpanan Dingin",
  INTERNAL_LANDFILLED: "Ditimbus Internal",
  INCINERATED: "Diolah Insinerasi Internal",
  INCINERATION_IN_PROCESS: "Dalam Proses Insinerasi",
  STERILISED: "Diolah Autoklaf Internal",
  STERILIZATION_IN_PROCESS: "Sterilisasi / Disinfeksi",
  READY_FOR_TRANSPORT: "Siap Diangkut",
  TRANSPORTATION_REQUEST_CREATED: "Diserahkan ke Pengangkut",
  IN_TRANSIT: "Diangkut",
  HANDOVER_TO_TREATMENT: "Diserahkan ke Pengolah",
  READY_FOR_TREATMENT: "Diterima Pengolah",
  RECYCLED: "Didaur Ulang",
  LANDFILLED: "Residu",
  COLLECTED: "Diterima Pengangkutan Khusus",
  DISPOSED: "Pembuangan Sampah",
  IN_THIRD_PARTY_STORAGE: "Dalam Penyimpanan Pihak Ketiga",
};

function addTotalRow(
  ws: import("exceljs").Worksheet,
  dataRowCount: number,
  sumKeys: string[],
  labelCol: number
): void {
  const headerRowNum = 1;
  const firstDataRow = headerRowNum + 1;
  const lastDataRow = dataRowCount ? headerRowNum + dataRowCount : headerRowNum;
  const totalRow = ws.addRow([]);
  const totalRowNum = totalRow.number;

  ws.getCell(totalRowNum, labelCol).value = "Jumlah";
  ws.getCell(totalRowNum, labelCol).font = { bold: true };

  for (const key of sumKeys) {
    const colIndex = ws.columns.findIndex((c) => (c as { key?: string }).key === key) + 1;
    if (colIndex <= 0) continue;
    const cell = ws.getCell(totalRowNum, colIndex);
    if (dataRowCount) {
      const letter = ws.getColumn(colIndex).letter;
      cell.value = { formula: `SUM(${letter}${firstDataRow}:${letter}${lastDataRow})` };
    } else {
      cell.value = 0;
    }
    cell.font = { bold: true };
  }
}

function exportFilename(startDate: string, endDate: string): string {
  return `waste_all_${safeFilenamePart(startDate)}_${safeFilenamePart(endDate)}_${tsForFilename("Asia/Jakarta")}.xlsx`;
}

// Same tsForFilename/safeFilenamePart/buildContentDisposition trio as
// waste-bag-record.service.ts's export helpers (duplicated per-module rather
// than shared, matching that file's own precedent — no shared export-utils
// module exists yet in wms-encore).
function tsForFilename(tz = "Asia/Jakarta"): string {
  const d = new Date();
  const dtf = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const parts = Object.fromEntries(dtf.formatToParts(d).map((p) => [p.type, p.value]));
  return `${parts.year}${parts.month}${parts.day}_${parts.hour}${parts.minute}${parts.second}`;
}

function safeFilenamePart(s: unknown): string {
  return String(s ?? "")
    .trim()
    .replace(/[^\w.-]+/g, "-")
    .slice(0, 100);
}

export function buildContentDispositionForWasteTrackingExport(filename: string): string {
  const ascii = filename.replace(/[^\x20-\x7E]/g, "_");
  const rfc5987 = encodeURIComponent(filename);
  return `attachment; filename="${ascii}"; filename*=UTF-8''${rfc5987}`;
}
