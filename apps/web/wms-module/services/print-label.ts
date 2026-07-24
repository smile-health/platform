import { TCommonFilter } from '@/types/common';
import {
  CreatePrintLabelInput,
  GetPrintLabelDetailResponse,
  GetPrintLabelResponse,
  PrintQRCodePayload,
  UpdatePrintLabelInput,
} from '@/types/print-label';
import { handleAxiosResponse } from '@/utils/api';
import axios from 'src/lib/axios';

export type GetPrintLabelParams = TCommonFilter & {
  keyword?: string;
};

export async function getPrintLabel(
  params: GetPrintLabelParams
): Promise<GetPrintLabelResponse> {
  const response = await axios.get('/qr-code-config', {
    params,
  });

  return handleAxiosResponse<GetPrintLabelResponse>(response);
}

export async function getPrintLabelDetail(
  id: number
): Promise<GetPrintLabelDetailResponse> {
  const response = await axios.get(`/qr-code-config/${id}`, {
    cleanParams: true,
  });

  return response?.data;
}

export async function createPrintLabel(data: CreatePrintLabelInput) {
  const response = await axios.post('/qr-code-config', data);

  return response?.data;
}

export async function updatePrintLabel(
  id: number,
  body: UpdatePrintLabelInput
) {
  const data = { ...body };
  const response = await axios.put(`/qr-code-config/${id}`, data);

  return response?.data;
}

export async function deletePrintLabel(id: number) {
  const response = await axios.delete(`qr-code-config/${id}`, {
    cleanParams: true,
  });

  return response?.data;
}

export async function printQRCodeLabel(data: PrintQRCodePayload[]) {
  const response = await axios.post('/waste-bag-qrcode', data);

  return response?.data;
}
