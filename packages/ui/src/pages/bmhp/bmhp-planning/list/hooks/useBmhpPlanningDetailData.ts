import { useQuery } from '@tanstack/react-query'
import useSmileRouter from '#hooks/useSmileRouter'
import { useTranslation } from 'react-i18next'

import { detailBmhpPlanningYear } from '../../services/bmhp-planning.services'

export const useBmhpPlanningDetailData = () => {
  const router = useSmileRouter()
  const {
    i18n: { language },
  } = useTranslation(['common', 'bmhpPlanning'])

  const { year_id } = router.query as { year_id: string }

  const {
    data: detailYearData,
    isLoading: isLoadingDetailYear,
    isFetching: isFetchingDetailYear,
    refetch,
  } = useQuery({
    queryKey: ['bmhp-planning-year-detail', language, year_id],
    queryFn: () => detailBmhpPlanningYear(Number(year_id)),
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    enabled: router.isReady && !!year_id,
  })

  return {
    detailYearData,
    isLoadingDetailYear,
    isFetchingDetailYear,
    refetchYearData: refetch,
  }
}
