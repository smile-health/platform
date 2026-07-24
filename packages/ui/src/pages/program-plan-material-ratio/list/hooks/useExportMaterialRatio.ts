import { useParams } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { OptionType } from '#components/react-select'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'

import { exportProgramPlanMaterialRatios } from '../../services/program-plan-material-ratio.services'

export default function useExportMaterialRatio() {
  const params = useParams()
  const programPlanId = Number(params.id)

  const { mutate, isPending } = useMutation({
    mutationFn: (data: { material_id?: string }) =>
      exportProgramPlanMaterialRatios(programPlanId, data),
  })

  const generateParams = (filter: Record<string, any>) => {
    return {
      material_id: filter.material
        ?.map((item: OptionType) => item.value)
        .join(','),
    }
  }

  const handleExport = (filter: Record<string, any>) => {
    const filterParams = generateParams(filter)
    mutate(filterParams)
  }

  useSetLoadingPopupStore(isPending)

  return { handleExport }
}
