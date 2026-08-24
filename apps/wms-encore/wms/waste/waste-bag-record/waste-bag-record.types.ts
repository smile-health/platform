// Mirrors apps/wms-service's domain/entities/WasteBagRecord.ts field-for-field
// (the "record" of a waste bag as it moves through temporary storage — not to
// be confused with the sibling waste-bag module's WasteBag entity, a separate
// table). Enum-like fields are typed as plain string here per gotcha #3 —
// validated manually in service.ts where relevant. See
// waste-bag-record.repository.ts's header comment for the exact Postgres
// enum value lists.
export interface WasteBagRecord {
  id?: number;
  createdAt: Date;
  createdBy: string;
  updatedAt?: Date;
  updatedBy?: string;
  wasteBagQrCodeId?: string;
  healthcareFacilityId: number;
  wasteSourceId: number;
  wasteClassificationId: number;
  sourceTreatmentGroupId?: string;
  scaleMethod: string; // 'MANUAL' | 'IOT'
  assetId?: number;
  weightInKgs?: number;
  storageStartTimestamp?: Date;
  scheduledStorageEndDatetime?: Date;
  actualStorageEndDatetime?: Date;
  maxStorageHours?: number;
  minimumStorageHours?: number;
  wasteTreatmentGroupId?: number;
  wasteTransportationGroupId?: number;
  wasteTreatmentExternalGroupId?: number;
  wasteTransportationExternalGroupId?: number;
  wasteStatus: string;
  wasteStatusUpdatedAt?: Date;
  wasteStatusUpdatedBy?: string;
  transportationStatus?: string; // 'REQUESTED' | 'IN_TRANSIT' | 'HANDED_OVER'
  transportationStatusUpdatedAt?: Date;
  transportationStatusUpdatedBy?: string;
  ownedBy: string; // 'HEALTHCARE_FACILITY' | 'TRANSPORTER' | 'THIRD_PARTY'
  transporterId?: number;
  thirdPartyId?: number;
  isTreated: boolean;
  isDisposed: boolean;
  binNumber?: string;
  iotMethod?: string; // 'BLUETOOTH' | 'INTERNET'
  manifestDocNumber?: string;
  manifestDocPath?: string;
  treatmentStartTime?: Date;
  treatmentEndTime?: Date;
  wasteGroupIds?: string;
  treatmentLocationId?: number;
  bastNo?: string;
  materialIds?: string;
}

// Grouped-by-date summary shape actually returned by the original's
// getAllWasteBagRecord (the domain repository interface's declared return
// type of `{date, totalWeight, wasteCharacteristics}[]` does not match what
// WasteBagRecordRepositoryImpl.getAllWasteBagRecord actually builds and
// returns — a pre-existing mismatch in the original between interface and
// implementation. This port follows the *implementation's* actual shape.
export interface WasteBagRecordDailySummary {
  date: string;
  totalBags: number;
  totalWeight: number;
  listWasteBags: WasteBagRecordSummaryItem[];
}

export interface WasteBagRecordSummaryItem {
  wasteBagQrCode: string;
  weightInKgs: number;
  wasteType: string;
  date: Date;
  wasteGroup: string;
  wasteCharacteristics: string;
}

// ---- POST /api/v1/waste-record ----
export interface CreateWasteBagRecordRequest {
  wasteSourceId: number;
  wasteClassificationId: number;
  scaleMethod: string; // 'MANUAL' | 'IOT'
  weightInKgs: number;
  sourceTreatmentGroupId?: string;
  wasteBagQrCodeId: string;
  binNumber?: string;
  iotMethod?: string; // 'BLUETOOTH' | 'INTERNET'
  wasteGroupIds?: string;
  isTreated?: boolean;
  bastNo?: string;
  materialIds?: string;
  assetId?: number;
  // Original controller also spreads healthcareFacilityId from req.body via
  // `...req.body`, but createWasteSchema's body schema is what's actually
  // validated — healthcareFacilityId in the body schema is optional and
  // effectively unused since the controller overwrites it with
  // req.user?.entity.id right after the spread. Not exposed as a request
  // field here; healthcareFacilityId always comes from auth.
}
export interface CreateWasteBagRecordResponse {
  status: "success";
  data: WasteBagRecord;
}

// ---- GET /api/v1/waste-record ----
export interface GetAllWasteBagRecordRequest {
  limit?: number;
  page?: number;
  search?: string;
  healthcareId?: number;
  transporterId?: number;
  thirdPartyId?: number;
  wasteUpdateStart?: string;
  wasteUpdateEnd?: string;
  // Original parses this query param with JSON.parse(...) into number[].
  // Encore query params only decode as string | string[] | number | etc off
  // the wire (no JSON blobs) — kept as a plain string here and JSON.parse'd
  // manually in service.ts, same as the original controller did.
  wasteClassificationId?: string;
  transportationGroupId?: number;
  transportationExternalGroupId?: number;
  treatmentGroupId?: number;
  treatmentExternalGroupId?: number;
  sourceType?: string;
  ownedBy?: string;
  wasteStatus?: string;
  binNumber?: string;
  wasteBagQrCodeId?: string;
  id?: number;
  wasteTypeId?: number;
  wasteGroupId?: number;
  wasteCharacteristicsId?: number;
  isTreated?: boolean;
  isDisposed?: boolean;
}
export interface GetAllWasteBagRecordResponse {
  status: "success";
  data: WasteBagRecordDailySummary[];
}

// GET /api/v1/waste-record/export — binary .xlsx response, ported as an
// api.raw endpoint (see waste-bag-record.controller.ts). Not representable
// by api()'s JSON request/response types, so there is no Encore-decoded
// request/response type for it here — same as
// dashboard-activity.controller.ts's exportActivitySummariesForEntities.
