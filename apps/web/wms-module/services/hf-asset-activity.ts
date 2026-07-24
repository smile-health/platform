import { TCommonFilter } from '@/types/common';
import {
  GetHFAssetActivityResponse,
  HFAssetActivityPayload,
} from '@/types/hf-asset-activity';

import { handleAxiosResponse } from '@/utils/api';
import axios from 'src/lib/axios';

export type GetHFAssetActivityParams = TCommonFilter & {
  search?: string;
  hfAssetId?: string;
  activityType?: string;
};

export async function getHFAssetActivity(
  params: GetHFAssetActivityParams
): Promise<GetHFAssetActivityResponse> {
  const response = await axios.get('/healthcare-facility-asset-activity', {
    params,
  });

  return handleAxiosResponse<GetHFAssetActivityResponse>(response);
}

export async function createHFAssetActivity(data: HFAssetActivityPayload) {
  const response = await axios.post(
    '/healthcare-facility-asset-activity',
    data
  );

  return response?.data;
}
