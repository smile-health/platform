// Mirrors apps/wms-service's interfaces/http/controllers/mobile/homepageController.ts
// (getDataHomePage / getDetailDataHomePage), mounted at
// v1RouterMobile.use('/homepage', homepageRoutes) under app.use('/api/v1/mobile', ...).
//
//   GET /api/v1/mobile/homepage                             getDataHomePage
//   GET /api/v1/mobile/homepage/waste-bag-details/:wasteId   getDetailDataHomePage
//
// DEFERRED (documented, not implemented — same class of gap as every other
// already-ported module in this codebase):
//   - locationName / user.name: the original reads req.user.entity.name and
//     req.user.firstname/lastname off the locally-synced `entities`/`users`
//     mirror wms-service kept from apps/core. This rewrite's AuthData
//     (shared/auth/authHandler.ts) only narrows the core profile down to
//     entityId/entityTag/isSuperAdmin/etc — no entity name or user name is
//     carried through. Left undefined here, same convention as
//     waste-classification's `userName` field.
//   - wasteTypeId / wasteGroupId / wasteCharacteristicsId / sourceType /
//     entityTag filters: the original's WasteBagRepositoryImpl.getAllWasteBag
//     supports filtering by these, but the already-ported
//     waste-bag.repository.ts's findPaginated (which this module reuses,
//     rather than re-implementing the underlying big getAllWasteBag SQL) does
//     not expose them yet — same known gap as that module. Not reproduced
//     here; passed through as accepted-but-unused query params where the
//     original also accepted them, to keep the request shape.
//   - wasteHistory / processWastebagEnd (getDetailDataHomePage only): the
//     original's `logHistory` comes from a status-audit-trail join
//     (WasteBagModel's `logHistory` association) — a cross-module concern
//     owned by the audit-trail module being ported separately. Returned as
//     an empty array here; processWastebagEnd is left undefined (no
//     equivalent field on the ported WasteBag entity).

export interface WasteHierarchyLabel {
  id: string;
  label: string;
  labelEn: string;
}

export interface WasteClassificationLabels {
  wasteType: WasteHierarchyLabel;
  wasteGroup: WasteHierarchyLabel;
  wasteCharacteristic: WasteHierarchyLabel;
}

export interface BFFWasteBagStorageDate {
  timestamp: string;
  difference: {
    days: number;
    hours: number;
    minutes: number;
    milliseconds: number;
    isExpired: boolean;
  };
}

export interface WasteRecapItem {
  type: string;
  weight: number;
  unit: "kg";
  transactionCount: unknown;
  manualWeight: number;
  manualBagsCount: unknown;
  iotWeight: number;
  iotBagsCount: unknown;
}

export interface HomepageTransactionItem {
  id: string | undefined;
  date: Date;
  classification: WasteClassificationLabels;
  treatmentStatus: string;
  wasteStatus: string;
  disposalMethod: string | null | undefined;
  weight: { value: number; unit: "kg" };
  storageEndDate?: BFFWasteBagStorageDate;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

// GET /api/v1/mobile/homepage
export interface GetDataHomePageRequest {
  startDate?: string;
  endDate?: string;
  wasteType?: string;
  wasteGroup?: string;
  wasteCharacteristics?: string;
  wasteTreatment?: "in_temporary_storage" | "in_cold_storage" | "sterilised" | "incinerated";
  query?: string;
  search?: string;
  page?: number;
  limit?: number;
  healthcareId?: number;
  transporterId?: number;
  thirdPartyId?: number;
  wasteUpdateStart?: string;
  wasteUpdateEnd?: string;
  wasteClassificationId?: string; // JSON-encoded number[], same as the original query param
  transportationGroupId?: number;
  transportationExternalGroupId?: number;
  treatmentGroupId?: number;
  treatmentExternalGroupId?: number;
  sourceType?: string; // accepted, not applied — see file header
  ownedBy?: string;
  wasteStatus?: string;
  binNumber?: string;
  wasteBagQrCodeId?: string;
  id?: number;
  wasteTypeId?: number; // accepted, not applied — see file header
  wasteGroupId?: number; // accepted, not applied — see file header
  wasteCharacteristicsId?: number; // accepted, not applied — see file header
  isTreated?: boolean;
  isDisposed?: boolean;
}
export interface GetDataHomePageResponse {
  status: "success";
  data: {
    locationName?: string;
    user: { name?: string; languagePreference: "EN" };
    wasteRecap: WasteRecapItem[];
    transactions: {
      pagination: PaginationMeta;
      data: HomepageTransactionItem[];
    };
  };
}

// GET /api/v1/mobile/homepage/waste-bag-details/:wasteId
export interface GetDetailDataHomePageRequest {
  wasteId: string;
  search?: string;
  healthcareId?: number;
  transporterId?: number;
  thirdPartyId?: number;
  wasteUpdateStart?: string;
  wasteUpdateEnd?: string;
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
export interface GetDetailDataHomePageResponse {
  status: "success";
  data: {
    id: string | undefined;
    date: Date;
    classification: WasteClassificationLabels;
    disposalMethod: string | null | undefined;
    wasteSourceType: string;
    wasteSourceName: string;
    weight: string;
    scaleMethod: string;
    treatmentStatus: string;
    wasteHistory: unknown[];
    storageEndDate?: BFFWasteBagStorageDate;
    processWastebagEnd?: unknown;
  };
}
