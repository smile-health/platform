import { APIError, ErrCode } from "encore.dev/api";
import { ScheduledEventTypes, wasteBagTransportRequested } from "../../../messaging/topics";
import type { ScheduledEventType, WasteBagTransportRequestedEvent } from "../../../messaging/topics";
import * as repo from "../waste-bag.repository";
import * as partnerVehicleRepo from "../../../partnership/partner-vehicle/partner-vehicle.repository";
import { handoverTransportSchema } from "../waste-bag.schema";
import { WASTE_EVENT, checkWasteBagTransition } from "../waste-bag.machine";
import { publishMilestone } from "./_shared";

// handoverUpToTransporter / handoverUpToTransporterExternal — !result ->
// FailedPrecondition, string result -> InvalidArgument. File-upload
// requirement (`!req.file` -> InvalidArgument) is now enforced by
// handoverTransportSchema's manifestDocPath.min(1) check, folded into the
// same InvalidArgument branch as the original's isValidationError:true.
//
// Note: unlike coldStoreWasteBags/runTreatmentAction, this one's precondition
// was ALREADY enforced by the original — `findReadyForTransportByGroupIds`
// only ever selects bags whose waste_status is READY_FOR_TRANSPORT. The
// checkWasteBagTransition call below is added as defense-in-depth (and to
// keep the shared machine as the single source of truth for this rule), not
// as a new restriction — behavior here is unchanged from the original.
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

  if (!checkWasteBagTransition("READY_FOR_TRANSPORT", { type: WASTE_EVENT.HANDOVER_TO_TRANSPORTER }).allowed) {
    // Unreachable given findReadyForTransportByGroupIds' own filter — kept
    // as a guard so the machine stays authoritative even if that filter
    // ever changes.
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
