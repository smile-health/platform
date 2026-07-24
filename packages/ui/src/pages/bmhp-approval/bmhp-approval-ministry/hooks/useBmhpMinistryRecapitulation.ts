import { useQuery } from '@tanstack/react-query'

import { getBmhpMinistryRecapitulation } from '../services/bmhp-approval-ministry.service'
import { BmhpMinistryRecapitulationParams } from '../libs/bmhp-approval-ministry.type'

type TParams = {
  params: BmhpMinistryRecapitulationParams
  enabled?: boolean
}

export const useBmhpMinistryRecapitulation = ({ params, enabled }: TParams) => {
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['bmhp-ministry-recapitulation', params],
    queryFn: () => getBmhpMinistryRecapitulation(params),
    enabled: enabled ?? true,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  })

  return { data, isLoading, isFetching, refetch }
}
