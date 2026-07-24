import { useMemo } from 'react'
import { parseDate } from '@internationalized/date'
import { useQuery } from '@tanstack/react-query'
import useSmileRouter from '#hooks/useSmileRouter'
import { hasPermission } from '#shared/permission/index'
import { RequestloginResponse } from '#types/auth'
import { Pagination } from '#types/common'
import { getUserStorage } from '#utils/storage/user'
import { useTranslation } from 'react-i18next'

import { listDistributionDisposal } from '../services/distribution-disposal.services'
import { filterOfUser } from '../utils/util'

type Props = {
  filter: { query: Record<string, any>; reset: () => void }
  additionalQuery: Pagination & { purpose?: string }
  setAdditionalQuery: (
    additionalQuery: Pagination & { purpose?: string }
  ) => void
}

export const useDistributionDisposalListData = ({
  filter,
  additionalQuery,
  setAdditionalQuery,
}: Props) => {
  const router = useSmileRouter()
  const {
    i18n: { language },
  } = useTranslation(['common', 'distributionDisposal'])

  const hasGlobalPermission = hasPermission(
    'disposal-distribution-enable-select-entity'
  )

  const userEntity = getUserStorage()
  const { defaultProvince, defaultRegency } = filterOfUser(
    userEntity as RequestloginResponse
  )

  const noNeedPredefinedFilter =
    hasGlobalPermission || (!defaultProvince && !defaultRegency)

  const filterQuery = useMemo(() => {
    if (!noNeedPredefinedFilter) {
      filter.query.province_id = defaultProvince ?? null
      filter.query.regency_id = defaultRegency ?? null
    }
    filter.query.date_range = filter.query.date_range
      ? {
          start: filter.query?.date_range?.start
            ? parseDate(filter.query?.date_range?.start?.toString())
            : null,
          end: filter.query?.date_range?.end
            ? parseDate(filter.query?.date_range?.end?.toString())
            : null,
        }
      : null
    return Object.fromEntries(
      Object.entries(filter.query).filter(([key, val]) => {
        if (key === 'purpose') return true
        return !!val
      })
    )
  }, [filter.query])

  const { data: datasource, isFetching } = useQuery({
    queryKey: [
      'list-distribution-disposal',
      JSON.stringify(filterQuery),
      additionalQuery,
      language,
    ],
    queryFn: () =>
      listDistributionDisposal({ ...filterQuery, ...additionalQuery }),
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    enabled:
      router.isReady &&
      (noNeedPredefinedFilter ||
        Object.values(filterQuery).some((item) => !!item)),
  })

  return {
    datasource,
    isFetching,
    additionalQuery,
    setAdditionalQuery,
  }
}
