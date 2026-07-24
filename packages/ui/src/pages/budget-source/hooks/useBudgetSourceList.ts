import { useEffect, useState } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { SortingState } from '@tanstack/react-table'
import { FilterFormSchema, useFilter, UseFilter } from '#components/filter'
import { listPrograms } from '#services/program'
import { CommonType } from '#types/common'
import { getReactSelectValue } from '#utils/react-select'
import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs'
import { useTranslation } from 'react-i18next'

import {
  exportBudgetSource,
  getCoreBudgetSource,
} from '../budget-source.service'

export const useBudgetSourceList = ({ isGlobal = false }: CommonType = {}) => {
  const { t } = useTranslation(['budgetSource', 'common'])
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

  const paramsFilter = { page: 1, paginate: 100 }
  const filterSchema: UseFilter = [
    {
      type: 'text',
      name: 'keyword',
      label: t('budgetSource:list.filter.search.label'),
      placeholder: t('budgetSource:list.filter.search.placeholder'),
      maxLength: 255,
      id: 'input-budget-source-search',
      defaultValue: '',
    },
    ...(isGlobal
      ? [
          {
            type: 'select',
            name: 'program_ids',
            id: 'select-program',
            isMulti: true,
            label: t('budgetSource:list.filter.program.label'),
            placeholder: t('budgetSource:list.filter.program.placeholder'),
            className: '',
            defaultValue: null,
            loadOptions: async () => {
              const result = await listPrograms(paramsFilter)
              const reformatResult =
                result?.data?.map((x) => ({ value: x.id, label: x.name })) || []
              const defaultList = [
                {
                  value: 0,
                  label: t('budgetSource:form.program.without_program'),
                },
              ]
              return [...defaultList, ...reformatResult]
            },
          } as FilterFormSchema,
        ]
      : []),
  ]

  const filter = useFilter(filterSchema)
  const {
    data: datasource,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ['budget-source', filter?.query, pagination, querySorting],
    queryFn: () =>
      getCoreBudgetSource(
        {
          keyword: filter?.query?.keyword,
          program_ids: getReactSelectValue(filter?.query?.program_ids),
          ...querySorting,
          ...pagination,
        },
        isGlobal
      ),
    placeholderData: keepPreviousData,
  })

  const handleChangeLimit = (paginate: number) =>
    setPagination({ paginate, page: 1 })

  const exportQuery = useQuery({
    queryKey: ['budget-source-export', filter?.query],
    queryFn: () => exportBudgetSource(filter?.query, isGlobal),
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
