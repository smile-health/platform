import { TCommonFilter } from '@/types/common';
import {
  CreateEntityLocationInput,
  GetEntityLocationResponse,
  GetEntityStorageLocationResponse,
  GetTreatmentLocationResponse,
  UpdateEntityLocationInput,
} from '@/types/entity-location';
import { handleAxiosResponse } from '@/utils/api';
import axios from 'src/lib/axios';

export async function getEntityLocation(): Promise<GetEntityStorageLocationResponse> {
  const response = await axios.get('/entity-location');

  return handleAxiosResponse<GetEntityStorageLocationResponse>(response);
}

export async function createEntityLocation(data: CreateEntityLocationInput) {
  const response = await axios.post('/entity-location', data);

  return response?.data;
}

export async function updateEntityLocation(
  id: number,
  body: UpdateEntityLocationInput
) {
  const data = { ...body };
  const response = await axios.put(`/entity-location/${id}`, data);

  return response?.data;
}

export type GetEntityLocationParams = TCommonFilter & {
  search?: string;
};

export async function getTreatmentLocation(
  params: GetEntityLocationParams
): Promise<GetTreatmentLocationResponse> {
  const response = await axios.get('/entity-location', { params });

  return handleAxiosResponse<GetTreatmentLocationResponse>(response);
}

export async function getEntityLocationDetail(
  id: string | number
): Promise<GetEntityLocationResponse> {
  const response = await axios.get(`entity-location/${id}`, {
    cleanParams: true,
  });

  return response.data;
}

export async function deleteEntityLocation(id: number) {
  const response = await axios.delete(`entity-location/${id}`, {
    cleanParams: true,
  });

  return response?.data;
}
