import { getInternalTreatmentOptions } from '@/components/waste-source/utils/helper';
import { TCommonFilter } from '@/types/common';
import {
  CreateWasteSourceInput,
  GetWasteSourceDetailResponse,
  GetWasteSourceResponse,
  TWasteSource,
  UpdateWasteSourceInput,
} from '@/types/waste-source';
import { handleAxiosResponse } from '@/utils/api';
import axios from 'src/lib/axios';

export type GetWasteSourceParams = TCommonFilter & {
  search?: string;
  sourceType?: string;
};

export async function getWasteSource(
  params: GetWasteSourceParams
): Promise<GetWasteSourceResponse> {
  const response = await axios.get('/waste-source', {
    params,
  });

  return handleAxiosResponse<GetWasteSourceResponse>(response);
}

export async function createWasteSource(data: CreateWasteSourceInput) {
  const response = await axios.post('/waste-source', data);

  return response?.data;
}

export async function getWasteSourceDetail(
  id: string | number
): Promise<GetWasteSourceDetailResponse> {
  const response = await axios.get(`/waste-source/${id}`, {
    cleanParams: true,
  });

  return response?.data;
}

export async function updateWasteSource(
  id: number,
  body: UpdateWasteSourceInput
) {
  const data = { ...body };
  const response = await axios.put(`/waste-source/${id}`, data);

  return response?.data;
}

export async function deleteWasteSource(id: number) {
  const response = await axios.delete(`waste-source/${id}`, {
    cleanParams: true,
  });

  return response?.data;
}

export async function loadWasteSourceList(
  keyword: string,
  _: unknown,
  additional: {
    page: number;
    sourceType: string;
  }
) {
  const result = await getWasteSource({
    limit: 10,
    search: keyword,
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

  const options = result.data.data.map((item: TWasteSource) => {
    let label = '';

    switch (item.sourceType) {
      case 'INTERNAL_TREATMENT': {
        const treatment = getInternalTreatmentOptions().find(
          (option) => option.value === item.internalTreatmentName
        );
        label = treatment?.label ?? item.internalTreatmentName ?? '';
        break;
      }
      case 'EXTERNAL':
        label = item.externalHealthcareFacilityName ?? '';
        break;
      case 'INTERNAL':
      default:
        label = item.internalSourceName ?? '';
    }

    return {
      label,
      value: item.id,
    };
  });

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
