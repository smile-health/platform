import { useQuery } from '@tanstack/react-query'

import { getMinistryProcurement } from '../services/ministry-detail.service'
import type { MinistryProcurementParams } from '../services/ministry-detail.service'

export const useMinistryProcurement = (params: MinistryProcurementParams) =>
  useQuery({
    queryKey: ['bmhp-approval-ministry-detail', params],
    queryFn: () => getMinistryProcurement(params),
    enabled: !!params.entity_id,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  })
