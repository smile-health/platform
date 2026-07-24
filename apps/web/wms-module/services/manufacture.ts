import { TCommonFilter } from '@/types/common';
import {
  CreateManufactureInput,
  CreateManufactureOptionInput,
  GetManufactureDetailResponse,
  GetManufactureResponse,
  ListManufacturersParams,
  ListManufacturersResponse,
  UpdateManufactureInput,
} from '@/types/manufacture';
import { handleAxiosResponse } from '@/utils/api';
import axios from 'src/lib/axios';

export type GetManufactureParams = TCommonFilter & {
  search?: string;
  assetType?: string;
  manufacturerId?: number;
};

export async function getManufacture(
  params: GetManufactureParams
): Promise<GetManufactureResponse> {
  const response = await axios.get('/asset-model', {
    params,
  });

  return handleAxiosResponse<GetManufactureResponse>(response);
}

export async function createManufactureOption(
  data: CreateManufactureOptionInput
) {
  const response = await axios.post('/asset', data);

  return response?.data;
}

export async function listManufacturers(
  params: ListManufacturersParams
): Promise<ListManufacturersResponse> {
  const response = await axios.get('/asset', {
    params,
  });

  return handleAxiosResponse<ListManufacturersResponse>(response);
}

export async function loadManufacturers(
  keyword: string,
  _: unknown,
  additional: {
    page: number;
  }
) {
  const result = await listManufacturers({
    limit: 10,
    search: keyword,
    page: additional.page ?? 1,
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

  const options = result?.data?.data.map((item) => ({
    label: item?.name,
    value: item?.id,
  }));

  return {
    options,
    hasMore: result?.data?.data.length > 0,
    additional: {
      ...additional,
      page: additional.page + 1,
    },
  };
}

export async function createManufacture(data: CreateManufactureInput) {
  const response = await axios.post('/asset-model', data);

  return response?.data;
}

export async function updateManufacturer(
  id: number,
  body: UpdateManufactureInput
) {
  const data = { ...body };
  const response = await axios.put(`/asset-model/${id}`, data);

  return response?.data;
}

export async function getManufactureDetail(
  id: string | number
): Promise<GetManufactureDetailResponse> {
  const response = await axios.get(`asset-model/${id}`, {
    cleanParams: true,
  });

  return response.data;
}

export async function loadManufacturer(
  keyword: string,
  _: unknown,
  additional: {
    page: number;
    assetType?: string;
    manufacturerId?: number;
  }
) {
  const result = await getManufacture({
    limit: 10,
    search: keyword,
    page: additional.page ?? 1,
    ...(additional.assetType && { assetType: additional.assetType }),
    ...(additional.manufacturerId && {
      manufacturerId: additional.manufacturerId,
    }),
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

  const optionsAssetModel = result?.data?.data.map((item) => ({
    label: item?.name,
    value: item?.id,
  }));

  const optionsManufacturer = Array.from(
    new Map(
      result?.data?.data.map((item) => [
        item?.manufacturer?.id,
        { label: item?.manufacturer?.name, value: item?.manufacturer?.id },
      ])
    ).values()
  );

  return {
    options: additional.manufacturerId
      ? optionsAssetModel
      : optionsManufacturer,
    hasMore: result?.data?.data.length > 0,
    additional: {
      ...additional,
      page: additional.page + 1,
    },
  };
}

export async function deleteManufacture(id: number) {
  const response = await axios.delete(`asset-model/${id}`, {
    cleanParams: true,
  });

  return response?.data;
}
