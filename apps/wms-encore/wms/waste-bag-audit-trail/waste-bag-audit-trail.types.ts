export interface WasteBagAuditTrailEntry {
  id: number;
  wasteBagId: number;
  previousStatus: string;
  newStatus: string;
  createdAt: Date;
}

export interface PaginationMeta {
  total: number;
  pages: number;
  currentPage: number;
  perPage: number;
}

export interface PaginatedWasteBagAuditTrailEntries {
  data: WasteBagAuditTrailEntry[];
  pagination: PaginationMeta;
}

// GET /api/v1/audit-trail — mirrors apps/wms-service's
// wasteBagAuditTrailController.ts's getAllWasteBagAuditTrail. The original
// also accepted healthcareFacilityId/transporterId/thirdPartyProviderId
// filters, but this Encore port's waste_bag_audit_trail table (see
// db/db.ts's WasteBagAuditTrailTable / db/migrations/2_create_waste_bag_audit_trail.up.sql)
// only carries id/waste_bag_id/previous_status/new_status/created_at (plus
// waste_bag_status/is_group/waste_bag_qr_code added for the log-history
// port) — no healthcare_facility_id, transporter_id, third_party_provider_id,
// event, source, remarks, updated_by, or is_failed columns exist to filter
// or search on. Those filters are dropped rather than faked; only
// pagination + an exact wasteBagId filter are supported here.
export interface GetAllWasteBagAuditTrailsRequest {
  limit?: number;
  page?: number;
  wasteBagId?: number;
}

export interface GetAllWasteBagAuditTrailsResponse {
  status: "success";
  data: PaginatedWasteBagAuditTrailEntries;
}
