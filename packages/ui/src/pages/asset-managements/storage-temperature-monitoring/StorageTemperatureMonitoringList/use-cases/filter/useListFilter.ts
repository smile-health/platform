import { useEffect, useState } from 'react'
import { SortingState } from '@tanstack/react-table'
import { useFilter } from '#components/filter'
import { removeEmptyObject } from '#utils/object'
import { getReactSelectValue } from '#utils/react-select'
import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs'

import { GetStorageTemperatureMonitoringRequest } from '../../storage-temperature-monitoring-list.service'
import useListFilterSchema from './useListFilter.schema'

export const useListFilter = () => {
  const schema = useListFilterSchema()

  const [pagination, setPagination] = useQueryStates(
    {
      page: parseAsInteger.withDefault(1),
      paginate: parseAsInteger.withDefault(10),
    },
    {
      history: 'push',
    }
  )

  const [querySorting, setQuerySorting] = useQueryStates(
    {
      sort_by: parseAsString.withDefault(''),
      sort_type: parseAsString.withDefault(''),
    },
    {
      history: 'push',
    }
  )

  const [sorting, setSorting] = useState<SortingState>(
    querySorting?.sort_by
      ? [
          {
            desc: querySorting?.sort_type === 'desc',
            id: querySorting?.sort_by,
          },
        ]
      : []
  )

  const filter = useFilter(schema)

  const query = filter.query as any
  const filteredAssetTypes = query?.asset_types?.filter(
    (item: any) => item.value !== 'other'
  )
  const params = removeEmptyObject({
    page: pagination.page,
    paginate: pagination.paginate,
    sort_by: querySorting?.sort_by || undefined,
    sort_type: querySorting?.sort_type || undefined,
    keyword: query.keyword,
    asset_type_ids: getReactSelectValue(filteredAssetTypes),
    manufacture_ids: getReactSelectValue(query?.manufactures),
    is_device_related: query?.is_device_related?.value,
    working_status_id: query?.rtmd_status?.value,
    province_id: query?.province?.value,
    regency_id: query?.regency?.value,
    health_center_id: query?.health_center?.value,
    entity_tag_ids: getReactSelectValue(query?.entity_tag),
    temperature_filter: query?.temperature_filter?.value,
    asset_model_ids: getReactSelectValue(query?.asset_model),
    ...(sorting?.length !== 0 && {
      sort_by: sorting?.[0]?.id,
      sort_type: sorting?.[0]?.desc ? 'desc' : 'asc',
    }),
  }) as GetStorageTemperatureMonitoringRequest

  useEffect(() => {
    setQuerySorting(
      sorting.length
        ? {
            sort_by: sorting[0].id,
            sort_type: sorting[0].desc ? 'desc' : 'asc',
          }
        : { sort_by: null, sort_type: null }
    )
  }, [sorting])

  return {
    ...filter,
    params,
    query,
    pagination: {
      ...pagination,
      set: setPagination,
    },
    sorting,
    setSorting,
  }
}
