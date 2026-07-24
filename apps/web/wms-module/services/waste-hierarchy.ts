import i18n from '@/locales/i18n';
import { TCommonFilter } from '@/types/common';
import {
  CreateWasteCharacteristicInput,
  CreateWasteGroupInput,
  CreateWasteTypeInput,
  GetAllByParentHierarchyResponse,
  GetWasteCharacteristicDetailResponse,
  GetWasteCharacteristicResponse,
  GetWasteGroupDetailResponse,
  GetWasteGroupResponse,
  GetWasteHierarchyClassificationResponse,
  GetWasteTypeDetailResponse,
  GetWasteTypeResponse,
  UpdateWasteCharacteristicInput,
  UpdateWasteGroupInput,
  UpdateWasteTypeInput,
} from '@/types/waste-hierarchy';
import { handleAxiosResponse } from '@/utils/api';
import axios from 'src/lib/axios';

// There are 3 levels of waste hierarchy
// 1. Waste type
// 2. Waste group
// 3. Waste characteristic
export type GetWasteHierarchyParams = TCommonFilter & {
  level: number;
};

export async function getWasteHierarchy(
  params: GetWasteHierarchyParams
): Promise<
  GetWasteTypeResponse | GetWasteGroupResponse | GetWasteCharacteristicResponse
> {
  const response = await axios.get('/waste-hierarchy', {
    params: {
      ...params,
    },
    headers: {
      'Accept-Language': 'en',
    },
  });

  return handleAxiosResponse<
    | GetWasteTypeResponse
    | GetWasteGroupResponse
    | GetWasteCharacteristicResponse
  >(response);
}

export type GetAllByParentHierarchyParams = {
  search?: string;
  parent_hierarchy_id: number | string;
};

export async function getAllByParentHierarchy(
  params: GetAllByParentHierarchyParams
): Promise<GetAllByParentHierarchyResponse> {
  const response = await axios.get('/waste-hierarchy/parent-hierarchy', {
    params,
  });

  return handleAxiosResponse<GetAllByParentHierarchyResponse>(response);
}

export async function getWasteHierarchyDetail(
  id: string | number
): Promise<
  | GetWasteTypeDetailResponse
  | GetWasteGroupDetailResponse
  | GetWasteCharacteristicDetailResponse
> {
  const response = await axios.get(`/waste-hierarchy/${id}`, {
    cleanParams: true,
  });

  return response.data;
}

export async function getWasteHierarchyClassification(): Promise<GetWasteHierarchyClassificationResponse> {
  const response = await axios.get(
    `/waste-hierarchy/explanation-waste-classification`,
    {
      cleanParams: true,
    }
  );

  return response?.data;
}

export async function createWasteType(data: CreateWasteTypeInput) {
  const response = await axios.post('/waste-hierarchy', data);

  return response?.data;
}

export async function createWasteGroup(data: CreateWasteGroupInput) {
  const response = await axios.post('/waste-hierarchy', data);

  return response?.data;
}

export async function createWasteCharacteristic(
  data: CreateWasteCharacteristicInput
) {
  const response = await axios.post('/waste-hierarchy', data);

  return response?.data;
}

export async function updateWasteType(id: number, body: UpdateWasteTypeInput) {
  const data = { ...body };
  const response = await axios.put(`/waste-hierarchy/${id}`, data);

  return response?.data;
}

export async function updateWasteGroup(
  id: number,
  body: UpdateWasteGroupInput
) {
  const data = { ...body };
  const response = await axios.put(`/waste-hierarchy/${id}`, data);

  return response?.data;
}

export async function updateWasteCharacteristic(
  id: number,
  body: UpdateWasteCharacteristicInput
) {
  const data = { ...body };
  const response = await axios.put(`/waste-hierarchy/${id}`, data);

  return response?.data;
}

export async function loadWasteByParentHierarchyId(
  keyword: string,
  _: unknown,
  additional: {
    page: number;
    parent_hierarchy_id: number | null;
    isWasteCode?: boolean;
  }
) {
  const { parent_hierarchy_id, isWasteCode, ...rest } = additional;

  const result = await getAllByParentHierarchy({
    parent_hierarchy_id: parent_hierarchy_id ?? 'null',
    search: keyword,
    ...rest,
  });

  if (result.status === 'false')
    return {
      options: [],
      additional: {
        ...additional,
        page: additional?.page,
        parent_hierarchy_id,
      },
    };

  const options = result?.data?.map((item) => {
    const displayName =
      i18n.language === 'id' ? item?.name : item?.nameEn || item?.name;
    return {
      label:
        isWasteCode &&
        item?.wasteClassification?.wasteCode &&
        item?.wasteClassification?.wasteCode !== '-'
          ? `${displayName} - ${item?.wasteClassification?.wasteCode}`
          : displayName,
      value: item?.id,
      data: {
        wasteClassificationId: item?.wasteClassification?.id,
      },
    };
  });

  return {
    options,
    additional: {
      ...additional,
      page: additional.page + 1,
      parent_hierarchy_id,
    },
  };
}

export async function deleteWasteHierarchy(id: number) {
  const response = await axios.delete(`waste-hierarchy/${id}`, {
    cleanParams: true,
  });

  return response?.data;
}
