import { useQuery } from '@tanstack/react-query'

import {
  getMinistryRecapitulationDetail,
  MinistryRecapitulationDetailParams,
} from '../../services/bmhp-approval-ministry.service'

export const useMinistryRecapitulationDetail = (
  params: MinistryRecapitulationDetailParams,
  enabled = true
) =>
  useQuery({
    queryKey: ['bmhp-approval-ministry-recapitulation-detail', params],
    queryFn: () => getMinistryRecapitulationDetail(params),
    enabled: enabled && (!!params.entity_id || !!params.province_id),
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  })
