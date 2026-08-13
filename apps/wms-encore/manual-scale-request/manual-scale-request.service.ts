import { APIError, ErrCode } from "encore.dev/api";
import * as repo from "./manual-scale-request.repository";
import { activateManualScaleRequestSchema, manualScaleRequestBodySchema } from "./manual-scale-request.schema";
import { ScheduledEventTypes } from "../messaging/topics";
import type { ScheduledEventTrigger } from "../messaging/topics";
import { scheduling, notification } from "~encore/clients";
import type {
  ManualScaleRequest,
  PaginatedManualScaleRequests,
} from "./manual-scale-request.types";
import { getLocalEntityName, getLocalUserName } from "../shared/core/entity-user-lookup";
import { findByUserUuid } from "../users/users/users.repository";

// Mirrors shared/types/notificationHelper.ts's NOTIFICATION_EVENT_TYPE table
// (the MANUAL_REQUEST_* entries), already mapped to real Novu workflow ids in
// shared/notifications/notification-workflow-map.ts.
const NOTIFICATION_EVENT_TYPE = {
  MANUAL_REQUEST_CREATED: {
    type: "manual_request.manual_request_created",
    title: "Manual Weighing Request Submitted",
    message: (name: string) => `A manual weighing request has been submitted by ${name}`,
  },
  MANUAL_REQUEST_APPROVED: {
    type: "manual_request.manual_request_approved",
    title: "Manual Weighing Request Approved",
    message: (name: string) => `Manual weighing request has been approved by ${name}.`,
  },
  MANUAL_REQUEST_REJECTED: {
    type: "manual_request.manual_request_rejected",
    title: "Manual Weighing Request Rejected",
    message: (name: string) => `Manual weighing request has been rejected by ${name}.`,
  },
};

// manualScaleRequestController.ts's res.fail(...)/res.error(...) calls are all
// called with no options object -> plain 400s (FailedPrecondition), mirrored
// below as ErrCode.FailedPrecondition throws unless noted otherwise.

// CORRECTION (previously wrong): used to publish-and-forget onto
// manualScaleRequestStatus for scheduling/schedule-event to pick up via
// subscription (schedule-event.subscriptions.ts's "schedule-event-for-manual-request").
// That topic had exactly one subscriber and no other reason to exist, so this
// now calls scheduling directly via ~encore/clients whenever a
// ScheduledEventTrigger is present (only ever true on creation — see
// createManualScaleRequest below). Kept as its own entry point
// (POST /:id/status) alongside the full CRUD/approval flow below, same as
// partnership.service.ts's updateStatus.
export async function updateStatus(input: {
  id: number;
  previousStatus: string;
  newStatus: string;
  createdBy: string;
  scheduledEvent?: ScheduledEventTrigger;
}): Promise<{ manualScaleRequestId: number; newStatus: string }> {
  if (input.scheduledEvent) {
    await scheduling.scheduleFollowUpForManualRequest({
      manualScaleRequestId: input.id,
      previousStatus: input.previousStatus,
      newStatus: input.newStatus,
      createdBy: input.createdBy,
      scheduledEvent: input.scheduledEvent,
    });
  }

  return { manualScaleRequestId: input.id, newStatus: input.newStatus };
}

// Mirrors CreateManualScaleRequestUseCase.execute. requestedBy/entityId come
// from the authenticated caller (req.user?.user_uuid / req.user?.entity.id in
// the original controller), not from the request body.
export async function createManualScaleRequest(input: {
  requestedBy: string;
  entityId: number;
  isActive?: boolean;
  status?: "PENDING" | "APPROVED" | "REJECTED";
  approvalType: "TIME_BOUND" | "COUNT_BASED";
  validUntil?: string;
  countLimit?: number;
}): Promise<ManualScaleRequest> {
  const parsed = manualScaleRequestBodySchema.safeParse(input);
  if (!parsed.success) {
    throw new APIError(ErrCode.InvalidArgument, parsed.error.issues[0]?.message ?? "Invalid request");
  }

  // checkDataIsExist dedup guard: if a TIME_BOUND request already exists for
  // today, the original returns it as-is instead of creating a new one
  // (CreateManualScaleRequestUseCase.execute's `if (checkData) return checkData`).
  const existing = await repo.findExistingTimeBoundRequestToday(input.requestedBy);
  if (existing) {
    return existing;
  }

  const created = await repo.create({
    requestedBy: input.requestedBy,
    isActive: parsed.data.isActive,
    status: parsed.data.status,
    approvalType: parsed.data.approvalType,
    validUntil: parsed.data.validUntil,
    countLimit: parsed.data.countLimit,
    entityId: input.entityId,
  });

  // Original: this.services.logInfo('Manual request created successfully', ...)
  // via ManualScaleRequestPublisher — routes onto the same rabbitmq routing
  // key that manual-scale-request-status-updated (this module's structured
  // Pub/Sub topic) mirrors. Re-purposed here as a real status-change event
  // (previousStatus intentionally omitted/empty — there is no prior status on
  // create) so scheduling/schedule-event's follow-up job has something to key
  // off of for newly created requests, same intent as the original's log.
  //
  // Mirrors CreateUseCase.ts (~L50-61): creation is the only place that raises
  // START_MANUAL_SCALE_REQUEST — scheduledAt is result.updatedAt (fires on the
  // very next 1-minute cron poll, not a real delay), metadata carries
  // manualScaleId/createdBy/startTime(createdAt)/endTime(updatedAt).
  const createdId = created.id as number;
  const createdAt = (created.createdAt ?? new Date()).toISOString();
  const updatedAt = (created.updatedAt ?? new Date()).toISOString();
  await updateStatus({
    id: createdId,
    previousStatus: "",
    newStatus: created.status,
    createdBy: input.requestedBy,
    scheduledEvent: {
      scheduledEventType: ScheduledEventTypes.StartManualScaleRequest,
      scheduledAt: updatedAt,
      metadata: {
        manualScaleId: createdId,
        entityId: input.entityId,
        createdBy: input.requestedBy,
        startTime: createdAt,
        endTime: updatedAt,
      },
    },
  });

  // Original enriches the response with operatorName/entityName via
  // getUsersDetail/getEntityDetail (apps/wms-service's thirdPartyClient).
  // Ported here as a local-tables-only lookup — see
  // shared/core/entity-user-lookup.ts's header comment for why the HTTP
  // fallback to apps/core isn't reproduced (requires threading a bearer
  // token through this call chain, a separate piece of work).
  const [operatorName, entityName, requester] = await Promise.all([
    getLocalUserName(created.requestedBy),
    getLocalEntityName(created.entityId),
    findByUserUuid(created.requestedBy),
  ]);

  // Original also calls notificationService.sendMultiNotification(...) here
  // (NOTIFICATION_EVENT_TYPE.MANUAL_REQUEST_CREATED). Ported via
  // notification's triggerPushNotification (Novu-backed — see
  // notification.service.ts). Note: despite the "entity admins" framing in
  // the original's own naming, the actual (already Novu-migrated) recipient
  // is just `data.user` — the requester's own record — since
  // sendMultiNotification's forSuperAdmin/forAdmin/forOperator flags are
  // vestigial in the current implementation (packages/lib/rabbitmq/publisher.ts
  // triggers a single Novu subscriber keyed off `user.id`, it doesn't fan out
  // to multiple recipients by role). Preserved as-is rather than "fixed" to
  // notify a different audience than the original actually does today.
  if (requester?.id) {
    await notification.triggerPushNotification({
      userId: requester.id,
      title: NOTIFICATION_EVENT_TYPE.MANUAL_REQUEST_CREATED.title,
      message: NOTIFICATION_EVENT_TYPE.MANUAL_REQUEST_CREATED.message(operatorName ?? ""),
      type: NOTIFICATION_EVENT_TYPE.MANUAL_REQUEST_CREATED.type,
    });
  }

  return { ...created, operatorName, entityName };
}

// Mirrors GetAllManualScaleRequestUseCase.execute + getAllManualScaleRequest
// controller's entityId-scoping logic.
export async function getAllManualScaleRequests(input: {
  limit?: number;
  page?: number;
  entityId?: number;
  status?: string;
  isActive?: boolean;
  provinceId?: number;
  cityId?: number;
  startDate?: string;
  endDate?: string;
}): Promise<PaginatedManualScaleRequests> {
  const safeLimit = input.limit && input.limit > 0 ? input.limit : 10;
  const safePage = input.page && input.page > 0 ? input.page : 1;

  return repo.findPaginated({
    limit: safeLimit,
    page: safePage,
    entityId: input.entityId,
    status: input.status,
    isActive: input.isActive,
    provinceId: input.provinceId,
    cityId: input.cityId,
    startDate: input.startDate,
    endDate: input.endDate,
  });
}

// Mirrors PatchManualScaleRequestUseCase.execute + activateManualScaleRequest
// controller.
export async function activateManualScaleRequest(input: {
  id: number;
  status: "APPROVED" | "REJECTED";
  processedBy: string;
}): Promise<ManualScaleRequest> {
  const parsed = activateManualScaleRequestSchema.safeParse({ id: input.id, status: input.status });
  if (!parsed.success) {
    // res.fail('ID parameter is required') / thrown "Invalid or missing status..."
    // — both plain 400s in the original, no isValidationError flag.
    throw new APIError(ErrCode.FailedPrecondition, parsed.error.issues[0]?.message ?? "Invalid request");
  }

  const existing = await repo.findById(parsed.data.id);
  if (!existing) {
    // repo.activate returns null for a missing row -> use-case returns null ->
    // controller's implicit fallthrough. The original never actually surfaces
    // a distinct "not found" message here (it goes straight to
    // `data === null` with no res.fail call before reaching the notification
    // step, which would then throw on undefined fields) — a pre-existing gap,
    // not reproduced; we fail fast with a clear message instead.
    throw new APIError(ErrCode.FailedPrecondition, "Manual scale request not found");
  }

  const result = await repo.activate(parsed.data.id, input.processedBy, parsed.data.status);
  if (result === null) {
    throw new APIError(ErrCode.FailedPrecondition, "Manual scale request not found");
  }
  if (typeof result === "string") {
    // Original: res.status(400).json({ status: 'error', message: data }) —
    // a plain 400, same as FailedPrecondition elsewhere in this port.
    throw new APIError(ErrCode.FailedPrecondition, result);
  }

  // Status-change event for scheduling/schedule-event's follow-up job — see
  // createManualScaleRequest's comment on why this module re-purposes the
  // original's log-publish for structured status events. No scheduledEvent
  // trigger here — per the original, START_MANUAL_SCALE_REQUEST is only ever
  // raised on creation, not on approval/rejection.
  await updateStatus({
    id: result.id as number,
    previousStatus: "WAITING_FOR_APPROVAL",
    newStatus: result.status,
    createdBy: input.processedBy,
  });

  // Original looks up the processor's display name via
  // getUsersDetail(processedBy, token) — ported as a local-tables-only
  // lookup, same as createManualScaleRequest's operatorName/entityName above.
  const [processedName, processor] = await Promise.all([
    getLocalUserName(input.processedBy),
    findByUserUuid(input.processedBy),
  ]);

  // Original also calls notificationService.sendMultiNotification(...) here
  // (NOTIFICATION_EVENT_TYPE.MANUAL_REQUEST_APPROVED / _REJECTED). Ported via
  // notification's triggerPushNotification (Novu-backed), same
  // recipient-is-the-caller quirk noted in createManualScaleRequest above —
  // PatchActivateUseCase's `user`/`entity` params are the processor's own
  // record (from req.user), not the original requester's.
  if (processor?.id) {
    const notif =
      input.status === "APPROVED"
        ? NOTIFICATION_EVENT_TYPE.MANUAL_REQUEST_APPROVED
        : NOTIFICATION_EVENT_TYPE.MANUAL_REQUEST_REJECTED;
    await notification.triggerPushNotification({
      userId: processor.id,
      title: notif.title,
      message: notif.message(processedName ?? ""),
      type: notif.type,
    });
  }

  return { ...result, processedName };
}

// Mirrors `manualRequestRepository.waitingApprovalManualScaleRequest(...)` —
// this domain's advance step for the START_MANUAL_SCALE_REQUEST scheduled
// event, called by scheduled-event-dispatcher via ~encore/clients (see
// manual-scale-request.controller.ts's internal endpoint of the same name).
export async function markWaitingForApproval(id: number): Promise<void> {
  await repo.markWaitingForApproval(id);
}
