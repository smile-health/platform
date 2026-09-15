import {
  GetHealthcareAssetParams,
  GetHealthcareAssetResponse,
  GetHealthcareAssetDetailResponse,
  UpdateHealthcareAssetInput,
} from '@/types/healthcare-asset';
import { handleAxiosResponse } from '@/utils/api';
import axios from 'src/lib/axios';

const CORE_BASE_URL = process.env.API_CORE_URL;

export async function getAssetInventory(
  params: GetHealthcareAssetParams
): Promise<GetHealthcareAssetResponse> {
  const response = await axios.get('/asset-inventories', {
    baseURL: CORE_BASE_URL,
    params,
  });

  return handleAxiosResponse<GetHealthcareAssetResponse>(response);
}

export async function getAssetInventoryDetail(
  assetId: number
): Promise<GetHealthcareAssetDetailResponse> {
  const response = await axios.get(`/healthcare-asset/${assetId}`, {
    cleanParams: true,
  });

  return response?.data;
}

export async function updateHealthcareAsset(
  healthcareId: number,
  body: UpdateHealthcareAssetInput
) {
  const data = { ...body };
  const response = await axios.put(`/healthcare-asset/${healthcareId}`, data);

  return response?.data;
}
