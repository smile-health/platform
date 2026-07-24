import { useQuery } from '@tanstack/react-query'

import { ProvinceTableParams } from '../libs/bmhp-approval-province-completeness.type'
import { getProvinceTable } from '../services/bmhp-approval-province-completeness.service'

type Props = {
  params: ProvinceTableParams
  enabled?: boolean
}

export const useBmhpApprovalProvinceTable = ({
  params,
  enabled = true,
}: Props) => {
  return useQuery({
    queryKey: ['bmhp-approval-province-table', params],
    queryFn: () => getProvinceTable(params),
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    enabled,
  })
}
