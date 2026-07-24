import { TCommonFilter } from '@/types/common';

import {
  CreateOperatorThirdpartyInput,
  GetOperatorResponse,
  GetOperatorThirdpartyResponse,
  GetPartnershipOperatorResponse,
  UpdateOperatorThirdpartyInput,
} from '@/types/partnership-operator';
import { handleAxiosResponse } from '@/utils/api';
import axios from 'src/lib/axios';

export type GetPartnershipOperatorParams = TCommonFilter & {
  search?: string;
  providerId?: number;
};

export async function getPartnershipOperator(
  params: GetPartnershipOperatorParams
): Promise<GetPartnershipOperatorResponse> {
  const response = await axios.get('/partnership-operator-map', {
    params,
  });

  return handleAxiosResponse<GetPartnershipOperatorResponse>(response);
}

export async function getOperatorThirdparty(
  params: TCommonFilter
): Promise<GetOperatorThirdpartyResponse> {
  const response = await axios.get(
    '/partnership-operator-map/operator-thirdparty',
    { params }
  );

  return handleAxiosResponse<GetOperatorThirdpartyResponse>(response);
}

export async function createOperatorThirdparty(
  data: CreateOperatorThirdpartyInput
) {
  const response = await axios.post('/partnership-operator-map', data);

  return response?.data;
}

export type UpdateOrDeleteOperatorThirdpartyParams = {
  partnership_id: number;
  operator_id: string;
};

export async function updateOperatorThirdparty(
  params: UpdateOrDeleteOperatorThirdpartyParams,
  body: UpdateOperatorThirdpartyInput
) {
  const data = { ...body };
  const response = await axios.put(`/partnership-operator-map/`, data, {
    params,
  });

  return response?.data;
}

export async function deleteOperatorThirdparty(
  params: UpdateOrDeleteOperatorThirdpartyParams
) {
  const response = await axios.delete(`partnership-operator-map/`, {
    params,
  });

  return response?.data;
}

export async function loadOperator() {
  const response = await axios.get<GetOperatorResponse>(
    `/partnership-operator-map/operator-from-operatormap`
  );

  if (response.data.status === 'false')
    return {
      options: [],
    };

  const options = response.data.data.map((item) => ({
    label: item?.operatorName,
    value: item?.operatorId,
  }));

  return {
    options,
  };
}
