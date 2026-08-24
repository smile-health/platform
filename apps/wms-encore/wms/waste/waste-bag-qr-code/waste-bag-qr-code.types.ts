// Mirrors apps/wms-service's domain/entities/WasteBagQrCode.ts field-for-field,
// plus the two joined summaries (waste_source / waste_classification) the
// original always attaches via Sequelize `include`. Those two tables belong to
// other modules (waste-source, waste-classification) — not yet ported here —
// so their shape is intentionally loose (Record<string, unknown>) rather than
// duplicating field lists this module doesn't own.
export interface WasteBagQrCode {
  id?: number;
  createdAt?: Date;
  createdBy?: string;
  healthcareFacilityId: number;
  wasteSourceId?: number;
  wasteClassificationId?: number;
  qrCode: string;
  wasteSource?: Record<string, unknown>;
  wasteClassification?: Record<string, unknown>;
  // Original types this `any`; it's the matching waste_bag row's
  // scheduled_storage_end_datetime, only used internally by
  // getWasteBagQrCodeById's ALREADY_REGISTERED/RADIOACTIVE_STILL_IN_STORAGE
  // business check (see waste-bag-qr-code.service.ts) — not otherwise exposed.
  scheduledStorageEndDatetime?: Date;
}

export interface PaginationMeta {
  total: number;
  pages: number;
  currentPage: number;
  perPage: number;
}

export interface PaginatedWasteBagQrCode {
  data: WasteBagQrCode[];
  pagination: PaginationMeta;
}

// GET /api/v1/waste-bag-qrcode/:id
// NOTE (real original behavior, not a porting mistake): `id` here is the
// *qrCode string*, not the numeric primary key. The original repository's
// getWasteBagQrCodeById() filters `WHERE qr_code = :id AND
// healthcare_facility_id = :entityId` — it never looks up by the numeric id
// column. Contrast with DELETE below, which does use the numeric PK.
export interface GetWasteBagQrCodeByIdRequest {
  id: string;
}
export interface GetWasteBagQrCodeByIdResponse {
  status: "success";
  data: WasteBagQrCode;
}

// GET /api/v1/waste-bag-qrcode
// NOTE: `search` is accepted (mirrors the original query param) but has no
// effect — the original's WHERE-clause search filter is commented out in
// WasteBagQrCodeRepoitoryImpl.getAllWasteBagQrCodes. Preserved verbatim.
export interface GetAllWasteBagQrCodeRequest {
  limit?: number;
  page?: number;
  entity_id?: string;
  search?: string;
}
export interface GetAllWasteBagQrCodeResponse {
  status: "success";
  data: PaginatedWasteBagQrCode;
}

// POST /api/v1/waste-bag-qrcode
// The original's request body is a bare JSON array of these items
// (validateRequest(createWasteBagQrCodeSchema) -> z.array(...)). Encore
// api() request types must be plain named interfaces (not top-level arrays),
// so the array is wrapped in `items` here — a deliberate wire-shape deviation
// to satisfy Encore's typing rules; document at integration time if the
// gateway needs to unwrap a raw array body instead.
export interface CreateWasteBagQrCodeItem {
  healthcareFacilityId?: number;
  wasteSourceId?: number;
  wasteClassificationId?: number;
  labelCount: number;
}
export interface CreateWasteBagQrCodeRequest {
  items: CreateWasteBagQrCodeItem[];
}
export interface CreateWasteBagQrCodeResponse {
  status: "success";
  data: WasteBagQrCode[];
}

// PUT /api/v1/waste-bag-qrcode/:id
// NOTE: like GET, `id` is the qrCode string, used (scoped by the caller's
// entityId) to locate the existing row; the actual UPDATE statement then
// keys off that row's numeric PK. `healthcareFacilityId` is NOT read from the
// body in the original — the controller always overrides it with
// req.user.entity.id — so it's omitted here; the service derives it from
// auth. `updatedBy` was required by the original's zod schema but is never
// actually used by the use-case (dead field) — omitted from this port's
// request type since Encore's request type is the source of truth here, not
// a validated-then-ignored body field.
export interface UpdateWasteBagQrCodeRequest {
  id: string;
  wasteSourceId?: number;
  wasteClassificationId?: number;
  qrCode: string;
}
export interface UpdateWasteBagQrCodeResponse {
  status: "success";
  data: WasteBagQrCode;
}

// DELETE /api/v1/waste-bag-qrcode/:id
// NOTE: unlike GET/PUT, `id` here IS the numeric primary key (the original
// repository's deleteWasteBagQrCode() calls checkExistingData() ->
// Model.findByPk(id)). This inconsistency across the same route family is
// real, preserved-as-is original behavior, not a porting slip.
export interface DeleteWasteBagQrCodeRequest {
  id: string;
}
export interface DeleteWasteBagQrCodeResponse {
  status: "success";
  data: boolean;
}
