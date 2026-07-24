import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'

import { getOrderDetail } from '../../../order/OrderDetail/order-detail.service'
import { detailTicketingSystem } from '../ticketing-system-detail.service'

export default function useTicketingSystemDetail(language: string) {
  const params = useParams()

  const {
    data: detail,
    isLoading: detailLoading,
    isFetching: detailFetching,
  } = useQuery({
    queryKey: ['ticketing-system-detail', { id: params?.id, language }],
    queryFn: () => detailTicketingSystem(Number(params?.id)),
    enabled: !!params?.id,
  })

  const orderId =
    detail?.has_order && detail?.order_id ? detail.order_id.toString() : null

  const {
    data: order,
    isLoading: orderLoading,
    isFetching: orderFetching,
  } = useQuery({
    queryKey: ['ticketing-system-order', { id: orderId, language }],
    queryFn: () => getOrderDetail(orderId as string),
    enabled: !!orderId && !detailLoading && !detailFetching,
  })

  const isLoading =
    detailLoading || detailFetching || orderLoading || orderFetching

  useSetLoadingPopupStore(isLoading)

  return {
    isLoading,
    detail,
    order,
  }
}
