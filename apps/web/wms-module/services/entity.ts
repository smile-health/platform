import { getTranslatedTagLabel } from '@/components/user-activity/utils/helper';
import { SMILE_SERVICES } from '@/constants/smile-api';
import { TCommonFilter } from '@/types/common';
import {
  GetEntityDetailUsersListParams,
  GetEntityDetailUsersResponse,
  GetEntityListParams,
  GetEntityListResponse,
  GetEntityWmsDetailResponse,
  GetEntityWmsResponse,
  TEntities,
  UpdateEntityInput,
} from '@/types/entity';
import { handleAxiosResponse } from '@/utils/api';
import axios from 'src/lib/axios';

const BASE_URL = process.env.API_URL_V5;
const CORE_SERVICE = SMILE_SERVICES.CORE;

export async function getEntityList(
  params: GetEntityListParams
): Promise<GetEntityListResponse> {
  const response = await axios.get(`${CORE_SERVICE}/entities`, {
    baseURL: BASE_URL,
    params,
  });

  return handleAxiosResponse<GetEntityListResponse>(response);
}

export async function getEntityDetail(id: string | number): Promise<TEntities> {
  const response = await axios.get(`${CORE_SERVICE}/entities/${id}`, {
    baseURL: BASE_URL,
    cleanParams: true,
  });

  return response.data as TEntities;
}

export async function getEntityWmsDetail(
  entityId?: string | number
): Promise<GetEntityWmsDetailResponse> {
  const response = await axios.get('/entities', {
    params: entityId ? { entityId } : undefined,
  });

  return response.data as GetEntityWmsDetailResponse;
}

export async function updateEntity(body: UpdateEntityInput) {
  const data = { ...body };
  const response = await axios.patch(`/entities`, data);

  return response?.data;
}

export async function getEntityUsersList(
  params: GetEntityDetailUsersListParams
): Promise<GetEntityDetailUsersResponse> {
  const response = await axios.get(`${CORE_SERVICE}/users`, {
    baseURL: BASE_URL,
    params,
  });

  return response.data as GetEntityDetailUsersResponse;
}

export async function loadEntityList(
  keyword: string,
  _: unknown,
  additional: {
    page: number;
    entity_tags_ids?: number;
    type_ids?: string;
    is_vendor?: number;
    province_ids?: string;
    regency_ids?: string;
  } = { page: 1 }
) {
  const result = await getEntityList({
    paginate: 10,
    keyword,
    ...additional,
  });

  if (result.status === 'false' || result.statusCode === 204)
    return {
      options: [],
      hasMore: false,
      additional: {
        ...additional,
        page: additional?.page,
      },
    };

  const options = result.data.map((item) => ({
    label: item?.name,
    value: item?.id,
  }));

  return {
    options,
    hasMore: (result?.page ?? 0) < (result?.total_page ?? 0),
    additional: {
      ...additional,
      page: additional.page + 1,
    },
  };
}

export type GetEntityWmsParams = TCommonFilter & {
  search?: string;
  entityId?: string;
  entityTypeId?: number;
  groupBy?: string;
  attributes?: string;
};

export async function getEntityWmsList(
  params: GetEntityWmsParams
): Promise<GetEntityWmsResponse> {
  const response = await axios.get('/entities/all', {
    params,
  });

  return handleAxiosResponse<GetEntityWmsResponse>(response);
}

export async function loadEntityWmsTagsList(
  _: unknown,
  additional: {
    page: number;
    sourceType: string;
  }
) {
  const result = await getEntityWmsList({
    limit: 100,
    entityTypeId: 3,
    groupBy: 'tag',
    attributes: 'tag',
    ...additional,
  });

  if (result.status === 'false')
    return {
      options: [],
      hasMore: false,
      additional: {
        ...additional,
        page: additional?.page,
      },
    };

  const options = result.data.data.map((item) => ({
    label: getTranslatedTagLabel(item?.tag),
    value: item?.tag,
  }));

  const { currentPage, pages } = result?.data?.pagination ?? {};

  return {
    options,
    hasMore: currentPage < pages,
    additional: {
      ...additional,
      page: additional.page + 1,
    },
  };
}

export async function loadEntityCompanyList(
  keyword: string,
  _: unknown,
  additional: {
    page: number;
    sourceType: string;
  }
) {
  const result = await getEntityWmsList({
    limit: 10,
    entityTypeId: 6,
    search: keyword,
    attributes: 'id, name',
    ...additional,
  });

  if (result.status === 'false')
    return {
      options: [],
      hasMore: false,
      additional: {
        ...additional,
        page: additional?.page,
      },
    };

  const options = result.data.data.map((item) => ({
    label: item?.name,
    value: item?.id,
  }));

  const { currentPage, pages } = result?.data?.pagination ?? {};

  return {
    options,
    hasMore: currentPage < pages,
    additional: {
      ...additional,
      page: additional.page + 1,
    },
  };
}

export type UpdateEntityStatus = {
  is_active?: number;
};

export async function updateEntityStatus(id: number, body: UpdateEntityStatus) {
  const data = { ...body };
  const response = await axios.put(`/entities/${id}`, data);

  return response?.data;
}
