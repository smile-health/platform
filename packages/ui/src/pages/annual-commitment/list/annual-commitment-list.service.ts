import { SERVICE_API } from '#constants/api'
import axios from '#lib/axios'
import { TCommonResponseList } from '#types/common'
import { handleAxiosResponse } from '#utils/api'
import { parseDownload } from '#utils/download'

export type GetListAnnualCommitmentParams = TCommonResponseList & {
  contract_number_id?: string
  material_id?: string
  province_id?: string
  sort_by?: string
  sort_type?: string
  supplier_id?: string
  year?: string
}
export type GetListAnnualCommitmentResponse = TCommonResponseList & {
  data: TAnnualCommitmentData[]
}

export type TAnnualCommitmentData = {
  id: number
  year: number
  contract_start_date: string
  contract_end_date: string
  information: any
  updated_at: string
  contract: TContract
  vendor: TVendor
  user_updated_by: TUserUpdatedBy
  items: TItem[]
}

export type TContract = {
  id: number
  number: string
}

export type TVendor = {
  id: number
  name: string
}

export type TUserUpdatedBy = {
  id: number
  fullname: string
}

export type TItem = {
  id: number
  vial_quantity: number
  dose_quantity: number
  delivery_type: TDeliveryType
  material: TMaterial
  province?: TProvince
}

export type TDeliveryType = {
  id: number
  name: string
}

export type TMaterial = {
  id: number
  parent_id: any
  name?: string
}

export type TProvince = {
  id: number
  name: string
}

const SERVICE = SERVICE_API

export const listAnnualCommitments = async (
  params: GetListAnnualCommitmentParams
) => {
  const apiUrl = `${SERVICE.MAIN}/annual-commitments`
  const fetchAnnualCommitment = await axios.get(apiUrl, {
    params,
    cleanParams: true,
  })

  const result = handleAxiosResponse<GetListAnnualCommitmentResponse>(
    fetchAnnualCommitment
  )

  return result
}

export async function exportListAnnualCommitments(
  params: GetListAnnualCommitmentParams
) {
  const response = await axios.get(`${SERVICE.MAIN}/annual-commitments/xls`, {
    responseType: 'blob',
    cleanParams: true,
    params,
  })

  parseDownload(response?.data, response?.headers?.filename)

  return response?.data
}

export async function downloadTemplateAnnualCommitments() {
  const response = await axios.get(
    `${SERVICE.MAIN}/annual-commitments/xls-template`,
    {
      responseType: 'blob',
    }
  )

  parseDownload(response?.data, response?.headers?.filename)

  return response?.data
}

export async function importAnnualCommitments(input: FormData) {
  const response = await axios.post(
    `${SERVICE.MAIN}/annual-commitments/xls`,
    input
  )
  return response?.data
}
