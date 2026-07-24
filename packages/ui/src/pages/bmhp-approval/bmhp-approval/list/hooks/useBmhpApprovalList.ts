import { useQuery } from '@tanstack/react-query'

import { listBmhpApprovals } from '../../services/bmhp-planning.services'
import { ListBmhpApprovalParams } from '../libs/bmhp-approval-list.type'

type TParams = {
  params: ListBmhpApprovalParams
  enabled?: boolean
}

export const useBmhpApprovalList = ({ params, enabled = true }: TParams) => {
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['bmhp-approval-list', params],
    queryFn: () => listBmhpApprovals(params),
    refetchOnWindowFocus: false,
    enabled,
  })

  return { data, isLoading, isFetching }
}
