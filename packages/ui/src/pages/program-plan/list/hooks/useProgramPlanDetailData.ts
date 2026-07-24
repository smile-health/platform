import { useQuery } from '@tanstack/react-query'
import useSmileRouter from '#hooks/useSmileRouter'
import { useTranslation } from 'react-i18next'

import { detailProgramPlan } from '../../services/program-plan.services'

export const useProgramPlanDetailData = (isGlobal?: boolean) => {
  const router = useSmileRouter()
  const {
    i18n: { language },
  } = useTranslation(['common', 'programPlan'])

  const { id } = router.query as { id: string }

  const {
    data: detailProgramPlanData,
    isLoading: isLoadingDetailProgramPlan,
    isFetching: isFetchingDetailProgramPlan,
  } = useQuery({
    queryKey: ['detail-program-plan', language, id],
    queryFn: () => detailProgramPlan(Number(id)),
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    enabled: router.isReady && !!id && !isGlobal,
  })

  return {
    detailProgramPlanData,
    isLoadingDetailProgramPlan,
    isFetchingDetailProgramPlan,
  }
}
