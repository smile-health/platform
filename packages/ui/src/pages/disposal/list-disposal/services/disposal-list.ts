import { SERVICE_API } from '#constants/api'
import axios from '#lib/axios'
import { handleAxiosResponse } from '#utils/api'
import { parseDownload } from '#utils/download'
import { Disposal, ListDisposalParams, ListDisposalResponse } from '../types/disposal'

const MAIN_SERVICE = SERVICE_API.MAIN
const baseURL = process.env.API_URL

const defaultResponse: ListDisposalResponse = {
  data: [],
  item_per_page: 0,
  list_pagination: [],
  page: 0,
  total_item: 0,
  total_page: 0,
  // Legacy fields for backward compatibility
  statusCode: 204,
  list: [],
  total: 0,
  perPage: '0',
}

export async function listDisposal(params: ListDisposalParams) {
  const response = await axios.get('/main/disposal/stock', {
    params,
    cleanParams: true,
  })

  return handleAxiosResponse<ListDisposalResponse>(response, defaultResponse)
}

export async function exportDisposal(params?: ListDisposalParams) {
  const response = await axios.get(`${MAIN_SERVICE}/disposal/stock/xls`, {
    responseType: 'blob',
    params,
    cleanParams: true,
  })

  parseDownload(response?.data, response?.headers?.filename)

  return response?.data
}

export async function detailDisposal(params: { entity_id: number; material_id: number; [key: string]: any }): Promise<Disposal | undefined> {
  const response = await axios.get('/main/disposal/stocks/detail', {
    params,
    cleanParams: true,
  });

  // The new API returns { data: Datum[] }.
  const result = response?.data || {};
  const first = Array.isArray(result.data) ? result.data[0] : undefined;

  if (!first) return undefined;
  // Optionally map/transform "first" to Disposal type if type differences exist.

  return first as Disposal;
}
