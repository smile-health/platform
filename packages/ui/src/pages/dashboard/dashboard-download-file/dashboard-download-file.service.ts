import axios from '#lib/axios'
import { parseDownload } from '#utils/download'

type GetDownloadListResponse = {
  data: TDownloadList[]
}

type TDownloadList = {
  id: number
  title: string
  list: TDownloadDetail[]
}

type TDownloadDetail = {
  code: number
  name: string
  category_id: number
  created_at: string
}

export async function getDownloadList() {
  const response = await axios.get<GetDownloadListResponse>(
    '/warehouse-report/download/list'
  )

  return response?.data
}

export async function downloadFile(code: number) {
  const response = await axios.get(`/warehouse-report/download/code/${code}`, {
    responseType: 'blob',
  })

  parseDownload(response?.data, response?.headers?.filename)

  return response?.data
}
