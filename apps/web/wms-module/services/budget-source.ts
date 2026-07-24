import {
  CreateBudgetSourceInput,
  GetBudgetSourceDetailResponse,
  GetBudgetSourceResponse,
  UpdateBudgetSourceInput,
} from '@/types/budget-source';
import { TCommonFilter } from '@/types/common';
import { handleAxiosResponse } from '@/utils/api';
import axios from 'src/lib/axios';

export type GetBudgetSourceParams = TCommonFilter & {
  search?: string;
};

export async function getBudgetSource(
  params: GetBudgetSourceParams
): Promise<GetBudgetSourceResponse> {
  const response = await axios.get('/budget-source', {
    params,
  });

  return handleAxiosResponse<GetBudgetSourceResponse>(response);
}

export async function getBudgetSourceDetail(
  id: number
): Promise<GetBudgetSourceDetailResponse> {
  const response = await axios.get(`/budget-source/${id}`, {
    cleanParams: true,
  });

  return response?.data;
}

export async function createBudgetSource(data: CreateBudgetSourceInput) {
  const response = await axios.post('/budget-source', data);

  return response?.data;
}

export async function updateBudgetSource(
  id: number,
  body: UpdateBudgetSourceInput
) {
  const data = { ...body };
  const response = await axios.put(`/budget-source/${id}`, data);

  return response?.data;
}
