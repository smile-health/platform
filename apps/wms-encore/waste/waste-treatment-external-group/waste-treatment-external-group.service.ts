import { APIError, ErrCode } from "encore.dev/api";
import * as repo from "./waste-treatment-external-group.repository";
import { transportationStatusSchema } from "./waste-treatment-external-group.schema";
import { ALLOWED_OPERATOR_ROLES } from "./waste-treatment-external-group.types";
import type {
  PaginatedWasteTreatmentExternalGroup,
  WasteTreatmentExternalGroup,
} from "./waste-treatment-external-group.types";
import * as partnerVehicleRepo from "../../partnership/partner-vehicle/partner-vehicle.repository";
import * as entityLocationRepo from "../../entity/entity-location/entity-location.repository";
import * as classificationRepo from "../waste-classification/waste-classification.repository";
import { getProviderNameAndListOperatorNameByHfIdAndWasteClassificationId } from "../../partnership/partnership/partnership.service";
import { getPresignedUrl } from "../../shared/storage/s3-client";

// Both endpoints' original controllers wrap everything in try/catch and, on
// any thrown error, call `res.error(...)` — Express's generic 500 path, not
// one of the `res.fail(...)` 400-family branches. There is exactly one
// explicit `res.fail(...)` case in each (the missing-bearer-token guard,
// called with `{isValidationError: true}` -> 422/InvalidArgument), which is
// now handled by Encore's `auth: true` on the endpoint instead (see
// controller.ts) — the original's manual `authHeader` parsing is redundant
// with Express's own `authenticate` middleware already having run by that
// point, and is dropped here in favor of Encore's auth layer. Every other
// error surfaces here as a plain 500 (ErrCode.Internal), matching
// `res.error(...)`'s behavior.

export async function getWasteTreatmentExternalGroup(input: {
  id?: number;
  qrCodeId?: string;
}): Promise<WasteTreatmentExternalGroup> {
  // Mirrors the original's `getWasteTreatmentExternalGroupByIdWithWasteBags`
  // full enrichment pass — presigned S3 manifest URL, bulk waste
  // classification + hierarchy lookup, per-bag log history, a partnership
  // lookup, and PartnerVehicleModel/EntityLocationModel lookups. All wired
  // up below, from local tables (entities/partnership/partner_vehicle/
  // entity_location) plus shared/storage/s3-client.ts, rather than the
  // original's HTTP round-trips.
  const rows = await repo.findGroupBagRows({ groupId: input.id, qrCodeId: input.qrCodeId });
  if (rows.length === 0) {
    // Original: `if (!data) { res.fail(req.t('waste.error.NOT_FOUND_WG')); return; }`
    // -> no flag -> plain 400 (FailedPrecondition), despite being a
    // not-found case. Preserved verbatim (same class of deviation as
    // global-settings.service.ts's getGlobalSettingsById).
    throw new APIError(ErrCode.FailedPrecondition, "waste.error.NOT_FOUND_WG");
  }

  const first = rows[0];

  // Original: `PartnerVehicleModel.findByPk(firstBag.transporterVehicleId)`
  // (well, `result.transportExternalGroup?.transporterVehicleId` here — see
  // findGroupBagRows, which reads it off the joined
  // waste_transportation_external_group row) -> vehicleNumber.
  const partnerVehicle = first.transporterVehicleId
    ? await partnerVehicleRepo.findById(first.transporterVehicleId)
    : null;

  // Bulk-fetch classifications for all distinct waste_classification_id
  // values across the group's bags, mirroring the original's classificationMap.
  const classificationIds = [...new Set(rows.map((r) => r.bag.wasteClassificationId).filter(Boolean))];
  const classifications = await Promise.all(classificationIds.map((id) => classificationRepo.findById(id)));
  const classificationById = new Map(classifications.filter(Boolean).map((c) => [c!.id, c!]));

  const vehicleList = await repo.findVehiclesByEntityAndTransporter(first.bag.healthcareFacilityId, first.bag.transporterId);

  const locationTreatment = first.bag.treatmentLocationId
    ? await entityLocationRepo.findById(first.bag.treatmentLocationId)
    : null;

  const primaryClassification = classificationById.get(first.bag.wasteClassificationId);
  const processWastebagEnd = repo.handleAnalisisProcessCount(
    primaryClassification?.disposalMethod ?? undefined,
    primaryClassification?.treatmentMethod ?? undefined,
    first.bag.isTreated,
    first.bag.wasteGroupIds,
    first.bag.wasteStatus
  );

  const summary = repo.buildGroupWasteClassificationSummary([...classificationById.values()]);

  const partnership = await getProviderNameAndListOperatorNameByHfIdAndWasteClassificationId({
    healthcareFacilityId: first.bag.healthcareFacilityId,
    wasteClassificationId: first.bag.wasteClassificationId,
    transporterId: first.bag.transporterId,
    thirdPartyId: first.bag.thirdPartyId,
  });

  const wasteBags = await Promise.all(
    rows.map(async (r) => {
      const classification = classificationById.get(r.bag.wasteClassificationId);
      return {
        wasteBagQrCodeId: r.bag.wasteBagQrCodeId,
        wasteStatus: r.bag.wasteStatus,
        healthcareFacilityId: r.bag.healthcareFacilityId,
        healthcareFacilityName: r.bag.healthcareFacilityName,
        thirdPartyId: r.bag.thirdPartyId,
        manifestDocNumber: r.bag.manifestDocNumber,
        // Presigned via shared/storage/s3-client.ts when manifestDocPath is
        // set and S3 is configured; falls back to the raw stored path
        // otherwise (same as before S3 was wired in).
        manifestDocPath: (await getPresignedUrl(r.bag.manifestDocPath)) ?? r.bag.manifestDocPath,
        weightInKgs: r.bag.weightInKgs,
        logHistory: await repo.getWasteBagLogHistory(r.bag.wasteBagQrCodeId),
        treatmentMethod: classification?.treatmentMethod ?? undefined,
        wasteClassification: repo.buildBagWasteClassification(classification),
        treatmentStartTime: r.bag.treatmentStartTime,
        treatmentEndTime: r.bag.treatmentEndTime,
      };
    })
  );

  return {
    ...first.group,
    transporterOperatorId: first.transporterOperatorId,
    transporterVehicleId: first.transporterVehicleId,
    transporterVehicleNumber: partnerVehicle?.vehicleNumber,
    wasteBags,
    wasteType: summary.wasteType,
    wasteGroup: summary.wasteGroup,
    wasteCharacteristics: summary.wasteCharacteristics,
    partnership: partnership as unknown as Record<string, unknown> | null,
    vehicle: vehicleList,
    locationTreatment: locationTreatment,
    processWastebagEnd,
  } as WasteTreatmentExternalGroup;
}

export async function getAllWasteTreatmentExternalGroup(input: {
  limit?: number;
  page?: number;
  startDate?: string;
  endDate?: string;
  entityId?: number;
  healthcareFacilityId?: number;
  status?: string;
  externalRoles?: string;
  externalPropertiesRoleType?: string;
  transportationStatus?: string;
}): Promise<PaginatedWasteTreatmentExternalGroup> {
  const safeLimit = input.limit && Number.isInteger(input.limit) && input.limit > 0 ? Math.min(input.limit, 1000) : 10;
  const safePage = input.page && Number.isInteger(input.page) && input.page > 0 ? input.page : 1;

  // Original:
  //   if (typeof statusParam === 'string' &&
  //       statusParam.split(',').map(status => { allAllowedStatuses.includes(...) }))
  //     status = statusParam;
  // The `.map()` callback has no `return` — it always yields an array of
  // `undefined`s, which is a non-empty (truthy) array regardless of content.
  // So the allow-list check is dead code: `status` is set to the raw query
  // string verbatim whenever it's a string, with NO validation against
  // allAllowedStatuses. Preserved verbatim (not fixed) — matches the
  // "ambiguous/buggy original behavior, ported byte-for-byte" instruction.
  const status = typeof input.status === "string" ? input.status : undefined;

  // Original:
  //   if (req.user?.external_roles && allowedRoles.includes(req.user?.external_roles.toString() as Roles))
  //     roles = req.user?.external_properties.role.type as Roles;
  // Two unrelated AuthData fields: the *gate* reads externalRoles, the
  // *value* actually used comes from externalPropertiesRoleType. Preserved
  // verbatim — both fields are real values from authHandler.ts today, this
  // is just the original's own odd choice of using one field to gate and a
  // different field for the actual value.
  let roles: "operator_landfill" | "operator_treatment" | "operator_recycler" | "operator_waste_bank" | undefined;
  if (
    input.externalRoles &&
    (ALLOWED_OPERATOR_ROLES as readonly string[]).includes(input.externalRoles)
  ) {
    roles = input.externalPropertiesRoleType as typeof roles;
  }

  let transportationStatus: string | undefined;
  if (input.transportationStatus) {
    const parsed = transportationStatusSchema.safeParse(input.transportationStatus);
    // Original: silently drops an unrecognized transportationStatus (the
    // `typeof === 'string' && allowedTransportationStatuses.includes(...)`
    // check, unlike the `status` one above, actually works — its callback IS
    // just a boolean expression, not a `.map()`). Mirrored: invalid value ->
    // treated as "not provided", no error thrown.
    if (parsed.success) {
      transportationStatus = parsed.data;
    }
  }

  const wasteClassificationIds = roles ? await repo.findClassificationIdsByRole(roles) : [];

  // Original hardcodes this list of statuses ADDITIVELY alongside whatever
  // `status` the caller passed (not as an either/or) — a group is included
  // if any of its bags' waste_status is in [status, ...these ten]. The
  // `status` query param is therefore close to a no-op in practice (its
  // value almost always duplicates one already in the fixed list). Preserved
  // verbatim.
  const listStatus = [
    status,
    "IN_THIRD_PARTY_STORAGE",
    "INCINERATION_IN_PROCESS",
    "STERILIZATION_IN_PROCESS",
    "HANDOVER_TO_TREATMENT",
    "READY_FOR_TREATMENT",
    "RECYCLED",
    "LANDFILLED",
    "COLLECTED",
    "DISPOSED",
  ].filter((s): s is string => Boolean(s));

  const startDate = input.startDate ? new Date(input.startDate) : undefined;
  const endDate = input.endDate ? new Date(input.endDate) : undefined;

  const { data, pagination } = await repo.findAllPaginated({
    limit: safeLimit,
    page: safePage,
    startDate,
    endDate,
    entityId: input.entityId,
    healthcareFacilityId: input.healthcareFacilityId,
    wasteStatuses: listStatus,
    wasteClassificationIds,
    transportationStatus,
  });

  // Bulk-fetch classifications for every distinct waste_classification_id
  // across every group's bags in this page, same rationale as the detail
  // endpoint above (one lookup per distinct id, reused across groups/bags).
  const allClassificationIds = [
    ...new Set(data.flatMap(({ bags }) => bags.map((b) => b.wasteClassificationId)).filter(Boolean)),
  ];
  const allClassifications = await Promise.all(allClassificationIds.map((id) => classificationRepo.findById(id)));
  const classificationById = new Map(allClassifications.filter(Boolean).map((c) => [c!.id, c!]));

  const groups: WasteTreatmentExternalGroup[] = await Promise.all(data.map(async ({ group, bags }) => {
    const first = bags[0];
    const summary = repo.buildGroupWasteClassificationSummary(bags.map((b) => classificationById.get(b.wasteClassificationId)));
    const partnership = first
      ? await getProviderNameAndListOperatorNameByHfIdAndWasteClassificationId({
          healthcareFacilityId: first.healthcareFacilityId,
          wasteClassificationId: first.wasteClassificationId,
          transporterId: first.transporterId,
          thirdPartyId: first.thirdPartyId,
        })
      : null;
    return {
      ...group,
      providerName: first?.transporterName,
      consumerName: first?.healthcareFacilityName,
      wasteBags: bags.map((bag) => ({
        id: bag.id,
        wasteBagQrCodeId: bag.wasteBagQrCodeId,
        wasteStatus: bag.wasteStatus,
        weightInKgs: bag.weightInKgs,
        createdAt: bag.createdAt,
        healthcareFacilityId: bag.healthcareFacilityId,
        healthcareFacilityName: bag.healthcareFacilityName,
        wasteStatusUpdatedAt: bag.wasteStatusUpdatedAt,
        wasteClassification: repo.buildBagWasteClassification(classificationById.get(bag.wasteClassificationId)),
        treatmentMethod: classificationById.get(bag.wasteClassificationId)?.treatmentMethod ?? undefined,
        treatmentStartTime: bag.treatmentStartTime,
        treatmentEndTime: bag.treatmentEndTime,
        wasteSource: bag.wasteSource,
      })),
      // The original also sorts the final list by
      // `wasteType.id` ascending — now that wasteType is populated, applying
      // that sort here would change behavior for callers depending on the
      // page's returned order (e.g. relative to updated_at desc, which
      // findAllPaginated already applies) — left unsorted-by-wasteType.id to
      // avoid speculatively guessing at a secondary sort the endpoint's
      // consumers may not expect out of this port; flagging here rather than
      // silently adding it.
      wasteType: summary.wasteType,
      wasteGroup: summary.wasteGroup,
      wasteCharacteristics: summary.wasteCharacteristics,
      partnership: partnership as unknown as Record<string, unknown> | null,
    };
  }));

  return { data: groups, pagination };
}
