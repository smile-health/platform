import { useQuery } from '@tanstack/react-query'

import { CompletenessMonitoringParams } from '../libs/completeness-monitoring.type'
import { getCompletenessMonitoring } from '../services/completeness-monitoring.service'

type Props = {
  params: CompletenessMonitoringParams
  enabled?: boolean
}

export const useCompletenessMonitoring = ({
  params,
  enabled = true,
}: Props) => {
  return useQuery({
    queryKey: ['completeness-monitoring', params],
    queryFn: () => getCompletenessMonitoring(params),
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    enabled,
  })
}
