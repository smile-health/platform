import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'

import { getOrderInteroperabilityLogs } from '../order-detail.service'

export const useOrderDetailHistory = () => {
  const params = useParams()
  const orderId = params.id as string

  const { data, isLoading } = useQuery({
    queryKey: ['order', orderId, 'interoperability-logs'],
    queryFn: () => getOrderInteroperabilityLogs(orderId),
    enabled: Boolean(orderId),
  })

  return {
    data,
    isLoading,
  }
}
