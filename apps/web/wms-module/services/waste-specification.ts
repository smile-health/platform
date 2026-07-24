import i18n from '@/locales/i18n';
import { TCommonFilter } from '@/types/common';
import {
  GetWasteSpecificationDetailResponse,
  GetWasteSpecificationResponse,
  WasteSpecificationInput,
} from '@/types/waste-specification';
import { handleAxiosResponse } from '@/utils/api';
import axios from 'src/lib/axios';

export type GetWasteSpecificationParams = TCommonFilter & {
  search?: string;
};

export async function getWasteSpecification(
  params: GetWasteSpecificationParams
): Promise<GetWasteSpecificationResponse> {
  const response = await axios.get('/waste-classification', {
    params: {
      ...params,
    },
  });

  return handleAxiosResponse<GetWasteSpecificationResponse>(response);
}

export async function getWasteSpecificationDetail(
  id: string | number
): Promise<GetWasteSpecificationDetailResponse> {
  const response = await axios.get(`/waste-classification/${id}`, {
    cleanParams: true,
  });

  return response.data;
}

export async function createWasteSpecification(data: WasteSpecificationInput) {
  const response = await axios.post('/waste-classification', data);

  return response?.data;
}

export async function updateWasteSpecification(
  id: number,
  body: WasteSpecificationInput
) {
  const data = { ...body };
  const response = await axios.put(`/waste-classification/${id}`, data);

  return response?.data;
}

export async function loadWasteSpecificationList(
  keyword: string,
  _: unknown,
  additional: {
    page: number;
  }
) {
  const result = await getWasteSpecification({
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

  const options = result.data.data.map((item) => ({
    label:
      i18n.language === 'id'
        ? item?.wasteCharacteristics?.name
        : (item?.wasteCharacteristics?.nameEn ?? ''),
    value: item?.id, // classification id
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
