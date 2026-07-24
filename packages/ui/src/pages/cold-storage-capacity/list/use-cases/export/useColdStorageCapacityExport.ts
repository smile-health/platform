import { useQuery } from '@tanstack/react-query'
import { getReactSelectValue } from '#utils/react-select'

import {
  exportColdStorageCapacity,
  GetColdStorageCapacityListParams,
} from '../../cold-storage-capacity-list.service'
import useColdStorageCapacityTable from '../displayData/useColdStorageCapacityTable'
import useColdStorageCapacityFilter from '../filter/useColdStorageCapacityFilter'

export const useColdStorageCapacityExport = () => {
  const coldStorageCapacityFilter = useColdStorageCapacityFilter()
  const coldStorageCapacityTable = useColdStorageCapacityTable()

  const params: GetColdStorageCapacityListParams = {
    page: coldStorageCapacityTable.pagination.page,
    paginate: coldStorageCapacityTable.pagination.paginate,
    capacities_status: getReactSelectValue(
      coldStorageCapacityFilter?.query?.capacity_status
    ),
    province_id: getReactSelectValue(
      coldStorageCapacityFilter?.query?.province
    ),
    regency_id: getReactSelectValue(
      coldStorageCapacityFilter?.query?.city_district
    ),
    health_facility_id: getReactSelectValue(
      coldStorageCapacityFilter?.query?.health_facility
    ),
    entity_tag_id: getReactSelectValue(
      coldStorageCapacityFilter?.query?.entity_tag
    ),
  }

  const exportData = useQuery({
    queryKey: ['export-cold-storage-capacity', params],
    queryFn: () => exportColdStorageCapacity(params),
    enabled: false,
  })

  return {
    exportData,
  }
}
