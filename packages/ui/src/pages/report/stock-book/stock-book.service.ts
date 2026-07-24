import axios from '#lib/axios'
import { parseDownload } from '#utils/download'

type StockBookParams = {
  activity_id?: string
  province_id: string
  regency_id?: string
  entity_id?: string
  entity_type_id?: number
  month?: string
  year?: string
}

export async function exportStockBook(params: StockBookParams, isAll = false) {
  const response = await axios.get(
    `/warehouse-report/stock-book/${isAll ? 'export-all' : 'export'}`,
    {
      responseType: 'blob',
      params,
    }
  )
  if (!isAll) {
    parseDownload(response?.data, response?.headers?.filename)
  }

  return response?.data
}
