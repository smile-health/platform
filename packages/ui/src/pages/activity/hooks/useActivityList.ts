import { useEffect, useState } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { SortingState } from '@tanstack/react-table'
import { useFilter, UseFilter } from '#components/filter'
import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs'
import { useTranslation } from 'react-i18next'

import { listActivities } from '../activity.service'

export const useActivityList = () => {
  const { t } = useTranslation(['common', 'activity'])
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

  const filterSchema: UseFilter = [
    {
      type: 'text',
      name: 'keyword',
      label: t('common:search'),
      placeholder: t('activity:title.search'),
      maxLength: 255,
      id: 'input-activity-search',
      defaultValue: '',
    },
  ]

  const filter = useFilter(filterSchema)

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['activities', filter?.query, pagination, querySorting],
    queryFn: () =>
      listActivities({
        keyword: filter?.query?.keyword,
        ...querySorting,
        ...pagination,
      }),
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  })

  const handleChangeLimit = (paginate: number) =>
    setPagination({ paginate, page: 1 })

  return {
    pagination,
    setPagination,
    handleChangeLimit,
    data,
    isLoading: isLoading || isFetching,
    filter,
    setSorting,
    sorting,
  }
}
