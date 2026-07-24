import { TCommonFilter } from '@/types/common';
import { GetLogbookResponse } from '@/types/logbook';
import { handleAxiosResponse } from '@/utils/api';
import axios from 'src/lib/axios';

export type GetLogbookParams = TCommonFilter & {
  keyword?: string;
};

export async function getLogbook(
  params: GetLogbookParams
): Promise<GetLogbookResponse> {
  const response = await axios.get('/waste/logbook', {
    params,
  });

  return handleAxiosResponse<GetLogbookResponse>(response);
}
