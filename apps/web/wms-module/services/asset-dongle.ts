import { TCommonFilter } from '@/types/common';
import {
  CreateAssetDongleInput,
  GetAssetDongleResponse,
} from '@/types/asset-dongle';
import { handleAxiosResponse } from '@/utils/api';
import axios from 'src/lib/axios';

export type GetAssetDongleParams = TCommonFilter & {
  search?: string;
};

export async function getAssetDongle(
  params: GetAssetDongleParams
): Promise<GetAssetDongleResponse> {
  const response = await axios.get('/asset-dongle', {
    params,
  });

  return handleAxiosResponse<GetAssetDongleResponse>(response);
}

export async function createAssetDongle(data: CreateAssetDongleInput) {
  const response = await axios.post('/asset-dongle', data);

  return response?.data;
}

export async function deleteAssetDongle(assetId: string) {
  const response = await axios.delete(`asset-dongle/${assetId}`, {
    cleanParams: true,
  });

  return response?.data;
}
