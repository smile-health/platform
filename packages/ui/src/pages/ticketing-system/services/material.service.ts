import axios from '#lib/axios'
import { TCommonFilter } from '#types/common'
import { TMaterial } from '#types/material'
import { handleAxiosResponse } from '#utils/api'

import { OptionMaterial } from '../ticketing-system.type'
import { CommonResponse } from './common.service'

type ListMaterialParams = TCommonFilter & {
  keyword?: string
}

type GetProgramMaterialsResponse = CommonResponse & {
  list: TMaterial[]
}

async function getMaterials(params: ListMaterialParams) {
  const response = await axios.get('/platform/fallback/v2/materials', {
    params,
    cleanParams: true,
  })

  return handleAxiosResponse<GetProgramMaterialsResponse>(response)
}

export async function loadMaterial(
  keyword: string,
  _: unknown,
  additional: {
    page: number
    lang: string
    new_label: boolean
  }
) {
  const result = await getMaterials({
    page: additional.page,
    paginate: 10,
    keyword,
  })

  const label = additional.lang === 'id' ? '+ Material Baru' : '+ New Material'

  if (result.statusCode == 204) {
    return {
      options:
        additional.page == 1 && additional.new_label
          ? [
              {
                label: label,
                value: 0,
              },
            ]
          : [],
      hasMore: false,
      additional: {
        ...additional,
        page: additional.page + 1,
        new_label: additional.new_label || false,
      },
    }
  }

  let options: OptionMaterial[] = result.list.map((item) => ({
    label: item.name,
    value: item.id,
    managed_in_batch: item?.managed_in_batch || 0,
  }))

  if (additional.page == 1) {
    if (additional.new_label) {
      options = [
        {
          label: label,
          value: 0,
          managed_in_batch: 1,
        },
        ...options,
      ]
    }
  }

  return {
    options,
    hasMore: result.list.length > 0,
    additional: {
      ...additional,
      page: additional.page + 1,
      new_label: additional.new_label || false,
    },
  }
}
