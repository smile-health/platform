import { useMutation } from '@tanstack/react-query'
import { OptionType } from '#components/react-select'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import { removeEmptyObject } from '#utils/object'
import { getReactSelectValue } from '#utils/react-select'

import {
  GetExcursionParams,
  WhoPqsStatus,
} from '../dashboard-temperature-monitoring.types'
import { temperatureMonitoringDashboardService } from '../services/dashboard-temperature-monitoring.service'

type ExcursionFilterState = {
  excursion_durations: OptionType[]
  temp_min_max: OptionType | null
  is_pqs: WhoPqsStatus | null
  date?: {
    start: string
    end: string
  }
}

type Props = {
  params: GetExcursionParams
  excursionFilter: ExcursionFilterState
}

export default function useExportTemperatureReadingsXls({
  params,
  excursionFilter,
}: Props) {
  const apiParams = removeEmptyObject({
    from: params?.date?.start?.toString(),
    to: params?.date?.end?.toString(),
    province_id: params?.province?.value,
    regency_id: params?.regency?.value,
    entity_id: params?.entity?.value,
    entity_tag_ids: params?.entity_tag?.map((d) => d.value).join(','),
    model_ids: getReactSelectValue(params?.asset_model),
    excursion_durations: excursionFilter.excursion_durations
      ?.map((d) => d.value)
      .join(','),
    temp_min_max: excursionFilter.temp_min_max?.value,
    is_pqs: excursionFilter.is_pqs ?? undefined,
  })

  const { mutate, isPending } = useMutation({
    mutationKey: ['temperature-readings-export-xls', apiParams],
    mutationFn: () =>
      temperatureMonitoringDashboardService.exportXls(apiParams),
  })

  useSetLoadingPopupStore(isPending)

  return {
    exportXls: mutate,
    isExporting: isPending,
  }
}
