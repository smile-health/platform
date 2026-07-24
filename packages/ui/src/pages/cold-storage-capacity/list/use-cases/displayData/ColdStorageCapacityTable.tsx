import { useQuery } from '@tanstack/react-query'
import { DataTable } from '#components/data-table'
import {
  Pagination,
  PaginationContainer,
  PaginationInfo,
  PaginationSelectLimit,
} from '#components/pagination'
import { getReactSelectValue } from '#utils/react-select'

import {
  GetColdStorageCapacityListParams,
  listColdStorageCapacity,
} from '../../cold-storage-capacity-list.service'
import useColdStorageCapacityFilter from '../filter/useColdStorageCapacityFilter'
import useColdStorageCapacityTable from './useColdStorageCapacityTable'

export default function ColdStorageCapacityTable() {
  const coldStorageCapacityTable = useColdStorageCapacityTable()
  const coldStorageCapacityFilter = useColdStorageCapacityFilter()

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
    sort_by: coldStorageCapacityTable?.querySorting?.querySorting?.sort_by,
    sort_type: coldStorageCapacityTable?.querySorting?.querySorting?.sort_type,
  }

  const { data, isLoading } = useQuery({
    queryKey: ['cold-storage-capacity-list', params],
    queryFn: () => listColdStorageCapacity(params),
  })

  return (
    <>
      <DataTable
        data={data?.data}
        columns={coldStorageCapacityTable.columns}
        isLoading={isLoading}
        isSticky
        sorting={coldStorageCapacityTable?.sorting?.sorting}
        setSorting={coldStorageCapacityTable?.sorting?.setSorting}
      />
      <PaginationContainer>
        <PaginationSelectLimit
          size={coldStorageCapacityTable.pagination.paginate}
          onChange={(limit) =>
            coldStorageCapacityTable.pagination.update({
              page: 1,
              paginate: limit,
            })
          }
        />
        <PaginationInfo
          size={coldStorageCapacityTable.pagination.paginate}
          currentPage={coldStorageCapacityTable.pagination.page}
          total={data?.total_item}
        />
        <Pagination
          totalPages={data?.total_page ?? 0}
          currentPage={coldStorageCapacityTable.pagination.page}
          onPageChange={(page) =>
            coldStorageCapacityTable.pagination.update({ page })
          }
        />
      </PaginationContainer>
    </>
  )
}
