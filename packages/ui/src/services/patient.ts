import axios from '#lib/axios'
import { ListPatientBulkParams, ListPatientBulkResponse } from '#types/patient'
import { handleAxiosResponse } from '#utils/api'
import { parseDownload } from '#utils/download'

export async function listPatientBulk(
  params: ListPatientBulkParams
): Promise<ListPatientBulkResponse> {
  const response = await axios.get('/core/patients/import-log', {
    params,
    cleanParams: true,
  })

  return handleAxiosResponse<ListPatientBulkResponse>(response)
}

export async function importPatientBulk(data: FormData) {
  const response = await axios.post('/core/patients/xls', data)

  return response?.data
}

export async function templatePatientBulk() {
  const response = await axios.get('/core/patients/xls-template', {
    responseType: 'blob',
    cleanParams: true,
  })
  parseDownload(
    response?.data,
    response?.headers?.filename ?? 'Patient-template.xlsx'
  )

  return response?.data
}
