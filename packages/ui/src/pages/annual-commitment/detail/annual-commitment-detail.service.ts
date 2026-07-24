import { SERVICE_API } from '#constants/api'
import axios from '#lib/axios'
import { handleAxiosResponse } from '#utils/api'

export type GetAnnualCommitmentResponse = {
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
  vial_quantity: number | null
  dose_quantity: number | null
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
  parent_id?: number
  name?: string
}

export type TProvince = {
  id: number
  name: string
}

const SERVICE = SERVICE_API

export const detailAnnualCommitment = async (id: number) => {
  const apiUrl = `${SERVICE.MAIN}/annual-commitments/${id}`
  const fetchAnnualCommitment = await axios.get(apiUrl)

  const result = handleAxiosResponse<GetAnnualCommitmentResponse>(
    fetchAnnualCommitment
  )

  return result
}
