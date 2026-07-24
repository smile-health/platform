import axios from '#lib/axios'

import {
  CreateBmhpMaterialBody,
  UpdateBmhpMaterialBody,
} from '../bmhp-material.types'

const baseUrl = 'main/'

export const createBmhpMaterial = async (body: CreateBmhpMaterialBody) => {
  const apiUrl = `${baseUrl}bmhp-planning-materials`
  //   const apiUrl = `${SERVICE.CORE}/coldstorage`
  const response = await axios.post(apiUrl, body, {
    cleanParams: true,
  })

  return response.data
}

export const updateBmhpMaterial = async (body: UpdateBmhpMaterialBody) => {
  const apiUrl = `${baseUrl}bmhp-planning-materials/${body.id}`
  const response = await axios.put(apiUrl, body, {
    cleanParams: true,
  })

  return response.data
}

export interface MasterVariantParams {
  material_level_id: string
  material_ids: string[]
  type: number
}

export const listMasterVariant = async (params: MasterVariantParams) => {
  const apiUrl = `${baseUrl}bmhp-planning-materials/variant-material`

  const queryParams = {
    material_level_id: params.material_level_id,
    material_ids: params.material_ids.join(','),
    type: params.type,
  }

  const response = await axios.get(apiUrl, {
    params: queryParams,
  })

  return response.data
}

export const listMasterMaterial = async (params: {
  keyword: string
  page: number
  paginate: number
  program_plan_id: number
}) => {
  const apiUrl = `${baseUrl}bmhp-planning-materials/material`

  const queryParams = {
    keyword: params.keyword,
    page: params.page,
    paginate: params.paginate,
    program_plan_id: params.program_plan_id,
  }

  const response = await axios.get(apiUrl, {
    params: queryParams,
  })

  return response.data
}
