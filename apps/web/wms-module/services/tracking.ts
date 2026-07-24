import { TCommonFilter } from '@/types/common';
import {
  GetWasteTrackingCharacteristicsResponse,
  GetWasteTrackingWasteSourceResponse,
} from '@/types/tracking';
import { handleAxiosResponse } from '@/utils/api';
import axios from 'src/lib/axios';

export type GetTrackingParams = TCommonFilter & {
  keyword?: string;
};

export async function getWasteTrackingCharacteristics(
  params: GetTrackingParams
): Promise<GetWasteTrackingCharacteristicsResponse> {
  const response = await axios.get('/waste/tracking-by-characteristics', {
    params,
  });

  return handleAxiosResponse<GetWasteTrackingCharacteristicsResponse>(response);
}

export async function getWasteTrackingWasteSource(
  params: GetTrackingParams
): Promise<GetWasteTrackingWasteSourceResponse> {
  const response = await axios.get('/waste/tracking-by-waste-source', {
    params,
  });

  return handleAxiosResponse<GetWasteTrackingWasteSourceResponse>(response);
}
