import { TCommonFilter } from '@/types/common';
import {
  CreateEntitySettingsInput,
  GetEntitySettingsResponse,
  UpdateEntitySettingsInput,
} from '@/types/entity-settings';
import { handleAxiosResponse } from '@/utils/api';
import axios from 'src/lib/axios';

export type GetEntitySettings = TCommonFilter & {
  search: string;
};

export async function getEntitySettings(
  params: GetEntitySettings
): Promise<GetEntitySettingsResponse> {
  const response = await axios.get('/entity-settings', {
    params,
  });

  return handleAxiosResponse<GetEntitySettingsResponse>(response);
}

export async function createEntitySettings(data: CreateEntitySettingsInput) {
  const response = await axios.post('/entity-settings', data);

  return response?.data;
}

export async function updateEntitySettings(
  id: number,
  body: UpdateEntitySettingsInput
) {
  const data = { ...body };
  const response = await axios.put(`/entity-settings/${id}`, data);

  return response?.data;
}
