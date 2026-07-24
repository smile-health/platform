import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useLoadingPopupStore } from '#store/loading.store'
import { removeEmptyObject } from '#utils/object'
import { useTranslation } from 'react-i18next'

import { exportTicketingSystemList } from '../../ticketing-system-list.service'
import { TicketingSystemListParams } from '../../ticketing-system-list.type'

type UseTicketingSystemListExport = {
  params: TicketingSystemListParams
}

const useTicketingSystemListExport = ({
  params,
}: UseTicketingSystemListExport) => {
  const { i18n } = useTranslation()
  const { setLoadingPopup } = useLoadingPopupStore()

  const { refetch, isLoading, isFetching } = useQuery({
    queryKey: [i18n.language, 'ticketing-system-export', params],
    queryFn: () =>
      exportTicketingSystemList(
        removeEmptyObject({
          page: params.page,
          paginate: params.paginate,
          do_number: params.do_number,
          order_id: params.order_id,
          from_arrived_date: params.arrived_date?.start,
          to_arrived_date: params.arrived_date?.end,
          entity_tag_id: params.entity_tag?.value,
          province_id: params.province?.value,
          regency_id: params.regency?.value,
          status: params.status?.value,
        })
      ),
    enabled: false,
  })

  useEffect(() => {
    setLoadingPopup(isLoading || isFetching)
  }, [isLoading, isFetching])

  return {
    fetch: refetch,
    isLoading: isLoading || isFetching,
  }
}

export default useTicketingSystemListExport
