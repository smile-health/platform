import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/router'
import { getEnvironmentalHealthHistoryDetail } from '../environmental-health-history.service'

export const useEnvironmentalHealthHistoryDetail = () => {
  const router = useRouter()
  const { id } = router.query

  const { data, isLoading } = useQuery({
    queryKey: ['environmental-health-history-detail', id],
    queryFn: () => getEnvironmentalHealthHistoryDetail(id as string),
    enabled: !!id,
    refetchOnWindowFocus: false,
  })

  return {
    data,
    isLoading,
  }
}
