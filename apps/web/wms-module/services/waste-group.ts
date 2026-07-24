import { TCommonFilter } from '@/types/common';
import {
  GetWasteGroupDetailResponse,
  GetWasteGroupResponse,
} from '@/types/waste-group';
import { handleAxiosResponse } from '@/utils/api';
import axios from 'src/lib/axios';

export type GetLogbookParams = TCommonFilter & {
  keyword?: string;
};

export async function getWasteGroup(
  id: number,
  params?: GetLogbookParams
): Promise<GetWasteGroupResponse> {
  const response = await axios.get(`/waste/waste-group-details/${id}`, {
    params,
  });

  return handleAxiosResponse<GetWasteGroupResponse>(response);
}

export async function getWasteGroupDetail(
  id: string
): Promise<GetWasteGroupDetailResponse> {
  const response = await axios.get(
    `/waste/waste-bag-internal-treatment-details/${id}`
  );

  return handleAxiosResponse<GetWasteGroupDetailResponse>(response);
}
