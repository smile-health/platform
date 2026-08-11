export type RegionType =
  | "COUNTRY"
  | "PROVINCE/STATE"
  | "CITY"
  | "DISTRICT"
  | "SUB-DISTRICT"
  | "VILLAGE";

// Mirrors apps/wms-service's domain/entities/Region.ts field-for-field.
export interface Region {
  id: number;
  code: string;
  name: string;
  regionType: RegionType;
  parentId?: number;
  createdBy: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface GetRegionByIdRequest {
  id: string;
}
export interface GetRegionByIdResponse {
  status: "success";
  data: Region;
}

export type DistanceLimitType = "HF" | "TP" | "TRM";

export interface GetDistanceLimitRequest {
  lat1: number;
  lon1: number;
  lat2: number;
  lon2: number;
  // Plain string, not the DistanceLimitType union — a union here makes Encore's
  // own query decoder reject bad values before region.service.ts's FailError
  // check runs, producing Encore's raw error shape instead of the original's
  // {status:"fail",data:"Type is not correct..."} message. Validation belongs
  // in code here, same as regionController.ts's manual includes() check.
  type: string;
}
export interface GetDistanceLimitResponse {
  status: "success";
  data: boolean;
}
