import { useEffect, useState } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { Values } from 'nuqs'

import {
  createHookReturn,
  handleFilter,
} from '../dashboard-stock-taking.helper'
import { listMaterials } from '../dashboard-stock-taking.service'

type Params = {
  filter: Values<Record<string, any>>
  page: number
  paginate: number
}

export default function useStockTakingDashboardMaterial(config: Params) {
  const { filter, page, paginate } = config

  const [enabled, setEnabled] = useState(false)

  const params = handleFilter(filter)
  const paramsPaginate = {
    page,
    paginate,
    ...params,
  }

  const { data, isLoading, isFetching, isFetched } = useQuery({
    queryKey: ['materials', paramsPaginate],
    queryFn: () => listMaterials(paramsPaginate),
    enabled: enabled && !!params?.period_id,
    placeholderData: keepPreviousData,
  })

  useEffect(() => {
    if (isFetched && enabled) setEnabled(false)
  }, [isFetched, enabled])

  const getData = () => setEnabled(true)

  return createHookReturn(getData, data, isLoading || isFetching)
}
