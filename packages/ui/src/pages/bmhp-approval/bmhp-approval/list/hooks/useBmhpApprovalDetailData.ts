import { useQuery } from '@tanstack/react-query'
import useSmileRouter from '#hooks/useSmileRouter'
import { useTranslation } from 'react-i18next'

import { detailBmhpApproval } from '../../services/bmhp-planning.services'

export const useBmhpApprovalDetailData = () => {
  const router = useSmileRouter()
  const {
    i18n: { language },
  } = useTranslation(['common', 'bmhpApproval'])

  const { year_id } = router.query as { year_id: string }

  const {
    data: approvalData,
    isLoading: isLoadingApproval,
    isFetching: isFetchingApproval,
    refetch,
  } = useQuery({
    queryKey: ['bmhp-approval-detail', language, year_id],
    queryFn: () => detailBmhpApproval(Number(year_id)),
    // refetchOnMount: false,
    // refetchOnWindowFocus: true,
    enabled: router.isReady && !!year_id,
  })

  return {
    approvalData,
    isLoadingApproval,
    isFetchingApproval,
    refetchApprovalData: refetch,
  }
}
