import axios from '#lib/axios'
import { handleAxiosResponse } from '#utils/api'
import { downloadBase64 } from '#utils/download'

const baseUrl = 'main/'

export interface MinistryProcurementItem {
  id: number
  material_id: number
  variant_id: number | null
  name: string
  unit: string
  total_kebutuhan: number
  sisa_stok: number
  usulan_pengadaan: number
  proposal_buffer: number
  hasil_desk: number
}

export interface GetMinistryProcurementResponse {
  page: number
  item_per_page: number
  total_item: number
  total_page: number
  list_pagination: number[]
  data: MinistryProcurementItem[]
}

export interface MinistryProcurementParams {
  entity_id: number | string
  program_plan_id?: number | null
  page?: number
  paginate?: number
}

export const getMinistryProcurement = async (
  params: MinistryProcurementParams
): Promise<GetMinistryProcurementResponse> => {
  const response = await axios.get(
    `${baseUrl}bmhp-approval/ministry-recapitulation`,
    {
      params,
      cleanParams: true,
    }
  )
  return handleAxiosResponse<GetMinistryProcurementResponse>(response)
}

export const getMinistryProcurementXls = async (
  params: MinistryProcurementParams
): Promise<any> => {
  const response = await axios.get(
    `${baseUrl}bmhp-approval/ministry-recapitulation/xls`,
    {
      params,
      cleanParams: true,
      responseType: 'json',
    }
  )

  const { filename, base64, mimeType } = response.data
  downloadBase64(base64, filename, mimeType)

  return response.data
}

/**
 * Download Berita Acara PDF
 * GET /bmhp-approval/procurement-recapitulation/ba-pdf
 */
export const getBeritaAcaraPdf = async (
  params: MinistryProcurementParams
): Promise<any> => {
  const response = await axios.get(
    `${baseUrl}bmhp-approval/procurement-recapitulation/ba-pdf`,
    {
      params,
      cleanParams: true,
      responseType: 'json',
    }
  )

  const { filename, base64, mimeType } = response.data
  downloadBase64(base64, filename, mimeType)

  return response.data
}

export interface UpsertSignaturePayload {
  signature_url: string
  name: string
  position?: string
  program?: string
}

export const upsertBmhpSignature = async (
  data: UpsertSignaturePayload
): Promise<any> => {
  const response = await axios.post(`${baseUrl}bmhp-approval/signature`, data)
  return handleAxiosResponse(response)
}

export interface GetSignatureResponse {
  status: boolean
  message: string
  data: {
    name: string
    position: string
    signature_url: string
    program: string | null
  } | null
}

export const getBmhpSignature = async (): Promise<GetSignatureResponse> => {
  const response = await axios.get(`${baseUrl}bmhp-approval/signature`)
  return handleAxiosResponse<GetSignatureResponse>(response)
}
