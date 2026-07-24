import { useEffect, useState } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { SortingState } from '@tanstack/react-table'
import { useFilter, UseFilter } from '#components/filter'
import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs'
import { useTranslation } from 'react-i18next'

import { listTestMethods } from '../test-method.service'

export const useTestMethodList = () => {
  const { t } = useTranslation(['common', 'testMethod'])
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
      sort_by: parseAsString.withDefault('created_at'),
      sort_type: parseAsString.withDefault('desc'),
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
      : [{ desc: true, id: 'created_at' }]
  )
  useEffect(() => {
    setQuerySorting(
      sorting.length
        ? {
            sort_by: sorting[0].id,
            sort_type: sorting[0].desc ? 'desc' : 'asc',
          }
        : { sort_by: 'created_at', sort_type: 'desc' }
    )
  }, [sorting])

  const filterSchema: UseFilter = [
    {
      type: 'text',
      name: 'keyword',
      label: t('common:search'),
      placeholder: t('testMethod:table.search'),
      maxLength: 255,
      id: 'input-test-method-search',
      defaultValue: '',
    },
  ]

  const filter = useFilter(filterSchema)

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['test-methods', filter?.query, pagination, querySorting],
    queryFn: () =>
      listTestMethods({
        keyword: filter?.query?.keyword,
        sort_by: querySorting.sort_by || 'created_at',
        sort_type: querySorting.sort_type || 'desc',
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
