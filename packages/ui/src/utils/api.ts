import { defaultResponse } from '#constants/response'
import { queryClient } from '#provider/query-client'
import { useDefaultFilterData } from '#store/defaultfilter.store'
import { AxiosResponse } from 'axios'

export type AxiosResponseWithStatusCode<Data> = Data & {
  statusCode: number
}

export function handleAxiosResponse<Data>(
  response: AxiosResponse<Data>,
  otherDefaultResponse?: Data
): AxiosResponseWithStatusCode<Data> {
  const statusCode = response?.status
  const isEmpty = statusCode === 204
  const defaultData = otherDefaultResponse ?? defaultResponse

  return {
    ...(isEmpty ? (defaultData as Data) : response?.data),
    statusCode,
  }
}

export function syncRoutineActivity() {
  return queryClient.getQueryCache().subscribe((event) => {
    if (event.type !== 'updated') return

    const query = event.query

    if (query.queryKey[0] !== 'routine-activity') return

    const routine = query.state.data?.data?.[0]

    useDefaultFilterData.getState().setRoutineActivity(routine ?? null)
  })
}
