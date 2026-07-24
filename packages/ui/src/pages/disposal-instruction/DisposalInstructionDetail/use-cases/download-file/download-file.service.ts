import axios from '#lib/axios'
import { parseDownload } from '#utils/download'

export async function downloadHandoverReportLetter(id: string | number) {
  const response = await axios.get(
    `/main/disposal/instructions/${id}/download`,
    {
      responseType: 'blob',
    }
  )

  parseDownload(response?.data, response?.headers?.filename)

  return response?.data
}
