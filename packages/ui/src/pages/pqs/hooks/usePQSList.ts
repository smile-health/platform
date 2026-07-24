import { useEffect, useState } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { SortingState } from '@tanstack/react-table'
import { useFilter, UseFilter } from '#components/filter'
import { CommonType } from '#types/common'
import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs'
import { useTranslation } from 'react-i18next'

import { exportPQS, getPQSList } from '../pqs.service'

type TModalImport = {
  type: 'import' | 'error' | null
  errors?: Record<string, string[]>
}

export const usePQSList = ({ isGlobal = false }: CommonType = {}) => {
  const { t } = useTranslation(['pqs', 'common'])
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
      label: t('pqs:list.filter.label.search'),
      placeholder: t('pqs:list.filter.placeholder.search'),
      maxLength: 255,
      id: 'input-pqs-search',
      defaultValue: '',
    },
  ]

  const filter = useFilter(filterSchema)
  const {
    data: datasource,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ['pqs-list', filter?.query, pagination, querySorting],
    queryFn: () =>
      getPQSList({
        keyword: filter?.query?.keyword,
        sort_by: querySorting?.sort_by as 'code' | 'updated_at' | undefined,
        sort_type: querySorting?.sort_type as 'asc' | 'desc' | undefined,
        ...pagination,
      }),
    placeholderData: keepPreviousData,
  })

  const handleChangeLimit = (paginate: number) =>
    setPagination({ paginate, page: 1 })

  const exportQuery = useQuery({
    queryKey: ['pqs-export', filter?.query],
    queryFn: () =>
      exportPQS({
        keyword: filter?.query?.keyword,
      }),
    enabled: false,
  })

  return {
    datasource,
    isLoading: isLoading || isFetching,
    exportQuery,
    handleChangeLimit,
    t,
    filter,
    pagination,
    setPagination,
    sorting,
    setSorting,
  }
}
