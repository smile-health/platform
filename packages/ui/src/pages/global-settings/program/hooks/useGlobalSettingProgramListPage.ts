import { useRouter } from 'next/router'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { parseAsBoolean, parseAsInteger, parseAsString, useQueryStates } from 'nuqs'
import { useTranslation } from 'react-i18next'

import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import { functionalUpdate, SortingState } from '@tanstack/react-table'
import { useMemo } from 'react'
import { useFilter, UseFilter } from '#components/filter'
import { createFilterSchema } from '../schemas/filter'
import { getReactSelectValue } from '#utils/react-select'
import { exportPrograms, listPrograms } from '../services/program'

export const useGlobalSettingProgramListPage = () => {
  const { t, i18n: { language } } = useTranslation(['common', 'programGlobalSettings'])
  const router = useRouter()
  const [pagination, setPagination] = useQueryStates(
    {
      page: parseAsInteger.withDefault(1),
      paginate: parseAsInteger.withDefault(10),
    },
    {
      history: 'push',
    }
  )
  const [sorting, setSorting] = useQueryStates(
    {
      id: parseAsString.withDefault(''),
      desc: parseAsBoolean.withDefault(true),
    },
    {
      history: 'push',
    }
  )

  const filterSchema = useMemo<UseFilter>(
    () => createFilterSchema(t),
    [t, language]
  )
  const filter = useFilter(filterSchema)

  const setQueryParams = (isExport?: boolean) => {
    const {
      keyword,
      is_hierarchy_enabled,
    } = filter.query

    return {
      keyword: keyword,
      ...(is_hierarchy_enabled && { is_hierarchy_enabled: getReactSelectValue(is_hierarchy_enabled) }),
      ...!isExport && {
        ...pagination,
      },
      ...(sorting.id && {
        sort_by: sorting.id,
        sort_type: sorting.desc ? 'desc' : 'asc',
      }),
    }
  }

  const { data: datasource, isLoading, isFetching } = useQuery({
    queryKey: ['programs', filter, sorting, pagination],
    queryFn: () => {
      const params = setQueryParams()

      return listPrograms(params)
    },
    placeholderData: keepPreviousData,
  })

  const { isFetching: isExporting, refetch: refetchExport } = useQuery({
    queryKey: ['programs-export'],
    queryFn: () => {
      const params = setQueryParams(true)

      return exportPrograms(params)
    },
    enabled: false,
  })

  useSetLoadingPopupStore(isFetching || isExporting)

  const handleChangePage = (page: number) => setPagination((prev) => ({ ...prev, page }))

  const handleChangeLimit = (paginate: number) => setPagination((prev) => ({ ...prev, paginate, page: 1 }))

  const handleChangeSort = (sort: SortingState) => {
    const newState = functionalUpdate(sort, [{ id: sorting.id, desc: sorting.desc }])

    if (newState.length > 0) setSorting({ id: newState[0].id, desc: newState[0].desc })
    else setSorting({ id: '', desc: true })
  }

  const handleAction = (type: 'edit' | 'detail', id: number) => {
    if (type === 'edit') router.push(`/${language}/v5/global-settings/program/${id}/edit`)
    else router.push(`/${language}/v5/global-settings/program/${id}`)
  }

  return {
    t,
    language,
    router,
    pagination,
    filter,
    sorting,
    handleChangePage,
    handleChangeLimit,
    handleChangeSort,
    isLoading,
    isFetching,
    datasource,
    handleAction,
    refetchExport,
  }
}