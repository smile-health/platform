import {
  GetBastDetailResponse,
  GetBastResponse,
  updateBastApprovalInput,
} from '@/types/bast';
import { TCommonFilter } from '@/types/common';
import { handleAxiosResponse } from '@/utils/api';
import axios from 'src/lib/axios';

export type GetBastParams = TCommonFilter & {
  search?: string;
};

export async function getBast(params: GetBastParams): Promise<GetBastResponse> {
  const response = await axios.get('/bast', {
    params,
  });

  return handleAxiosResponse<GetBastResponse>(response);
}

export async function getBastDetail(
  id: number
): Promise<GetBastDetailResponse> {
  const response = await axios.get(`/bast/${id}`, {
    cleanParams: true,
  });

  return response?.data;
}

export async function approvalBast(data: updateBastApprovalInput) {
  const response = await axios.put('/bast/confirm', data);

  return response?.data;
}
