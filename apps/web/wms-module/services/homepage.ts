import { TCommonFilter } from '@/types/common';
import {
  GetDetailTransactionWasteResponse,
  GetHistoryTransactionWasteResponse,
  GetSummaryWasteHierarchyResponse,
  GetWasteCharacteristicSummaryResponse,
  GetWasteGroupHFResponse,
  GetWasteGroupTPResponse,
} from '@/types/homepage';
import { handleAxiosResponse } from '@/utils/api';
import axios from 'src/lib/axios';

export type GetSummaryWasteHierarchy = TCommonFilter & {
  provinceId?: number;
  cityId?: number;
  startDate?: string;
  endDate?: string;
};

export async function getSummaryWasteHierarchy(
  params: GetSummaryWasteHierarchy
): Promise<GetSummaryWasteHierarchyResponse> {
  const { provinceId, cityId, ...restParams } = params;
  let url = '/dashboard/waste-hierarchy-summary';

  if (cityId) {
    url = `/dashboard/cities/${cityId}/waste-hierarchy-summary`;
  } else if (provinceId) {
    url = `/dashboard/provinces/${provinceId}/waste-hierarchy-summary`;
  }

  const response = await axios.get(url, {
    params: restParams,
  });

  return handleAxiosResponse<GetSummaryWasteHierarchyResponse>(response);
}

export async function getWasteGroupHF(
  params: TCommonFilter
): Promise<GetWasteGroupHFResponse> {
  const response = await axios.get(
    '/dashboard/waste-groups/admin-healthcare-facilities',
    {
      params,
    }
  );

  return handleAxiosResponse<GetWasteGroupHFResponse>(response);
}

export async function getWasteGroupTreatmentTP(
  params: TCommonFilter
): Promise<GetWasteGroupTPResponse> {
  const response = await axios.get('/dashboard/waste-groups/treatment', {
    params,
  });

  return handleAxiosResponse<GetWasteGroupTPResponse>(response);
}

export async function getWasteGroupTransporterTP(
  params: TCommonFilter
): Promise<GetWasteGroupTPResponse> {
  const response = await axios.get('/dashboard/waste-groups/transporter', {
    params,
  });

  return handleAxiosResponse<GetWasteGroupTPResponse>(response);
}

export type GetDetailWasteTransaction = TCommonFilter & {
  wasteTypeId: number;
  healthcareFacilityId: number;
  startDate?: string;
  endDate?: string;
};

export async function getDetailWasteTransaction(
  params: GetDetailWasteTransaction
): Promise<GetDetailTransactionWasteResponse> {
  const response = await axios.get(
    '/dashboard/waste-groups/admin-healthcare-facilities',
    {
      params,
    }
  );

  return handleAxiosResponse<GetDetailTransactionWasteResponse>(response);
}

export type GetHistoryTransactionWasteParams = TCommonFilter & {
  treatmentType?: string;
};

export async function getHistoryTransactionWaste(
  id: number,
  params: GetHistoryTransactionWasteParams
): Promise<GetHistoryTransactionWasteResponse> {
  const response = await axios.get(`/dashboard/waste-groups-details/${id}`, {
    params,
  });

  return handleAxiosResponse<GetHistoryTransactionWasteResponse>(response);
}

export type GetWasteCharacteristicSummaryParams = {
  wasteTypeId: number;
  startDate: string;
  endDate: string;
  provinceId?: number;
  cityId?: number;
  healthcareFacilityId?: number;
};

export async function getWasteCharacteristicSummary(
  params: GetWasteCharacteristicSummaryParams
): Promise<GetWasteCharacteristicSummaryResponse> {
  const response = await axios.get(`/dashboard/waste-characteristics-summary`, {
    params,
  });

  return handleAxiosResponse<GetWasteCharacteristicSummaryResponse>(response);
}
