import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { TargetAdjustmentParams } from '../libs/target-adjustment.type'
import { getTargetAdjustmentData } from '../services/target-adjustment.service'

interface UseTargetAdjustmentDataProps {
  params: TargetAdjustmentParams
  enabled?: boolean
}

export const useTargetAdjustmentData = ({
  params,
  enabled = true,
}: UseTargetAdjustmentDataProps) => {
  const {
    i18n: { language },
  } = useTranslation()

  return useQuery({
    queryKey: ['bmhp-target-adjustment', language, params],
    queryFn: () => getTargetAdjustmentData(params),
    enabled: enabled && !!params.program_plan_id,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  })
}
