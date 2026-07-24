import {
  CreateAssetTypeInput,
  GetAssetTypeDetailResponse,
  GetAssetTypeResponse,
  UpdateAssetTypeInput,
} from '@/types/asset-type';
import { TCommonFilter } from '@/types/common';
import { handleAxiosResponse } from '@/utils/api';
import axios from 'src/lib/axios';

export type GetAssetTypeParams = TCommonFilter & {
  search?: string;
};

export async function getAssetType(
  params: GetAssetTypeParams
): Promise<GetAssetTypeResponse> {
  const response = await axios.get('/asset-type', {
    params,
  });

  return handleAxiosResponse<GetAssetTypeResponse>(response);
}

export async function getAssetTypeDetail(
  id: number
): Promise<GetAssetTypeDetailResponse> {
  const response = await axios.get(`/asset-type/${id}`, {
    cleanParams: true,
  });

  return response?.data;
}

export async function createAssetType(data: CreateAssetTypeInput) {
  const response = await axios.post('/asset-type', data);

  return response?.data;
}

export async function updateAssetTyper(id: number, body: UpdateAssetTypeInput) {
  const data = { ...body };
  const response = await axios.put(`/asset-type/${id}`, data);

  return response?.data;
}
