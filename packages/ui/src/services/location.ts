import axios from '#lib/axios'
import { TCommonResponseList } from '#types/common'
import { handleAxiosResponse } from '#utils/api'

type GetResponse = TCommonResponseList & {
  data: Array<{ id: number; name: string }>
  statusCode: number
}

type Params = {
  page: string | number
  paginate: string | number
  keyword?: string
  parent_id?: string | number
}

export async function getProvince(params: Params): Promise<GetResponse> {
  const response = await axios.get('/core/master/provinces', { params })

  return handleAxiosResponse<GetResponse>(response)
}

export async function getRegency(params: Params): Promise<GetResponse> {
  const response = await axios.get('/core/master/regencies', { params })

  return handleAxiosResponse<GetResponse>(response)
}

export async function getSubdistrict(params: Params): Promise<GetResponse> {
  const response = await axios.get('/core/master/subdistricts', { params })

  return handleAxiosResponse<GetResponse>(response)
}

export async function getVillage(params: Params): Promise<GetResponse> {
  const response = await axios.get('/core/master/villages', { params })

  return handleAxiosResponse<GetResponse>(response)
}

export async function loadProvinces(
  keyword: string,
  _: unknown,
  additional: {
    page: number
  }
) {
  const result = await getProvince({
    paginate: 10,
    ...(keyword && { keyword }),
    ...additional,
  })

  if (result?.statusCode === 204) {
    return {
      options: [],
      hasMore: false,
      additional: {
        page: additional?.page,
      },
    }
  }

  const options = result?.data.map((item) => ({
    label: item?.name,
    value: item?.id,
  }))

  return {
    options,
    hasMore: result?.data?.length > 0,
    additional: {
      page: additional?.page + 1,
    },
  }
}

export async function loadRegencies(
  keyword: string,
  _: unknown,
  additional: {
    page: number
    parent_id: string | number
  }
) {
  const result = await getRegency({
    paginate: 10,
    ...(keyword && { keyword }),
    ...additional,
  })

  if (result?.statusCode === 204) {
    return {
      options: [],
      hasMore: false,
      additional: {
        page: additional?.page + 1,
        parent_id: additional?.parent_id,
      },
    }
  }

  const options = result?.data.map((item) => ({
    label: item?.name,
    value: item?.id,
  }))

  return {
    options,
    hasMore: result?.data?.length > 0,
    additional: {
      page: additional?.page + 1,
      parent_id: additional?.parent_id,
    },
  }
}

export async function loadSubdistricts(
  keyword: string,
  _: unknown,
  additional: {
    page: number
    parent_id: string | number
  }
) {
  const result = await getSubdistrict({
    paginate: 10,
    ...(keyword && { keyword }),
    ...additional,
  })

  if (result?.statusCode === 204) {
    return {
      options: [],
      hasMore: false,
      additional: {
        page: additional?.page + 1,
        parent_id: additional?.parent_id,
      },
    }
  }

  const options = result?.data.map((item) => ({
    label: item?.name,
    value: item?.id,
  }))

  return {
    options,
    hasMore: result?.data?.length > 0,
    additional: {
      page: additional?.page + 1,
      parent_id: additional?.parent_id,
    },
  }
}

export async function loadVillages(
  keyword: string,
  _: unknown,
  additional: {
    page: number
    parent_id: string | number
  }
) {
  const result = await getVillage({
    paginate: 10,
    ...(keyword && { keyword }),
    ...additional,
  })

  if (result?.statusCode === 204) {
    return {
      options: [],
      hasMore: false,
      additional: {
        page: additional?.page + 1,
        parent_id: additional?.parent_id,
      },
    }
  }

  const options = result?.data.map((item) => ({
    label: item?.name,
    value: item?.id,
  }))

  return {
    options,
    hasMore: result?.data?.length > 0,
    additional: {
      page: additional?.page + 1,
      parent_id: additional?.parent_id,
    },
  }
}
