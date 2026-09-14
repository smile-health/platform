import axios from '#lib/axios'
import { TCommonResponseList } from '#types/common'
import { handleAxiosResponse } from '#utils/api'

type GetResponse = TCommonResponseList & {
  data: Array<{ id: number; name: string; level: number; parent_id?: number | null }>
  statusCode: number
}

type Params = {
  page: string | number
  paginate: string | number
  keyword?: string
  parent_id?: string | number
  level?: string | number
}

// ASSUMPTION: single generic endpoint `/core/master/locations` accepting
// `parent_id`, `level`, `keyword`, `page`, `paginate` query params and
// returning the same paginated shape as the legacy per-level endpoints.
// The backend location migration is happening in parallel — confirm this
// contract once it lands and adjust param names / path if it differs.
export async function getLocations(params: Params): Promise<GetResponse> {
  const response = await axios.get('/core/master/locations', { params })

  return handleAxiosResponse<GetResponse>(response)
}

export type LocationLevel = {
  level: number
  label: string
  placeholder: string
}

// Depth + per-level label/placeholder, already resolved server-side (via
// c.var.t, in the request's language) -- no frontend locale lookup for
// these strings. Array length = hierarchy depth, so a newly-added level
// shows up here without a frontend deploy.
//
// NOTE: doesn't go through handleAxiosResponse -- that helper spreads the
// response body (`{...data, statusCode}`), which turns an array response
// into a plain object with numeric keys. This endpoint always returns 200
// with a plain array (never 204), so there's nothing for that helper to do.
export async function getLocationLevels(): Promise<LocationLevel[]> {
  const response = await axios.get<LocationLevel[]>(
    '/core/master/locations/levels'
  )

  return response.data
}

export async function loadLocations(
  keyword: string,
  _: unknown,
  additional: {
    page: number
    parent_id?: string | number
    level?: string | number
  }
) {
  const result = await getLocations({
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
        parent_id: additional?.parent_id,
        level: additional?.level,
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
      level: additional?.level,
    },
  }
}
