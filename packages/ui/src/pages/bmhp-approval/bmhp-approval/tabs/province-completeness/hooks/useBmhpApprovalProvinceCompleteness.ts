import { useQuery } from '@tanstack/react-query'

import { CompletenessMonitoringParams } from '../libs/bmhp-approval-province-completeness.type'
import { getCompletenessMonitoring } from '../services/bmhp-approval-province-completeness.service'

type Props = {
  params: CompletenessMonitoringParams
  enabled?: boolean
}

export const useBmhpApprovalProvinceCompleteness = ({
  params,
  enabled = true,
}: Props) => {
  return useQuery({
    queryKey: ['bmhp-approval-province-completeness', params],
    queryFn: () => getCompletenessMonitoring(params),
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    enabled,
  })
}
