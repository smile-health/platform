import { SERVICE_API } from '#constants/api'
import { KfaLevelEnum } from '#constants/material'
import axios from '#lib/axios'
import { handleAxiosResponse } from '#utils/api'
import { parseDownload } from '#utils/download'
import { removeEmptyObject } from '#utils/object'

import {
  ActivityMaterial,
  DetailProtocolResponse,
  ExportProtocolsParams,
  GetActivitesParams,
  GetMaterialsParams,
  GetProgramActivitiesResponse,
  GetProgramMaterialsResponse,
  ListActivityMaterial,
  ListActivityMaterialParams,
  ListProtocolParams,
  ListProtocolResponse,
  TRelationForm,
} from './protocol.type'

const MAIN_SERVICE = SERVICE_API.MAIN
export async function listProtocol(
  rawParams: ListProtocolParams
): Promise<ListProtocolResponse> {
  const params = removeEmptyObject(rawParams)
  const response = await axios.get(`${MAIN_SERVICE}/protocols`, {
    params,
    cleanParams: true,
  })
  return handleAxiosResponse<ListProtocolResponse>(response)
}

export async function exportProtocol(rawParams: ExportProtocolsParams) {
  const params = removeEmptyObject(rawParams)
  const response = await axios.get(`${MAIN_SERVICE}/protocols/xls`, {
    responseType: 'blob',
    params: {
      keyword: params?.keyword,
    },
    cleanParams: true,
  })

  parseDownload(response?.data, response?.headers?.filename)

  return response?.data
}

export async function downloadTemplateProtocol() {
  const response = await axios.get(`${MAIN_SERVICE}/protocols/xls-template`, {
    responseType: 'blob',
  })
  parseDownload(response?.data, 'master_protocols.xlsx')

  return response?.data
}

export async function importProtocol(data: FormData) {
  const response = await axios.post(`${MAIN_SERVICE}/protocols/xls`, data)

  return response?.data
}

export async function getProtocol(
  id: string | number
): Promise<DetailProtocolResponse> {
  const response = await axios.get(`${MAIN_SERVICE}/protocols/${id}`, {
    redirect: true,
  })
  return response?.data
}

export async function listActivityMaterial(
  protocolId: string,
  rawParams: ListActivityMaterialParams
): Promise<ListActivityMaterial> {
  const params = removeEmptyObject(rawParams)
  const response = await axios.get(
    `${MAIN_SERVICE}/protocols/${protocolId}/material-activities`,
    {
      params,
      cleanParams: true,
    }
  )
  return handleAxiosResponse<ListActivityMaterial>(response)
}

export async function getActivities(
  params: GetActivitesParams
): Promise<GetProgramActivitiesResponse> {
  const response = await axios.get('/main/activities', {
    params,
    cleanParams: true,
  })

  return handleAxiosResponse<GetProgramActivitiesResponse>(response)
}

export async function loadActivities(
  keyword: string,
  _: any,
  additional: {
    page: number
    paginate: number
    keyword?: string
  }
) {
  const result = await getActivities(additional)

  if (result?.statusCode === 204) {
    return {
      options: [],
      hasMore: false,
      additional: {
        ...additional,
        page: additional?.page + 1,
      },
    }
  }

  const options = result?.data?.map((item) => ({
    label: item?.name,
    value: item?.id,
  }))
  return {
    options,
    hasMore: result?.data?.length > 0,
    additional: {
      ...additional,
      page: additional.page + 1,
    },
  }
}

export async function getMaterials(
  params: GetMaterialsParams
): Promise<GetProgramMaterialsResponse> {
  const response = await axios.get('/main/materials', {
    params,
    cleanParams: true,
  })

  return handleAxiosResponse<GetProgramMaterialsResponse>(response)
}

export async function loadMaterials(
  keyword: string,
  _: unknown,
  additional: {
    page: number
    paginate: number
    keyword?: string
    activity_id: string
  }
) {
  const params: GetMaterialsParams = {
    ...additional,
    keyword,
    page: additional?.page ?? 1,
    paginate: 10,
    material_level_id: KfaLevelEnum.KFA_93
  }

  const fixedParams = removeEmptyObject(params)

  const result = await getMaterials(fixedParams)

  if (result?.statusCode === 204) {
    return {
      options: [],
      hasMore: false,
      additional: {
        ...fixedParams,
        page: additional?.page ? additional?.page + 1 : 1,
      },
    }
  }

  const options = result?.data?.map((item) => ({
    label: item?.name,
    value: item?.id,
  }))

  return {
    options,
    hasMore: result?.data?.length > 0,
    additional: {
      ...fixedParams,
      page: additional?.page ? additional?.page + 1 : 1,
    },
  }
}

export async function updateStatusProtocol(protocol: DetailProtocolResponse) {
  const response = await axios.put(`/main/protocols/${protocol.id}/status`, {
    status: protocol.status === 0 ? 1 : 0,
  })

  return response?.data
}

export async function addRelationActivityMaterial(
  protocolId: number,
  form: TRelationForm
) {
  const data = {
    protocol_id: protocolId,
    material_activities: form.relations.map((relation) => ({
      activity_id: Number(relation.activity?.value),
      material_id: Number(relation.material?.value),
    })),
  }
  const response = await axios.post('/main/protocols/material-activities', data)

  return response?.data
}

export async function deleteRelationActivityMaterial(
  relation: ActivityMaterial
) {
  const response = await axios.delete(
    `/main/protocols/${relation.protocol_id}/material-activities/${relation.id}`
  )

  return response?.data
}
