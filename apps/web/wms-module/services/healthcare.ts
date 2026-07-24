import { TCommonFilter } from '@/types/common';
import {
  GetHealthcareResponse,
  GetHealthcareDetailResponse,
  CreateHealthcareInput,
  UpdateHealthcareInput,
} from '@/types/healthcare';
import { handleAxiosResponse } from '@/utils/api';
import axios from 'src/lib/axios';

export type GetHealthcareParams = TCommonFilter & {
  keyword?: string;
};

export async function getHealthcare(
  params: GetHealthcareParams
): Promise<GetHealthcareResponse> {
  const response = await axios.get('/healthcare-facility-asset', {
    params,
  });

  return handleAxiosResponse<GetHealthcareResponse>(response);
}

export async function getHealthcareHF(
  params: GetHealthcareParams
): Promise<GetHealthcareResponse> {
  const response = await axios.get('/healthcare-facility-asset/entity', {
    params,
  });

  return handleAxiosResponse<GetHealthcareResponse>(response);
}

export async function getHealthcareDetail(
  id: number
): Promise<GetHealthcareDetailResponse> {
  const response = await axios.get(`/healthcare-facility-asset/${id}`, {
    cleanParams: true,
  });

  return response?.data;
}
export async function createHealthcare(data: CreateHealthcareInput) {
  const response = await axios.post('/healthcare-facility-asset', data);

  return response?.data;
}

export async function updateHealthcare(
  id: number,
  body: UpdateHealthcareInput
) {
  const data = { ...body };
  const response = await axios.put(`/healthcare-facility-asset/${id}`, data);

  return response?.data;
}

export async function deleteHealthcare(id: number) {
  const response = await axios.delete(`healthcare-facility-asset/${id}`, {
    cleanParams: true,
  });

  return response?.data;
}
