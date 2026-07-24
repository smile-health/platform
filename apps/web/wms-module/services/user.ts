import { SMILE_SERVICES } from '@/constants/smile-api';
import { TCommonFilter } from '@/types/common';
import {
  GetUsersResponse,
  GetUserWmsDetailResponse,
  GetUserWmsResponse,
  TUserDetail,
} from '@/types/user';
import { handleAxiosResponse } from '@/utils/api';
import axios from 'src/lib/axios';

const BASE_URL = process.env.API_URL_V5;
const CORE_SERVICE = SMILE_SERVICES.CORE;

export async function getUserDetail(id: string | number): Promise<TUserDetail> {
  const response = await axios.get(`${CORE_SERVICE}/users/${id}`, {
    baseURL: BASE_URL,
    cleanParams: true,
  });

  return response.data as TUserDetail;
}

export type GetUserParams = TCommonFilter & {
  keyword?: string;
  entity_id: number;
};

export async function getUsers(
  params: GetUserParams
): Promise<GetUsersResponse> {
  const response = await axios.get(`${CORE_SERVICE}/users`, {
    baseURL: BASE_URL,
    params,
  });

  return handleAxiosResponse<GetUsersResponse>(response);
}

export async function loadUsers(
  keyword: string,
  _: unknown,
  additional: {
    page: number;
    entity_id: number;
  }
) {
  const result = await getUsers({
    limit: 10,
    keyword,
    page: additional.page ?? 1,
    entity_id: additional.entity_id,
  });

  if (result?.data.length === 0)
    return {
      options: [],
      hasMore: false,
      additional: {
        ...additional,
        page: additional?.page,
      },
    };

  const options = result?.data
    .filter((item) => item.external_properties?.role?.type.includes('operator'))
    .map((item) => ({
      label: `${item?.firstname ?? ''} ${item?.lastname ?? ''}`.trim() || '-',
      value: item?.user_uuid,
    }));

  return {
    options,
    hasMore: result?.data.length > 0,
    additional: {
      ...additional,
      page: additional.page + 1,
    },
  };
}

export type GetUserWmsParams = TCommonFilter & {
  search?: string;
  entityId?: string;
  entityTypeId?: number;
  provinceId?: string;
  regencyId?: string;
  isActive?: boolean;
  userId?: string;
};

export async function getUsersWmsList(
  params: GetUserWmsParams
): Promise<GetUserWmsResponse> {
  const response = await axios.get('/users', {
    params,
  });

  return handleAxiosResponse<GetUserWmsResponse>(response);
}

export async function getUserWmsDetail(
  userId: string
): Promise<GetUserWmsDetailResponse> {
  const response = await axios.get('/users', {
    params: {
      userId,
    },
  });

  return handleAxiosResponse<GetUserWmsDetailResponse>(response);
}

export type UpdateUserStatus = {
  is_active?: number;
};

export async function updateUserStatus(id: number, body: UpdateUserStatus) {
  const data = { ...body };
  const response = await axios.put(`/users/${id}`, data);

  return response?.data;
}
