import axios from '#lib/axios'

import {
  CreateBmhpVariantBody,
  UpdateBmhpVariantBody,
} from '../bmhp-method.types'

const baseUrl = 'main/'

export const createBmhpVariant = async (body: CreateBmhpVariantBody) => {
  const apiUrl = `${baseUrl}bmhp-planning-materials/variant`
  const response = await axios.post(apiUrl, body, {
    cleanBody: true,
  })

  return response.data
}

export const updateBmhpVariant = async (body: UpdateBmhpVariantBody) => {
  const apiUrl = `${baseUrl}bmhp-planning-materials/variant/${body.id}`
  const response = await axios.put(apiUrl, body, {
    cleanBody: true,
  })

  return response.data
}

export interface MasterVariantParams {
  material_level_id: string
  material_ids: string[]
  type: number
  is_variant: number
}

export const listMasterVariant = async (params: MasterVariantParams) => {
  const apiUrl = `${baseUrl}bmhp-planning-materials/variant-material`

  // Join array with comma
  const queryParams = {
    ...(params.is_variant === 1 && {
      material_level_id: params.material_level_id,
    }),
    material_ids: params.material_ids.join(','),
    type: params.type,
    is_variant: params.is_variant,
  }

  const response = await axios.get(apiUrl, {
    params: queryParams,
  })

  return response.data
}
