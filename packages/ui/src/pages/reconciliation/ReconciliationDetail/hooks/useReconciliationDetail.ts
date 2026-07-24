import { useQuery } from '@tanstack/react-query'

import { getDetail } from '../reconciliation-detail.service'

export default function useReconciliationDetail(id: string) {
  const { data: detail, isLoading } = useQuery({
    queryFn: () => getDetail({ id }),
    queryKey: ['detail-reconciliation', id],
    enabled: !!id,
  })

  return { detail, isLoading }
}
