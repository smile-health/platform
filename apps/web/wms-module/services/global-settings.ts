import { TCommonFilter } from '@/types/common';
import {
  CreateGlobalEntitySettingsInput,
  GetGlobalEntitySettingsResponse,
  UpdateGlobalEntitySettingsInput,
} from '@/types/global-settings';
import { handleAxiosResponse } from '@/utils/api';
import axios from 'src/lib/axios';

export type GetGlobalEntitySettings = TCommonFilter & {
  search: string;
};

export async function getGlobalEntitySettings(
  params: GetGlobalEntitySettings
): Promise<GetGlobalEntitySettingsResponse> {
  const response = await axios.get('/global-settings', {
    params,
  });

  return handleAxiosResponse<GetGlobalEntitySettingsResponse>(response);
}

export async function createGlobalEntitySettings(
  data: CreateGlobalEntitySettingsInput
) {
  const response = await axios.post('/global-settings', data);

  return response?.data;
}

export async function updateGlobalEntitySettings(
  id: number,
  body: UpdateGlobalEntitySettingsInput
) {
  const data = { ...body };
  const response = await axios.put(`/global-settings/${id}`, data);

  return response?.data;
}
