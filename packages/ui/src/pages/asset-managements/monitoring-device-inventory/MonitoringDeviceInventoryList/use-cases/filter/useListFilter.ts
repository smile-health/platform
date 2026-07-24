import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { SortingState } from '@tanstack/react-table'
import { useFilter } from '#components/filter'
import { listAssetType } from '#services/asset-type'
import { removeEmptyObject } from '#utils/object'
import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs'

import { ASSET_TYPE_RTMD_ID } from '../../../monitoring-device-inventory.constants'
import { MonitoringDeviceInventoryListFilterValues } from '../../monitoring-device-inventory-list.type'
import useListFilterSchema from './useListFilter.schema'

export const useListFilter = () => {
  const { data: assetTypeData } = useQuery({
    queryKey: ['asset-type-rtmd-filter'],
    queryFn: () =>
      listAssetType({
        page: 1,
        paginate: 10,
        status: 1,
        type_by: 'rtmd',
      }),
  })

  const assetTypeIds =
    assetTypeData?.data && assetTypeData.data.length > 0
      ? assetTypeData.data.map((type) => type.id).join(',')
      : String(ASSET_TYPE_RTMD_ID)

  const schema = useListFilterSchema(assetTypeIds)

  const [pagination, setPagination] = useQueryStates(
    {
      page: parseAsInteger.withDefault(1),
      paginate: parseAsInteger.withDefault(10),
    },
    {
      history: 'push',
    }
  )

  const filter = useFilter(schema)

  const query = filter.query as MonitoringDeviceInventoryListFilterValues

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

  const params = removeEmptyObject({
    page: pagination.page,
    paginate: pagination.paginate,
    sort_by: querySorting?.sort_by || undefined,
    sort_type: querySorting?.sort_type || undefined,
    keyword: query.keyword,
    manufacture_ids: query.manufactures?.map((item) => item.value).join(','),
    operational_status_id: query.operational_status?.value,
    is_device_related: query.is_device_related?.value,
    asset_type_ids: query.asset_types?.map((item) => item.value).join(','),
    working_status_id: query.working_status?.value,
    device_status_id: query.device_status_id?.value,
    province_id: query.province?.value,
    city_id: query.city?.value,
    rtmd_status_id: query.rtmd_status?.value,
    health_center_id: query.health_center?.value,
    entity_tag_ids: query.entity_tag?.map((item) => item.value).join(','),
    asset_model_ids: query.asset_model?.map((item) => item.value).join(','),
    ...(sorting?.length !== 0 && {
      sort_by: sorting?.[0]?.id,
      sort_type: sorting?.[0]?.desc ? 'desc' : 'asc',
    }),
  })

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
