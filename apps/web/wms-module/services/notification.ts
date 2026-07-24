import { TCommonFilter } from '@/types/common';
import {
  GetNotificationCountResponse,
  GetNotificationResponse,
  GetNotificationTypesParams,
  GetNotificationTypesResponse,
} from '@/types/notification';
import { handleAxiosResponse } from '@/utils/api';
import axios from 'src/lib/axios';

export type GetNotificationParams = TCommonFilter;

export type GetNotificationCountParams = {
  forSuperAdmin?: boolean;
  forAdmin?: boolean;
  forOperator?: boolean;
};

export async function getNotification(
  params: GetNotificationParams
): Promise<GetNotificationResponse> {
  const response = await axios.get('/notification', {
    params,
  });

  return handleAxiosResponse<GetNotificationResponse>(response);
}

export async function requestReadById(id: number) {
  const response = await axios.patch(`/notification/${id}/read`);

  return response?.data;
}

export async function requestReadAllNotification() {
  const response = await axios.patch(`/notification/read`);

  return response?.data;
}

export async function getNotificationCount(
  params: GetNotificationCountParams
): Promise<GetNotificationCountResponse> {
  const response = await axios.get(`/notification/count`, {
    params,
  });

  return response?.data;
}

export async function sendFCMToken(token: string) {
  console.log('SMILE: Sending FCM token to server:', token);
  const response = await axios.patch(`/fcm-token/${token}`);
  console.log('token has been sent');
  return response;
}

export async function getNotificationTypes(
  params: GetNotificationTypesParams
): Promise<GetNotificationTypesResponse> {
  const response = await axios.get('/notification/type', { params });

  return handleAxiosResponse<GetNotificationTypesResponse>(response);
}

export async function loadNotificationTypes(
  keyword: string,
  _: unknown,
  additional: {
    page: number;
  } = { page: 1 }
) {
  const result = await getNotificationTypes({
    limit: 10,
    search: keyword,
    page: additional.page,
  });

  if (result.status === 'false' || result.statusCode === 204)
    return {
      options: [],
      hasMore: false,
      additional: {
        ...additional,
        page: additional.page,
      },
    };

  const options =
    result?.data?.data?.map((item) => ({
      label: item?.title,
      value: item?.type,
    })) ?? [];

  return {
    options,
    hasMore: (result?.page ?? 0) < (result?.total_page ?? 0),
    additional: {
      ...additional,
      page: additional.page + 1,
    },
  };
}
