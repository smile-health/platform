// Mirrors apps/wms-service's domain/entities/Partnership.ts field-for-field
// (id/createdBy/updatedBy/timestamps plus the business columns), minus most
// of the cross-service-enriched fields (consumerDetail/providerDetail/
// *CompanyName/consumerProvinceName/consumerCityName/nib) and the joined
// wasteClassification hierarchy object — those came from getEntityDetail(...)/
// a Sequelize include against apps/core's entities/waste-classification/
// waste-hierarchy tables in the original, none of which are ported here.
// providerName/consumerName ARE populated, from the local `entities` table
// (see partnership.service.ts's withProviderConsumerNames and
// shared/core/entity-user-lookup.ts) rather than the HTTP fallback. See
// partnership.repository.ts for the remaining TODOs.
export type PartnershipConsumerType =
  | "HEALTHCARE_FACILITY"
  | "TRANSPORTER"
  | "TRANSPORTER_RECYCLER"
  | "TRANSPORTER_SPECIALIZED_TREATMENT_PROVIDER"
  | "TRANSPORTER_LANDFILL"
  | "TRANSPORTER_TREATMENT"
  | "TRANSPORTER_TREATMENT_PROVIDER";

export type PartnershipProviderType =
  | "LANDFILLER"
  | "TREATMENT_PROVIDER"
  | "RECYCLER"
  | "TREATMENT"
  | "SPECIALIZED_TREATMENT_PROVIDER"
  | "TRANSPORTER"
  | "TRANSPORTER_RECYCLER"
  | "TRANSPORTER_SPECIALIZED_TREATMENT_PROVIDER"
  | "TRANSPORTER_LANDFILL"
  | "TRANSPORTER_TREATMENT"
  | "TRANSPORTER_TREATMENT_PROVIDER"
  | "TRANSPORTER_GOVERNMENT"
  | "TRANSPORTER_GOVERNMENT_WASTE_BANK";

export type PartnershipStatusValue = "PENDING" | "ACTIVE" | "SUSPENDED" | "TERMINATED" | "EXPIRED";

export interface Partnership {
  id: number;
  createdBy: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt?: Date;
  contractId?: string;
  contractStartDate?: Date;
  contractEndDate?: Date;
  consumerId: number;
  consumerType: PartnershipConsumerType;
  wasteClassificationId?: number;
  providerId: number;
  providerType?: PartnershipProviderType;
  partnershipStatus: PartnershipStatusValue;
  hasIncinerator: boolean;
  hasAutoclave: boolean;
  picName?: string;
  picPosition?: string;
  picPhoneNumber?: string;
  pricePerKg?: number;
  transporterId?: number;
  // Populated from the local `entities` table — see
  // partnership.service.ts's withProviderConsumerNames.
  providerName?: string;
  consumerName?: string;
}

export interface PaginationMeta {
  total: number;
  pages: number;
  currentPage: number;
  perPage: number;
}

export interface PaginatedPartnerships {
  data: Partnership[];
  pagination: PaginationMeta;
}

// Mirrors domain/entities/Partnership.ts's PartnershipSelectDTO — the
// thirdparty-admin listing groups by providerId and enriches with
// providerName, populated from the local `entities` table (same as above).
export interface PartnershipSelect {
  id: number;
  providerId: number;
  providerName?: string;
}

// Mirrors getHasMultiplePartnership()'s raw-SQL projection exactly (see
// PartnershipRepositoryImpl.ts) — deliberately loose/no domain entity in the
// original either, just a plain row shape.
export interface MultipleTransporterPartnership {
  transporterId: number;
  transporterName: string | null;
  contractStartDate: Date | null;
  contractEndDate: Date | null;
}

// ---- GET /api/v1/partnership/:id ----
export interface GetPartnershipByIdRequest {
  id: string;
}
export interface GetPartnershipByIdResponse {
  status: "success";
  data: Partnership;
}

// ---- GET /api/v1/partnership ----
export interface GetAllPartnershipsRequest {
  limit?: number;
  page?: number;
  search?: string;
  providerId?: number;
  consumerId?: number;
  wasteClassificationId?: number;
  partnershipStatus?: string;
}
export interface GetAllPartnershipsResponse {
  status: "success";
  data: PaginatedPartnerships;
}

// ---- POST /api/v1/partnership ----
// One request may fan out into several created rows — one per
// wasteClassification[] entry — mirroring CreatePartnership.ts's `for await`
// loop exactly (see partnership.service.ts).
export interface CreatePartnershipWasteClassificationInput {
  wasteClassificationId: number;
  price?: number;
  providerTypes?: "LANDFILLER" | "RECYCLER" | "TREATMENT";
}
export interface CreatePartnershipRequest {
  contractStartDate?: string;
  contractEndDate?: string;
  contractId?: string;
  partnershipStatus: PartnershipStatusValue;
  providerType?: PartnershipProviderType;
  hasIncinerator?: boolean;
  hasAutoclave?: boolean;
  consumerId: number;
  consumerType: PartnershipConsumerType;
  providerId: number;
  picName?: string;
  picPosition?: string;
  picPhoneNumber?: string;
  pricePerKg?: number;
  wasteClassification?: CreatePartnershipWasteClassificationInput[];
}
export interface CreatePartnershipResponse {
  status: "success";
  data: Partnership[];
}

// ---- PUT /api/v1/partnership/:id ----
export interface UpdatePartnershipRequest {
  id: string;
  contractStartDate?: string;
  contractEndDate?: string;
  contractId?: string;
  partnershipStatus: PartnershipStatusValue;
  providerType: PartnershipProviderType;
  hasIncinerator?: boolean;
  hasAutoclave?: boolean;
  consumerId: number;
  consumerType: PartnershipConsumerType;
  wasteClassificationId?: number;
  providerId: number;
  picName?: string;
  picPosition?: string;
  picPhoneNumber?: string;
  pricePerKg?: number;
}
export interface UpdatePartnershipResponse {
  status: "success";
  data: Partnership;
}

// ---- DELETE /api/v1/partnership/:id ----
export interface DeletePartnershipRequest {
  id: string;
}
export interface DeletePartnershipResponse {
  status: "success";
  data: boolean;
}

// ---- GET /api/v1/partnership/thirdparty ----
export interface GetPartnershipByThirdPartyAdminRequest {
  // Original derives this from req.user.entity.entity_type.name — overridden
  // to 'hospital' for the allowed hospital entity types (see controller).
  entityTag?: string;
}
export interface GetPartnershipByThirdPartyAdminResponse {
  status: "success";
  data: PartnershipSelect[];
}

// ---- GET /api/v1/partnership/multiple-transporter ----
export interface GetHasMultiplePartnershipRequest {
  healthcareFacilityId?: number;
  wasteClassificationId?: string;
}
export interface GetHasMultiplePartnershipResponse {
  status: "success";
  data: MultipleTransporterPartnership[];
}

// Mirrors findOneThirdParty()'s raw-SQL projection (PartnershipRepositoryImpl.ts) —
// the single "current" transporter-slot partnership for a given
// (healthcareFacility, transporter, wasteClassification) combination.
export interface ThirdPartyMatch {
  thirdPartyId: number;
  thirdPartyName: string | null;
  contractStartDate: Date | null;
  contractEndDate: Date | null;
}

// ---- GET /api/v1/partnership/third-parties ----
export interface FindOneThirdPartyRequest {
  transporterId: number;
  wasteClassificationId?: string;
  healthcareFacilityId?: number;
}
export interface FindOneThirdPartyResponse {
  status: "success";
  data: ThirdPartyMatch | null;
}

// Mirrors HealthcareSelectDTO — the original enriches consumerName via a
// cross-service getEntityDetail(consumerId, token) call against apps/core.
// Simplified here to a plain join against the local `entities` table (this
// module's DB already has that table and joins it the same way in
// findMultipleTransporterPartnerships), so no thirdparty-admin client is
// needed for this read path.
export interface HealthcareSelect {
  consumerId: number;
  consumerName: string | null;
}

// ---- GET /api/v1/partnership/healthcare-thirdparty ----
export interface GetHealthcareByThirdPartyAdminResponse {
  status: "success";
  data: HealthcareSelect[];
}

// Mirrors WasteClassificationSelectDTO (getWasteClassificationByHealthcare()).
export interface WasteClassificationSelect {
  id: number;
  wasteClassificationId: number;
  wasteCharacteristicName: string | null;
  providerType: PartnershipProviderType | null;
  contractId: string | null;
  contractStartDate: Date | null;
  contractEndDate: Date | null;
  wasteCode: string;
}

// ---- GET /api/v1/partnership/waste-classification ----
export interface GetWasteClassificationByHealthcareRequest {
  consumerId?: number;
  isSameCompany?: number;
}
export interface GetWasteClassificationByHealthcareResponse {
  status: "success";
  data: WasteClassificationSelect[];
}

// Mirrors PartnershipWasteClassification (getWasteClassificationByConsumerIdAndProviderId()).
export interface PartnershipWasteClassification {
  wasteClassificationId: number;
  wasteCharacteristicsName: string | null;
  wasteCharacteristicsNameEn: string | null;
  wasteCode: string;
  price: number | null;
  contractStartDate: Date | null;
  contractEndDate: Date | null;
  contractId: string | null;
  partnershipStatus: PartnershipStatusValue;
  providerType: PartnershipProviderType | null;
}

export interface PaginatedPartnershipWasteClassifications {
  data: PartnershipWasteClassification[];
  pagination: PaginationMeta;
}

// ---- GET /api/v1/partnership/waste-classification-consumer-thirdparty ----
export interface GetWasteClassificationByConsumerIdAndProviderIdRequest {
  limit?: number;
  page?: number;
  providerId: number;
  consumerId?: number;
}
export interface GetWasteClassificationByConsumerIdAndProviderIdResponse {
  status: "success";
  data: PaginatedPartnershipWasteClassifications;
}

// Internal shapes passed from controller -> service, carrying values the
// original controller derived from req.user (auth)/the bearer token rather
// than the request body/query.
export interface CreatePartnershipInput extends CreatePartnershipRequest {
  createdBy: string;
  // Original: `req.user?.providerType ? req.user?.entity.id : null` — see
  // partnership.controller.ts's createPartnership, which now derives this
  // from AuthData.providerType (shared/auth/authHandler.ts).
  transporterId?: number;
}

export interface UpdatePartnershipInput extends UpdatePartnershipRequest {
  updatedBy: string;
}

export interface DeletePartnershipInput {
  id: string;
  deletedBy?: number;
}

export interface GetAllPartnershipsInput extends GetAllPartnershipsRequest {
  entityId?: number;
  entityTag?: string;
}

export interface GetPartnershipByThirdPartyAdminInput {
  entityId?: number;
  entityTag?: string;
}

export interface GetHasMultiplePartnershipInput {
  healthcareFacilityId?: number;
  wasteClassificationIds: number[];
}

export interface FindOneThirdPartyInput {
  healthcareFacilityId?: number;
  transporterId: number;
  wasteClassificationIds: number[];
}

export interface GetWasteClassificationByHealthcareInput {
  consumerId?: number;
  providerId: number;
  isSameCompany?: number;
}

export interface GetWasteClassificationByConsumerIdAndProviderIdInput {
  limit?: number;
  page?: number;
  providerId: number;
  consumerId: number;
}

// ---------------------------------------------------------------------------
// updateStatus — pre-existing, preserved verbatim (see header note in
// partnership.controller.ts / partnership.service.ts). NOT part of the CRUD
// surface added above; this is the illustrative-scope publish-and-forget path
// that already fed scheduled-event-dispatcher's PartnershipFollowUp handling.
// ---------------------------------------------------------------------------

// NOTE — deliberate simplification, not a faithful port: the original
// PartnershipStatusUpdatePublisher.ts doesn't actually carry a previousStatus/
// newStatus pair. It publishes a generic {level, message, event, metadata} log
// message, and the downstream handler (ScheduleEventForPartnershipUseCase)
// specifically checks for event === 'PARTNERSHIP_CONTRACT_EXPIRED' and
// schedules a reminder at metadata.endTime (the contract's expiry date) — not
// a fixed 24h follow-up like waste-bag/manual-scale-request.
//
// This skeleton instead matches the partnership-status-updated topic contract
// already established (PartnershipStatusUpdateEvent: previousStatus/newStatus)
// for consistency with the other two illustrative-scope publishers. Porting
// the real contract-expiry-date scheduling semantics is a larger, separate
// piece of the full partnership module (UpdatePartnership/CreatePartnership
// use-cases), out of scope for this event-graph skeleton.

export interface UpdatePartnershipStatusRequest {
  id: number;
  previousStatus: string;
  newStatus: string;
}

export interface UpdatePartnershipStatusResponse {
  status: "success";
  data: { partnershipId: number; newStatus: string };
}
