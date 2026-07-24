import { useQuery } from '@tanstack/react-query'

import { listBmhpApprovalMinistry } from '../services/bmhp-approval-ministry.service'
import { ListBmhpApprovalMinistryParams } from '../libs/bmhp-approval-ministry.type'

type TParams = {
  params: ListBmhpApprovalMinistryParams
  enabled?: boolean
}

export const useBmhpApprovalMinistryList = ({ params, enabled }: TParams) => {
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['bmhp-approval-ministry-list', params],
    queryFn: () => listBmhpApprovalMinistry(params),
    enabled: enabled ?? true,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  })

  return { data, isLoading, isFetching }
}
