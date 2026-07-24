import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'

import { downloadDistributionDisposalMemo } from '../services/distribution-disposal.services'

export const useDistributionDisposalDownlaodMemo = () => {
  const params = useParams()

  const downloadQuery = useQuery({
    queryKey: ['download-distribution-disposal-memo', params.id],
    queryFn: () => downloadDistributionDisposalMemo(Number(params.id)),
    enabled: false,
  })

  useSetLoadingPopupStore(downloadQuery.isLoading || downloadQuery.isFetching)
  return {
    downloadQuery,
  }
}
