import { useQuery } from '@tanstack/react-query'
import { OptionType } from '#components/react-select'
import { removeEmptyObject } from '#utils/object'
import { getReactSelectValue } from '#utils/react-select'
import { Values } from 'nuqs'

import { WhoPqsStatus } from '../dashboard-temperature-monitoring.types'
import { temperatureMonitoringDashboardService } from '../services'

type ExcursionFilterState = {
  excursion_durations: OptionType[]
  temp_min_max: OptionType | null
  is_pqs: WhoPqsStatus | null
}

export default function useGetExcursionData(
  filter: Values<Record<string, any>>,
  excursionFilter: ExcursionFilterState
) {
  const baseParams = removeEmptyObject({
    from: filter?.date?.start?.toString(),
    to: filter?.date?.end?.toString(),
    province_id: getReactSelectValue(filter?.province),
    regency_id: getReactSelectValue(filter?.regency),
    entity_id: getReactSelectValue(filter?.entity),
    entity_tag_ids: getReactSelectValue(filter?.entity_tag),
    model_ids: getReactSelectValue(filter?.asset_model),
  })

  const params = removeEmptyObject({
    ...baseParams,
    excursion_durations: excursionFilter.excursion_durations
      ?.map((d) => d.value)
      .join(','),
    temp_min_max: excursionFilter.temp_min_max?.value,
    is_pqs: excursionFilter.is_pqs ?? undefined,
  })

  const enabled = Object.values(baseParams)?.length > 0

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['excursion-data', params],
    queryFn: () => temperatureMonitoringDashboardService.getExcursion(params),
    enabled,
  })

  return {
    data,
    isLoading: isLoading || isFetching,
  }
}
