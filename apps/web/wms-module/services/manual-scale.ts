import { TCommonFilter } from '@/types/common';
import {
  GetManualRequestResponse,
  updateManualScaleApprovalInput,
} from '@/types/manual-scale';
import { handleAxiosResponse } from '@/utils/api';
import axios from 'src/lib/axios';

export async function updateManualScaleApproval(
  params: updateManualScaleApprovalInput
) {
  const response = await axios.patch('/manual-scale/activate', null, {
    params,
  });
  return response?.data;
}

export type GetManualRequestParams = TCommonFilter & {
  keyword?: string;
};

export async function getManualRequest(
  params: GetManualRequestParams
): Promise<GetManualRequestResponse> {
  const response = await axios.get('/manual-scale', {
    params,
  });

  return handleAxiosResponse<GetManualRequestResponse>(response);
}
