import { useQuery } from '@tanstack/react-query'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'

import { downloadTemplateProgramPlanMaterialRatios } from '../../services/program-plan-material-ratio.services'

export default function useDownloadMaterialRatio() {
  const { isLoading, refetch: downloadTemplate } = useQuery({
    queryKey: ['material-ratio-template'],
    queryFn: downloadTemplateProgramPlanMaterialRatios,
    enabled: false,
  })

  useSetLoadingPopupStore(isLoading)

  return { downloadTemplate }
}
