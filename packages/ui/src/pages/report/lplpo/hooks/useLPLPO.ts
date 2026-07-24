import { useQuery } from '@tanstack/react-query'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'

import { getLPLPOReport } from '../lplpo.service'
import { LPLPOParams } from '../lplpo.type'

type Params = {
  params: LPLPOParams
  enabled: boolean
}
const useLPLPO = ({ params, enabled }: Params) => {
  const {
    data: dataSource,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: [`lplpo-report`, params],
    queryFn: () => getLPLPOReport(params),
    enabled:
      enabled &&
      !!params?.entity_id &&
      !!params?.start_date &&
      !!params?.end_date,
  })

  useSetLoadingPopupStore(isLoading || isFetching)
  return {
    dataSource,
    isLoading: isLoading || isFetching,
  }
}

export default useLPLPO
