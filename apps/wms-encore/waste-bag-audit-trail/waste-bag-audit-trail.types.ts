export interface WasteBagAuditTrailEntry {
  id: number;
  wasteBagId: number;
  previousStatus: string;
  newStatus: string;
  createdAt: Date;
  // The 11 fields below restore parity with apps/wms-service's
  // WasteBagAuditTrail entity/WasteBagAuditTrailModel — dropped by this
  // port's original selectAll()/toEntity() even after migration 16
  // (16_extend_waste_bag_audit_trail.up.sql, db/migrations) added the backing
  // columns. None of them are populated by this module's own
  // insertAuditTrailEntry()/recordTransition() (see that migration's comment
  // — the pubsub payloads this module subscribes to don't carry
  // event/source/remarks/healthcareFacilityId/etc.), so on rows written
  // through this module these will read back null/false until an upstream
  // publisher starts sending that data; they're wired up here so existing
  // rows (written before this port, or by another writer) and any future
  // publisher upgrade surface correctly instead of being silently dropped.
  event: string | null;
  source: string | null;
  remarks: string | null;
  wasteBagStatus: string | null;
  isGroup: boolean;
  isFailed: boolean;
  transportStatus: string | null;
  healthcareFacilityId: number | null;
  transporterId: number | null;
  thirdPartyProviderId: number | null;
  updatedBy: string | null;
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
// wasteBagAuditTrailController.ts's getAllWasteBagAuditTrail. Migration 16
// (16_extend_waste_bag_audit_trail.up.sql, db/migrations) added
// healthcare_facility_id/transporter_id/third_party_provider_id columns back
// to waste_bag_audit_trail, so those three filters are restored here.
// `search` is still dropped rather than faked — the original's `search`
// param was never actually wired to a WHERE clause in
// WasteBagAuditTrailRepositoryImpl.getAllWasteBagAuditTrails either (dead
// parameter upstream), and there's no free-text column here to search
// against, so there is nothing to port.
export interface GetAllWasteBagAuditTrailsRequest {
  limit?: number;
  page?: number;
  wasteBagId?: number;
  healthcareFacilityId?: number;
  transporterId?: number;
  thirdPartyProviderId?: number;
}

export interface GetAllWasteBagAuditTrailsResponse {
  status: "success";
  data: PaginatedWasteBagAuditTrailEntries;
}
