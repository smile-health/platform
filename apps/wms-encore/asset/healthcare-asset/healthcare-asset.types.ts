import type { Header } from "encore.dev/api";

// Mirrors apps/wms-service's domain/entities/HealthcareAsset.ts field-for-field.
export interface HealthcareAsset {
  id: number;
  healthcareFacilityId: number;
  assetId?: string | null;
  assetTypeName: string;
  assetWorkingStatusName: string;
  status: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// POST /api/v1/healthcare-asset
// Mirrors createHealthcareAsset.schema.ts. createdAt/updatedAt are ISO
// strings on the wire (the original schema does `z.string().transform(...
// => new Date(val))`); parsed to Date in the service, not here.
export interface CreateHealthcareAssetRequest {
  id: number;
  assetId?: string;
  healthcareFacilityId: number;
  assetTypeName: string;
  assetWorkingStatusName: string;
  createdAt: string;
  updatedAt: string;
}
export interface CreateHealthcareAssetResponse {
  status: "success";
  data: HealthcareAsset;
}

// GET /api/v1/healthcare-asset/:id
// Original reads healthcareFacilityId from query OR body, falling back to
// req.user?.entity_id (auth entityId) if neither is supplied. There's no
// meaningful request body on a GET in this port, so only the query param +
// auth fallback are ported.
export interface GetHealthcareAssetByIdRequest {
  id: string;
  healthcareFacilityId?: number;
  authorization: Header<"Authorization">;
  acceptLanguage?: Header<"Accept-Language">;
}
export interface GetHealthcareAssetByIdResponse {
  status: "success";
  // Original returns `{ assetId, ...assetInventories }` — an arbitrary
  // third-party payload spread onto a local field. Typed as an open record
  // rather than `object` since apps/core's asset-inventory response shape
  // isn't a fixed contract this port owns.
  data: Record<string, unknown>;
}

// PUT /api/v1/healthcare-asset/:id
// Mirrors updateHealthcareAsset.schema.ts. `status` is boolean|0|1 on the
// wire in the original (z.union([boolean, 0|1]).transform(Boolean)) —
// ported as a plain boolean; the 0/1-number variant is validated away in the
// service via zod, matching convention for enum-like/loosely-typed wire
// fields.
export interface UpdateHealthcareAssetRequest {
  id: string;
  assetId?: string | null;
  healthcareFacilityId?: number;
  assetTypeName?: string;
  assetWorkingStatusName?: string;
  status?: boolean;
  createdAt?: string;
  updatedAt?: string;
  authorization: Header<"Authorization">;
}
export interface UpdateHealthcareAssetResponse {
  status: "success";
  data: HealthcareAsset;
}
