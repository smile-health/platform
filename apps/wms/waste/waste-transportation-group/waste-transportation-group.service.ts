import { APIError, ErrCode } from "encore.dev/api";
import * as repo from "./waste-transportation-group.repository";
import { generateWasteGroupId, getTotalWeightFromWasteBags } from "./waste-transportation-group.utils";
import {
  createWasteTransportationGroupBodySchema,
  updateWasteTransportationGroupBodySchema,
} from "./waste-transportation-group.schema";
import type { WasteTransportationGroup, PaginatedWasteTransportationGroups } from "./waste-transportation-group.types";
import { getProviderNameAndListOperatorNameByHfIdAndWasteClassificationId } from "../../partnership/partnership/partnership.service";

// wasteTransportationGroupController.ts's res.fail(...) calls are all called
// with no options object -> plain 400s (FailedPrecondition). None of the
// endpoints pass isValidationError/isNotFoundError/etc flags in the
// controller itself; validateRequest's own zod failures (handled by
// middleware, not shown in the controller) are the only 422-equivalent path,
// mapped to InvalidArgument below for the request-shape checks this port
// performs in the service layer instead of Express middleware.

export async function getAllWasteTransportationGroups(input: {
  limit?: number;
  page?: number;
  date?: string;
  entityId?: number;
  status?: string;
}): Promise<PaginatedWasteTransportationGroups> {
  // Mirrors the controller: Number(limit?.toString()) / Number(page?.toString())
  // with no fallback — NaN flows into paginationUtils.sanitizePaginationParams,
  // which the original relies on to clamp to sane defaults. This port applies
  // the same clamp explicitly instead.
  const safeLimit = input.limit && input.limit > 0 ? input.limit : 10;
  const safePage = input.page && input.page > 0 ? input.page : 1;

  // Mirrors the controller's status-allowlist check: only a status matching
  // one of the (WasteBag-lifecycle) allowed values is passed through;
  // anything else is silently dropped rather than rejected.
  const allowedStatuses = [
    "IN_TEMPORARY_STORAGE",
    "IN_COLD_STORAGE",
    "INCINERATION_IN_PROCESS",
    "STERILIZATION_IN_PROCESS",
    "INCINERATED",
    "STERILISED",
    "READY_FOR_TRANSPORT",
    "TRANSPORTATION_REQUEST_CREATED",
    "IN_TRANSIT",
    "READY_FOR_TREATMENT",
    "RECYCLED",
    "LANDFILLED",
    "COLLECTED",
    "DISPOSED",
  ];
  const status = input.status && allowedStatuses.includes(input.status) ? input.status : undefined;
  const date = input.date ? new Date(input.date) : undefined;

  return repo.findPaginated({
    limit: safeLimit,
    page: safePage,
    date,
    entityId: input.entityId,
    status,
  });
}

export async function createWasteTransportationGroup(input: {
  createdBy: string;
  wasteBagIds: number[];
  totalBagsCount: number;
  totalWeightInKgs: number;
  transporterVehicleId?: number;
  transporterOperatorId?: number;
  handoverLattitude?: number;
  handoverLongitude?: number;
  transportationStatus: string;
  handoverTimestamp?: Date;
}): Promise<WasteTransportationGroup> {
  const parsed = createWasteTransportationGroupBodySchema.safeParse(input);
  if (!parsed.success) {
    // Original's validateRequest middleware rejects malformed bodies with a
    // 422-equivalent before the controller ever runs — ported here as the
    // request-shape check for this port's service layer.
    throw new APIError(ErrCode.InvalidArgument, parsed.error.issues[0]?.message ?? "Invalid request");
  }

  // Mirrors WasteBagTransportGroupImpl.createWasteTransportationGroup: fetch
  // the actual waste bags referenced by wasteBagIds (matched against
  // waste_bag_qr_code_id — see repo.findBagsByQrCodeIdsForGroup's doc
  // comment for the "ids are actually qr codes" quirk), then recompute
  // totalBagsCount/totalWeightInKgs from them (NOT from the zod-validated
  // body — the original discards those two request fields entirely and
  // always recomputes).
  const wasteBags = await repo.findBagsByQrCodeIdsForGroup(
    parsed.data.wasteBagIds.map((id) => id.toString())
  );
  if (wasteBags.length === 0) {
    // Original: `throw new Error('Waste bag not found for the given ids')`,
    // caught by the repository's own catch block and rethrown as a plain
    // Error -> controller's unconditional res.error(...) -> 500.
    throw new APIError(ErrCode.Internal, "Waste bag not found for the given ids");
  }

  // Original's CreateWasteTransportationGroupUseCase.execute always calls
  // repo.createWasteTransportationGroup(..., providerType='') — a hardcoded
  // empty string, never derived from the request body — so the internal
  // providerType switch always falls to its `default` branch:
  // 'TRANSPORTER_TREATMENT'. Preserved verbatim (not a request-driven value).
  const groupId = generateWasteGroupId(
    parsed.data.wasteBagIds.map((id) => id.toString()),
    "TRANSPORTER_TREATMENT"
  );

  return repo.create({
    createdBy: input.createdBy,
    totalBagsCount: wasteBags.length,
    totalWeightInKgs: getTotalWeightFromWasteBags(wasteBags),
    transporterVehicleId: parsed.data.transporterVehicleId,
    transporterOperatorId: parsed.data.transporterOperatorId?.toString(),
    handoverLattitude: parsed.data.handoverLattitude,
    handoverLongitude: parsed.data.handoverLongitude,
    // Original hardcodes 'READY_FOR_TRANSPORT' on create in the repository
    // regardless of the body's transportationStatus — see repository.ts.
    transportationStatus: parsed.data.transportationStatus,
    handoverTimestamp: input.handoverTimestamp,
    groupId,
  });
}

export async function getWasteTransportationGroupById(input: {
  id?: string;
  qrCodeId?: string;
  authorization?: string;
}): Promise<WasteTransportationGroup> {
  // Mirrors the controller's own Authorization-header re-check (redundant
  // with the auth:true / authenticate middleware already gating this route,
  // but preserved verbatim since the original controller does the same).
  if (!input.authorization || !input.authorization.startsWith("Bearer ")) {
    // res.fail(req.t('common.missing-token'), { isValidationError: true }) -> 422
    throw new APIError(ErrCode.InvalidArgument, "missing token");
  }

  if (!input.id) {
    // Original passes id=undefined straight to the repository, whose
    // Sequelize `where: { ...(id && { id }) }` then becomes an unconstrained
    // findOne — returning an arbitrary row rather than failing. This port
    // does not replicate that footgun; it requires id explicitly.
    throw new APIError(ErrCode.FailedPrecondition, "ID parameter is required");
  }
  const numericId = Number(input.id);
  if (Number.isNaN(numericId)) {
    throw new APIError(ErrCode.FailedPrecondition, "ID parameter is required");
  }

  const data = await repo.findById(numericId);
  if (!data) {
    // res.fail('Waste source not found') — no flag, plain 400 (copy-pasted
    // message from waste-source, preserved verbatim from the original).
    throw new APIError(ErrCode.FailedPrecondition, "Waste source not found");
  }

  // Mirrors getWasteTransportationGroupById's `include: [{ model: WasteBagModel,
  // as: 'wasteBags', required: qrCodeId ? true : false, where: {...qrCodeId
  // && {wasteBagQrCodeId: qrCodeId}} }]` — when qrCodeId is given and no bag
  // matches, the required:true join means Sequelize's findOne returns null
  // for the *whole* group row. Mirrored here: bags is fetched after the
  // group is already confirmed to exist, and an empty result when qrCodeId
  // was supplied is treated the same way as "not found".
  const bags = await repo.findBagsForGroup(numericId, input.qrCodeId);
  if (input.qrCodeId && bags.length === 0) {
    throw new APIError(ErrCode.FailedPrecondition, "Waste source not found");
  }

  let wasteClassification: Awaited<ReturnType<typeof repo.findClassificationForFirstBag>> = null;
  let treatmentMethodMap = new Map<number, string | null>();
  if (bags.length > 0) {
    // Original keys the single wasteClassification detail off firstBag[0].
    wasteClassification = await repo.findClassificationForFirstBag(bags[0].wasteClassificationId);
    const distinctClassificationIds = [...new Set(bags.map((bag) => bag.wasteClassificationId))];
    treatmentMethodMap = await repo.findTreatmentMethodsByClassificationIds(distinctClassificationIds);
  }

  // NOTE (deviation, documented — see repository.ts's findVehicleForGroup
  // doc comment): original resolves the vehicle via
  // `PartnerVehicleModel.findByPk(firstBag[0].transporterVehicleId)`, a
  // column that doesn't exist on waste_bag (dead code there, always null).
  // This port resolves it from the group's own transporterVehicleId instead.
  const vehicle = await repo.findVehicleForGroup(data.transporterVehicleId ?? null);

  // manifestDocPath presigned-URL resolution (via
  // InfraRegistry.s3FileServiceRepositoryImpl.getPresignedUrl) is NOT wired
  // here — no S3/MinIO client exists in wms-encore yet; wasteBags[].manifestDocPath
  // below is the raw stored path, not a presigned URL.
  //
  // Mirrors the original's 3-arg internal-treatment call to
  // getProviderNameAndListOperatorNameByHfIdAndwasteClassificationId (no
  // transporterId/thirdPartyId narrowing — this is an internal, not
  // external, transportation group).
  const partnership = bags.length > 0
    ? await getProviderNameAndListOperatorNameByHfIdAndWasteClassificationId({
        healthcareFacilityId: bags[0].healthcareFacilityId,
        wasteClassificationId: bags[0].wasteClassificationId,
      })
    : null;

  return {
    ...data,
    wasteBags: bags.map((bag) => ({
      id: bag.id,
      wasteBagQrCodeId: bag.wasteBagQrCodeId,
      healthcareFacilityId: bag.healthcareFacilityId,
      wasteClassificationId: bag.wasteClassificationId,
      weightInKgs: bag.weightInKgs,
      manifestDocPath: bag.manifestDocPath,
      treatmentMethod: treatmentMethodMap.get(bag.wasteClassificationId) ?? undefined,
      logHistory: bag.logHistory,
    })),
    wasteClassification: wasteClassification ?? undefined,
    vehicle: vehicle ?? undefined,
    partnership: partnership as unknown as Record<string, unknown> | null,
  } as typeof data;
}

export async function updateWasteTransportationGroup(input: {
  id: string;
  updatedBy: string;
  totalBagsCount?: number;
  totalWeightInKgs?: number;
  transporterVehicleId?: number;
  transporterOperatorId?: number;
  handoverLattitude?: number;
  handoverLongitude?: number;
  transportationStatus?: string;
}): Promise<WasteTransportationGroup> {
  if (!input.id) {
    // res.fail('ID parameter is required') — no flag
    throw new APIError(ErrCode.FailedPrecondition, "ID parameter is required");
  }
  const numericId = Number(input.id);
  if (Number.isNaN(numericId)) {
    throw new APIError(ErrCode.FailedPrecondition, "ID parameter is required");
  }

  const existing = await repo.findById(numericId);
  if (!existing) {
    // res.fail('Waste source not found') — no flag
    throw new APIError(ErrCode.FailedPrecondition, "Waste source not found");
  }

  const parsed = updateWasteTransportationGroupBodySchema.safeParse({
    totalBagsCount: input.totalBagsCount ?? existing.totalBagsCount,
    totalWeightInKgs: input.totalWeightInKgs ?? existing.totalWeightInKgs,
    transporterVehicleId: input.transporterVehicleId ?? existing.transporterVehicleId,
    transporterOperatorId: input.transporterOperatorId,
    handoverLattitude: input.handoverLattitude ?? existing.handoverLattitude,
    handoverLongitude: input.handoverLongitude ?? existing.handoverLongitude,
    transportationStatus: input.transportationStatus ?? existing.transportationStatus,
  });
  if (!parsed.success) {
    throw new APIError(ErrCode.InvalidArgument, parsed.error.issues[0]?.message ?? "Invalid request");
  }

  // NOTE (deviation, documented): the original's update use-case looks up
  // "existingData" via getWasteTransportationGroupById(id.toString()) —
  // passing `id` positionally as the *token* argument, leaving the real `id`
  // param undefined, which (per the note above) makes the underlying
  // Sequelize findOne unconstrained. In practice it still updates the
  // correct row afterwards (the final `.update()` call uses the actual id),
  // but the "not found" branch effectively never triggers unless the table
  // is completely empty. This port looks the row up by the *real* id
  // (already done above) instead of replicating that bug — same call
  // entity-location.service.ts's updateEntityLocation makes for its
  // analogous case.
  const updated = await repo.update(numericId, {
    updatedBy: input.updatedBy,
    totalWeightInKgs: parsed.data.totalWeightInKgs,
    transporterVehicleId: parsed.data.transporterVehicleId,
    transporterOperatorId: parsed.data.transporterOperatorId?.toString(),
    handoverLattitude: parsed.data.handoverLattitude,
    handoverLongitude: parsed.data.handoverLongitude,
    transportationStatus: parsed.data.transportationStatus,
  });
  if (!updated) {
    throw new APIError(ErrCode.FailedPrecondition, "Waste source not found");
  }
  return updated;
}

export async function deleteWasteTransportationGroup(id: string, deletedBy?: number): Promise<boolean> {
  if (!id) {
    // res.fail('ID parameter is required') — no flag
    throw new APIError(ErrCode.FailedPrecondition, "ID parameter is required");
  }
  const numericId = Number(id);
  if (Number.isNaN(numericId)) {
    throw new APIError(ErrCode.FailedPrecondition, "ID parameter is required");
  }

  const deleted = await repo.softDelete(numericId, deletedBy);
  if (!deleted) {
    // res.fail('Waste source not found') — no flag
    throw new APIError(ErrCode.FailedPrecondition, "Waste source not found");
  }
  return true;
}
