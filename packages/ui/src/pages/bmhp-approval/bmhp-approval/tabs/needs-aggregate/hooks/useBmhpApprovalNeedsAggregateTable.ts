import { useQuery } from '@tanstack/react-query'

import {
  GetNeedsAggregateListResponse,
  NeedsAggregateTableParams,
} from '../libs/needs-aggregate.types'
import { getNeedsAggregateList } from '../services/need-aggregate.service'

// ── Hook ───────────────────────────────────────────────────────────────────────────

export const useBmhpApprovalNeedsAggregateTable = ({
  params,
  enabled = true,
}: {
  params: NeedsAggregateTableParams
  enabled?: boolean
}) => {
  return useQuery<GetNeedsAggregateListResponse>({
    queryKey: ['needs-aggregate-list', params],
    queryFn: () => getNeedsAggregateList(params),
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}
