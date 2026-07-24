import { TCommonFilter } from '@/types/common';
import {
  CreatePartnershipInput,
  GetClassificationPartnershipResponse,
  GetHealthcareThirdpartyResponse,
  GetPartnershipDetailResponse,
  GetPartnershipResponse,
  GetThirdpartyPatnerResponse,
  GetWasteCassificationResponse,
  UpdatePartnershipInput,
} from '@/types/partnership';
import { handleAxiosResponse } from '@/utils/api';
import axios from 'src/lib/axios';

export type GetPartnershipParams = TCommonFilter & {
  keyword?: string;
};

export type GetWasteCassificationParams = {
  isSameCompany: number;
  consumerId: number;
};

export async function getPartnership(
  params: GetPartnershipParams
): Promise<GetPartnershipResponse> {
  const response = await axios.get('/partnership', {
    params,
  });

  return handleAxiosResponse<GetPartnershipResponse>(response);
}

export async function getClassificationPartnership(
  params: GetPartnershipParams
): Promise<GetClassificationPartnershipResponse> {
  const response = await axios.get(
    '/partnership/waste-classification-consumer-thirdparty',
    {
      params,
    }
  );

  return handleAxiosResponse<GetClassificationPartnershipResponse>(response);
}

export async function getPartnershipDetail(
  id: number
): Promise<GetPartnershipDetailResponse> {
  const response = await axios.get(`/partnership/${id}`, {
    cleanParams: true,
  });

  return response?.data;
}

export async function createPartnership(data: CreatePartnershipInput) {
  const response = await axios.post('/partnership', data);

  return response?.data;
}

export async function updatePartnership(
  id: number,
  body: UpdatePartnershipInput
) {
  const data = { ...body };
  const response = await axios.put(`/partnership/${id}`, data);

  return response?.data;
}

export async function deletePartnership(id: number) {
  const response = await axios.delete(`partnership/${id}`, {
    cleanParams: true,
  });

  return response?.data;
}

export async function getHealthcareThirdpartyList(): Promise<GetHealthcareThirdpartyResponse> {
  const response = await axios.get(`/partnership/healthcare-thirdparty`);

  return response?.data;
}

export async function getThirdpartyPatnerList(): Promise<GetThirdpartyPatnerResponse> {
  const response = await axios.get(`/partnership/thirdparty`);

  return response?.data;
}

export async function getWasteCassificationList(
  params: GetWasteCassificationParams
): Promise<GetWasteCassificationResponse> {
  const response = await axios.get('/partnership/waste-classification', {
    params,
  });
  return response?.data;
}

export async function loadWasteCassificationList(
  isSameCompany: number,
  consumerId: number
) {
  const response = await getWasteCassificationList({
    isSameCompany,
    consumerId,
  });

  const options = response.data.map((item) => ({
    label: item.wasteCharacteristicName ?? '',
    value: item.wasteClassificationId,
    data: {
      providerType: item.providerType,
      contractStartDate: item.contractStartDate,
      contractEndDate: item.contractEndDate,
      contractId: item.contractId,
    },
  }));

  return {
    options,
    hasMore: false,
  };
}
