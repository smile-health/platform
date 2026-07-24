import { useQuery } from '@tanstack/react-query'

import { getColdStorageCapacityDetail } from './cold-storage-capacity-detail.service'

export const COLD_STORAGE_CAPACITY_DETAIL_QUERY_KEY =
  'cold-storage-capacity-detail'

export const useGetColdStorageCapacityDetail = (
  id: string,
  params: { program_id?: string }
) => {
  return useQuery({
    queryKey: [COLD_STORAGE_CAPACITY_DETAIL_QUERY_KEY, id],
    queryFn: () => getColdStorageCapacityDetail(id, params),
    enabled: Boolean(id),
  })
}
