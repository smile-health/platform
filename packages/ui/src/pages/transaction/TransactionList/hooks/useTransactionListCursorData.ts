import { useMemo, useState } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useQueryStates, parseAsString } from 'nuqs'
import { BOOLEAN } from '#constants/common'
import useSmileRouter from '#hooks/useSmileRouter'
import { TProgram } from '#types/program'
import { TTransactionData } from '#types/transaction'
import { ITransactionCursorPaginationParams } from '#types/cursor-pagination'
import { useTranslation } from 'react-i18next'

import { countTotalTransactionsData, listTransactionsCursor } from '../../transaction-cursor.services'
import { MATERIAL_LEVEL } from '../helpers/transaction-list.constant'

interface CursorPagination {
  paginate: number
  cursor: string | null
  page: number
}

type Props = {
  filter: { query: Record<string, any> }
  pagination: CursorPagination
  setPagination: (value: Partial<CursorPagination>) => void
  program: TProgram
}

export const useTransactionListCursorData = ({
  filter,
  pagination,
  setPagination,
  program,
}: Props) => {
  const {
    i18n: { language },
  } = useTranslation(['common', 'transactionList'])
  const [transactionData, setTransactionData] =
    useState<TTransactionData | null>(null)
  const router = useSmileRouter()
  
  // Get filter parameters from URL
  const [filterParams] = useQueryStates({
    search: parseAsString.withDefault(''),
    status: parseAsString.withDefault(''),
    type: parseAsString.withDefault(''),
    date_from: parseAsString.withDefault(''),
    date_to: parseAsString.withDefault(''),
  })
  
  const filterQueryKey = useMemo(() => {
    const { material_id, material_level_id, date_range, ...query } =
      filter.query
    query.is_order = Number(filter.query?.is_order) ? null : BOOLEAN.FALSE
    return {
      ...query,
      ...filterParams,
      parent_material_id:
        program?.config?.material?.is_hierarchy_enabled &&
        Number(material_level_id?.value) === MATERIAL_LEVEL.TEMPLATE
          ? material_id?.value
          : null,
      material_id:
        !program?.config?.material?.is_hierarchy_enabled ||
        Number(material_level_id?.value) !== MATERIAL_LEVEL.TEMPLATE
          ? material_id?.value
          : null,
      start_date: date_range?.start?.toString(),
      end_date: date_range?.end?.toString(),
    }
  }, [filter.query, program, filterParams])

  const queryParams: ITransactionCursorPaginationParams = useMemo(() => ({
    ...filterQueryKey,
    ...pagination,
  }), [filterQueryKey, pagination])

  const {
    data: listTransactionsData,
    isLoading: isLoadingListTransactions,
    isFetching: isFetchingListTransactions,
  } = useQuery({
    queryKey: ['list-transaction-cursor', queryParams, language],
    queryFn: () => listTransactionsCursor(queryParams),
    placeholderData: keepPreviousData,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    enabled:
      router.isReady && Object.values(filter.query).some((item) => !!item),
  })

  const { data: countData, isLoading: isLoadingCount, error: errorCount, isFetching: isFetchingCount } = useQuery({
    queryKey: ['transactions-cursor-simple-count', filterQueryKey ],
    queryFn: () => countTotalTransactionsData(filterQueryKey),
    placeholderData: keepPreviousData,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    enabled:
      router.isReady && Object.values(filterQueryKey).some((item) => !!item),
  })

  const contextValue = useMemo(
    () => ({
      program,
      setPagination,
      transactionData,
      setTransactionData,
      pagination,
      nextCursor: listTransactionsData?.next_cursor,
      prevCursor: listTransactionsData?.previous_cursor,
      isLoadingCount : isLoadingCount || isFetchingCount,
      totalCountData: countData?.data?.total,
    }),
    [program, setPagination, transactionData, setTransactionData, pagination, listTransactionsData?.next_cursor, listTransactionsData?.previous_cursor, isLoadingCount, countData?.data?.total, isFetchingCount]
  )

  // Navigation functions
  const goToNextPage = () => {
    if (listTransactionsData?.next_cursor) {
      setPagination({ cursor: listTransactionsData.next_cursor })
    }
  }

  const goToPreviousPage = () => {
    if (listTransactionsData?.previous_cursor) {
      setPagination({ cursor: listTransactionsData.previous_cursor })
    }
  }

  const goToFirstPage = () => {
    setPagination({ cursor: null, page: 1 })
  }

  const setLimit = (newLimit: number) => {
    setPagination({ paginate: newLimit, cursor: null, page: 1 })
  }

  return {
    listTransactionsData,
    isLoadingListTransactions,
    isFetchingListTransactions,
    contextValue,
    goToNextPage,
    goToPreviousPage,
    goToFirstPage,
    setLimit,
    hasNextPage: listTransactionsData?.has_next_page ?? false,
    hasPreviousPage: listTransactionsData?.has_previous_page ?? false,
    isLoadingCount,
    errorCount,
    countData,
  }
}