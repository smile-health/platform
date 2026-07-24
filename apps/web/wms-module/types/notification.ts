import { TCommonPaginationResponse, TCommonResponseList } from './common';

export type TNotification = {
  id: number;
  message: string;
  userId: number;
  provinceId: number | null;
  regencyId: number | null;
  entityId: number;
  media: string;
  title: string;
  type: string;
  createdAt: string;
  updatedAt: string;
  readAt: string | null;
  mobilePhone: string;
  actionUrl: string | null;
  downloadUrl: string | null;
  patientId: number | null;
  programId: number | null;
  userName: string;
  entityName: string;
};

export type User = {
  id: number;
  username: string | null;
  firstname: string | null;
  lastname: string | null;
  role: number;
  entity_id: number;
};

export type Entity = {
  id: number;
  name: string;
};

export type totalCount = {
  total: number;
};

export type GetNotificationResponse = TCommonResponseList & {
  data: {
    data: TNotification[];
    pagination: TCommonPaginationResponse;
  };
  status: string;
};

export type GetNotificationCountResponse = {
  data: totalCount;
  status: string;
};

export type TNotificationParams = {
  createdStart?: string;
  createdEnd?: string;
  page?: number;
  limit?: number;
  search?: string;
  provinceId?: number;
  regencyId?: number;
};

export type TNotificationType = {
  title: string;
  type: string;
};

export type GetNotificationTypesResponse = TCommonResponseList & {
  data: {
    data: TNotificationType[];
    pagination: TCommonPaginationResponse;
  };
  status: string;
};

export type GetNotificationTypesParams = {
  page?: number;
  limit?: number;
  search?: string;
};
