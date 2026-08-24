// Mirrors apps/wms-service's domain/entities/UserFcmToken.ts field-for-field.
export interface UserFcmToken {
  id: number;
  userId: number;
  entityId: number;
  userUuid: string;
  token: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// ---- GET /api/v1/fcm-token ----
export interface GetUserFcmTokenRequest {
  id?: string;
  entityId?: string;
}
export interface GetUserFcmTokenResponse {
  status: "success";
  data: UserFcmToken;
}

// ---- PATCH /api/v1/fcm-token/:token ----
export interface CreateOrUpdateUserFcmTokenRequest {
  token: string;
}
export interface CreateOrUpdateUserFcmTokenResponse {
  status: "success";
  data: UserFcmToken;
}

// Internal shape passed from controller -> service for GET, carrying the raw
// query params before the presence checks the original use-case ran.
export interface GetUserFcmTokenInput {
  id?: string;
  entityId?: string;
}

// Internal shape passed from controller -> service for PATCH, carrying values
// the original controller derived from req.user (auth) rather than the route
// param, plus the :token route param itself.
export interface CreateOrUpdateUserFcmTokenInput {
  userId: number;
  entityId: number;
  userUuid: string;
  token: string;
}
