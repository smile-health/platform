import axios from '#lib/axios'
import { TCommonResponseList } from '#types/common'
import { parseDownload } from '#utils/download'
import { numberFormatter } from '#utils/formatter'
import { TFunction } from 'i18next'

import { getAssetTypeTemperatureTresholds } from '../asset-type/asset-type.service'
import { CreatePQSPayload, PQSDetail, PQSType } from './pqs.types'

export type GetPQSParams = {
  keyword?: string
  page: number
  paginate?: number
  sort_by?:
    | 'code'
    | 'net_capacity_plus_5_c'
    | 'net_capacity_minus_20_c'
    | 'net_capacity_minus_86_c'
    | 'updated_at'
  sort_type?: 'asc' | 'desc'
}

export type ExportPQSParams = {
  keyword: string
}

export type GetPQSTypeResponse = TCommonResponseList & {
  data: PQSType[]
  statusCode: number
}

export type GetCCEIGATDescriptionsResponse = TCommonResponseList & {
  data: PQSType[]
  statusCode: number
}

export type GetPQSResponse = TCommonResponseList & {
  data: PQSDetail[]
  statusCode?: number
}

type Params = {
  page: string | number
  paginate: string | number
  keyword?: string
  sort_by?: 'code' | 'updated_at'
  sort_type?: 'asc' | 'desc'
}

export async function getPQSType(params: Params): Promise<GetPQSTypeResponse> {
  const response = await axios.get('/core/type-pqs', {
    params,
    cleanParams: true,
  })
  return response?.data
}

export async function getCCEIGATDescriptions(
  params: Params
): Promise<GetCCEIGATDescriptionsResponse> {
  const response = await axios.get('/core/ccigat', {
    params,
    cleanParams: true,
  })
  return response?.data
}

export async function getPQSdetail(id: string | number): Promise<PQSDetail> {
  const response = await axios.get(`/core/who-pqs/${id}`)
  return response?.data
}

export async function getPQSList(
  params: GetPQSParams
): Promise<GetPQSResponse> {
  const response = await axios.get('/core/who-pqs', {
    params,
    cleanParams: true,
  })
  return response?.data
}

export async function exportPQS(params: ExportPQSParams) {
  const response = await axios.get('/core/who-pqs/xls', {
    responseType: 'blob',
    params,
  })

  parseDownload(response?.data, response?.headers?.filename)

  return response?.data
}

export async function downloadTempalatePQS() {
  const response = await axios.get('/core/who-pqs/xls-template', {
    responseType: 'blob',
  })
  parseDownload(response?.data, 'master_material_volume.xlsx')

  return response?.data
}

export async function importPQS(data: FormData) {
  const response = await axios.post('/core/who-pqs/xls', data)

  return response?.data
}

export async function createPQS(data: CreatePQSPayload) {
  const response = await axios.post('/core/who-pqs', data)

  return response?.data
}

export async function updatePQS(id: string | number, data: CreatePQSPayload) {
  const response = await axios.put(`/core/who-pqs/${id}`, data)

  return response?.data
}

export async function deletePQS(id: string | number) {
  const response = await axios.delete(`/core/who-pqs/${id}`)

  return response?.data
}

export async function loadPQSCode(
  keyword: string,
  _: unknown,
  additional: {
    page: number
    t?: TFunction<'modelAsset', 'common'>
    locale?: string
    temperatureThresholds?: number[]
  }
) {
  let params: GetPQSParams = {
    page: additional.page,
    paginate: 10,
    keyword,
  }

  const result = await getPQSList(params)

  if (result?.statusCode === 204) {
    return {
      options: [],
      hasMore: false,
      additional: {
        page: Number(additional.page) + 1,
      },
    }
  }

  const formatCapacity = (capacity: number) =>
    `${numberFormatter(capacity, additional?.locale ?? '')} ${additional?.t?.('common:litre') ?? ''}`

  const thresholdMap = additional?.temperatureThresholds || []

  const options = result?.data?.map((item) => {
    const capacitiesRaw = (item?.capacities || []).flatMap((capacity) => {
      const parts: string[] = []

      if (capacity?.capacities5) {
        parts.push(`[+5°C : ${formatCapacity(capacity.capacities5)}]`)
      }
      if (capacity?.capacitiesMin20) {
        parts.push(`[-20°C : ${formatCapacity(capacity.capacitiesMin20)}]`)
      }
      if (capacity?.capacitiesMin86) {
        parts.push(`[-86°C : ${formatCapacity(capacity.capacitiesMin86)}]`)
      }
      return parts
    })

    const capacities = capacitiesRaw.filter(Boolean)
    const label =
      capacities.length > 0
        ? `${item?.pqs_code} (${capacities.join(', ')})`
        : `${item?.pqs_code}`

    const fieldByThreshold: Record<
      number,
      'capacities5' | 'capacitiesMin20' | 'capacitiesMin86'
    > = {
      [thresholdMap[0] ?? 0]: 'capacities5',
      [thresholdMap[1] ?? 0]: 'capacitiesMin20',
      [thresholdMap[2] ?? 0]: 'capacitiesMin86',
    }

    const byThreshold = new Map<number, any>(
      (item?.capacities ?? [])
        .filter((c) => c && typeof c.id_temperature_threshold !== 'undefined')
        .map((c) => [Number(c.id_temperature_threshold), c])
    )

    return {
      label,
      value: item?.id,
      data: {
        ...item,
        capacities: thresholdMap.map((threshold) => {
          const found = byThreshold.get(threshold!)
          if (found) {
            return found
          }
          const key = fieldByThreshold[threshold!]
          return {
            id: null,
            id_temperature_threshold: null,
            [key]: null,
          }
        }),
      },
    }
  })

  return {
    options,
    hasMore: result?.data?.length > 0,
    additional: {
      page: Number(additional.page) + 1,
      locale: additional.locale,
      t: additional.t,
    },
  }
}

export async function loadPQSType(
  keyword: string,
  _: unknown,
  additional: {
    page: number
  }
) {
  let params: Params = {
    page: additional.page,
    paginate: 10,
    keyword,
  }

  const result = await getPQSType(params)

  if (result?.statusCode === 204) {
    return {
      options: [],
      hasMore: false,
      additional: {
        page: additional.page + 1,
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
      page: additional.page + 1,
    },
  }
}

export async function loadCCEIGATDescriptions(
  keyword: string,
  _: unknown,
  additional: {
    page: number
  }
) {
  let params: Params = {
    page: additional.page,
    paginate: 10,
    keyword,
  }

  const result = await getCCEIGATDescriptions(params)

  if (result?.statusCode === 204) {
    return {
      options: [],
      hasMore: false,
      additional: {
        page: additional.page + 1,
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
      page: additional.page + 1,
    },
  }
}
