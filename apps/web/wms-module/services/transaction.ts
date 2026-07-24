import { TCommonFilter } from '@/types/common';
import {
  GetTransactionDetailResponse,
  GetWasteTransactionResponse,
} from '@/types/transaction';
import { handleAxiosResponse } from '@/utils/api';
import axios from 'src/lib/axios';

export type GetTransactionParams = TCommonFilter & {
  keyword?: string;
};

export async function getTransaction(
  params: GetTransactionParams
): Promise<GetWasteTransactionResponse> {
  const response = await axios.get('/waste/transactions', {
    params,
  });

  return handleAxiosResponse<GetWasteTransactionResponse>(response);
}

export type GetTransactionDetailParams = {
  wasteBagid?: number;
  wasteBagQrCode?: string;
  wasteGroupNumber?: string;
};
export async function getTransactionDetail(
  params: GetTransactionDetailParams
): Promise<GetTransactionDetailResponse> {
  const response = await axios.get(`/waste/transaction-history`, {
    cleanParams: true,
    params,
  });

  return response?.data;
}
