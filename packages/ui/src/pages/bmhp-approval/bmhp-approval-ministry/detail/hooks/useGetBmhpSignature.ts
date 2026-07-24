import { useQuery } from '@tanstack/react-query'

import { getBmhpSignature } from '../services/ministry-detail.service'

export const useGetBmhpSignature = () =>
  useQuery({
    queryKey: ['bmhp-approval-signature'],
    queryFn: getBmhpSignature,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  })
