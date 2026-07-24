import { useQuery } from '@tanstack/react-query'
import { listProvinceApprovals } from '../../bmhp-approval/services/bmhp-planning.services'
import { ListBmhpProvinceApprovalParams } from '../../bmhp-approval/list/libs/bmhp-approval-list.type'

export const useBmhpApprovalKakoList = ({
  params,
  enabled = true,
}: {
  params: ListBmhpProvinceApprovalParams
  enabled?: boolean
}) => {
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['bmhp-approval-kako-list', params],
    queryFn: () => listProvinceApprovals(params),
    refetchOnWindowFocus: false,
    refetchOnMount: 'always',
    staleTime: 0,
    gcTime: 0,
    enabled: enabled && !!params.program_plan_id,
  })

  return { data, isLoading, isFetching }
}
