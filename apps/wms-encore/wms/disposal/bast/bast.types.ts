// Mirrors apps/wms-service's domain/entities/Disposal.ts +
// domain/entities/DisposalItems.ts field-for-field. Endpoints are mounted at
// /bast in the original (v1Router.use('/bast', disposalRoutes), app.ts's
// app.use('/api/v1', v1Router)) -> /api/v1/bast, /api/v1/bast/confirm here.

export interface Disposal {
  id?: number;
  bastNo: string;
  description?: string;
  createdBy: string;
  createdName?: string;
  entityId: number;
  entityName?: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  isRead: boolean;
  approvedBy?: string;
  rejectedBy?: string;
  rejectedReason?: string;
  approvedAt?: Date;
  rejectedAt?: Date;
  createdAt?: Date;
}

export interface DisposalItemRow {
  id?: number;
  materialId: number;
  bastNo: string;
  materialName: string;
  qty: number;
}

export interface PaginationMeta {
  total: number;
  pages: number;
  currentPage: number;
  perPage: number;
}

export interface PaginatedDisposals {
  data: Array<Disposal & { disposalItems: DisposalItemRow[] }>;
  pagination: PaginationMeta;
}

// Mirrors WasteBagHistory (shared/utils/logHistories.ts's getLogHistories) as
// consumed by DisposalRepositoryImpl.getDisposal — narrowed to just the
// status/timestamp fields actually used there.
export interface WasteBagStatusHistory {
  status: string;
  status_label_id: string;
  status_label_en: string;
  updated_at: Date | null;
}

// Mirrors DisposalRepositoryImpl.getDisposal's per-item waste_info block.
export interface DisposalItemWasteInfo {
  waste_bag_codes?: string;
  waste_bag_total_weight?: number | null;
  waste_bag_type_label?: string;
  waste_bag_group_label?: string;
  waste_bag_characteristics_label?: string;
  waste_bag_histories: WasteBagStatusHistory[];
}

export interface DisposalDetailItem {
  id?: number;
  material_id: number;
  name: string;
  qty: number;
  waste_info: DisposalItemWasteInfo | null;
}

// Mirrors DisposalRepositoryImpl.getDisposal's final response shape.
// receiver enrichment (name/role/address/entity_name) comes from
// getUsersDetail(dataDisposal.approvedBy, token) in the original —
// bast.service.ts populates this from the local `users`/`entities` tables
// instead (see shared/core/entity-user-lookup.ts). Only null when
// approvedBy references a user who has never authenticated against this app.
export interface DisposalDetail {
  bast_no: string;
  receiver: {
    name: string | null;
    role: string | null;
    address: string | null;
    user_uuid: string | null;
    entity_name: string | null;
  };
  disposal_items: DisposalDetailItem[];
}

// POST /api/v1/bast
// Mirrors createDisposedBastSchema's body. instruction_type_id/label are
// validated (mirrored in bast.schema.ts) but never persisted in the
// original either (DisposalAttributes has no such column) — preserved
// as accepted-but-unused, same as upstream.
export interface CreateBastSender {
  address: string;
  entity_id: number;
  entity_name: string;
  province_name: string;
  regency_name: string;
  status: number;
  type: number;
  type_label: string;
}

export interface CreateBastDisposalItem {
  material_id: number;
  material_name: string;
  qty: number;
}

export interface CreateBastUserCreatedBy {
  email: string;
  firstname: string;
  lastname?: string;
  username: string;
  user_uuid: string;
}

export interface CreateBastRequest {
  bast_no: string;
  disposal_comments?: string;
  instruction_type_id: number;
  instruction_type_label: string;
  sender: CreateBastSender;
  disposal_items: CreateBastDisposalItem[];
  user_created_by: CreateBastUserCreatedBy;
  created_at: string;
  updated_at: string;
}

export interface CreateBastResponse {
  status: "success";
  data: { bast_no: string };
}

// PUT /api/v1/bast/confirm
// Mirrors updateDisposedBastSchema's body.
export interface ConfirmBastRequest {
  bastNo: string;
  status: "APPROVED" | "REJECTED";
  reason?: string;
}
export interface ConfirmBastResponse {
  status: "success";
  data: boolean;
}

// GET /api/v1/bast
// Mirrors getAllDisposalController's query params. When bast_no is supplied,
// the original short-circuits to a single-record lookup (GetDisposalUseCase)
// instead of the paginated list -> `data` is a union of both shapes here to
// preserve that exact behavior.
export interface GetAllBastRequest {
  limit?: number;
  page?: number;
  healthcareFacilityId?: number;
  search?: string;
  status?: string;
  isRead?: string;
  bast_no?: string;
}
export interface GetAllBastResponse {
  status: "success";
  data: PaginatedDisposals | DisposalDetail;
}
