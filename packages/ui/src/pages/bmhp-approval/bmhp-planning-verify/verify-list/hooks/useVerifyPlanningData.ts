import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { VerifyPlanningParams } from '../libs/verify-planning.type'
import { getVerifyPlanningData } from '../services/verify-planning.service'

interface UseVerifyPlanningDataProps {
  params: VerifyPlanningParams
  enabled?: boolean
}

/**
 * Hook to fetch verify planning data
 *
 * @param params - Query parameters for fetching data
 * @param enabled - Whether the query should be enabled (default: true)
 */
export const useVerifyPlanningData = ({
  params,
  enabled = true,
}: UseVerifyPlanningDataProps) => {
  const {
    i18n: { language },
  } = useTranslation()

  const { data, isLoading, isFetching, refetch, error } = useQuery({
    queryKey: ['verify-bmhp-planning', language, params],
    queryFn: () => getVerifyPlanningData(params),
    enabled: enabled && !!params.program_plan_id && !!params.regency_id,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  return {
    data,
    isLoading,
    isFetching,
    refetch,
    error,
  }
}
