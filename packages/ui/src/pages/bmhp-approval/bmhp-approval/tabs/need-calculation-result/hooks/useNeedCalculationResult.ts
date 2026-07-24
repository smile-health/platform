import { useQuery } from '@tanstack/react-query'

import { NeedCalculationResultParams } from '../libs/need-calculation-result.type'
import { getMaterialNeeds } from '../services/need-calculation-result.service'

type Props = {
    params: NeedCalculationResultParams
    enabled?: boolean
}

export const useNeedCalculationResult = ({ params, enabled = true }: Props) => {
    return useQuery({
        queryKey: ['need-calculation-result', params],
        queryFn: () => getMaterialNeeds(params),
        refetchOnMount: true,
        refetchOnWindowFocus: false,
        enabled,
    })
}
