import { useMemo, useState } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { BOOLEAN } from '#constants/common'
import useSmileRouter from '#hooks/useSmileRouter'
import { TProgram } from '#types/program'
import { TTransactionData } from '#types/transaction'
import { useTranslation } from 'react-i18next'

import { listTransactions } from '../../transaction.services'
import { MATERIAL_LEVEL } from '../helpers/transaction-list.constant'

interface Pagination {
  page: number
  paginate: number
}

type Props = {
  filter: { query: Record<string, any> }
  pagination: Pagination
  setPagination: (value: Pagination) => void
  program: TProgram
}

export const useTransactionListData = ({
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
  const filterQueryKey = useMemo(() => {
    const { material_id, material_level_id, date_range, ...query } =
      filter.query
    query.is_order = Number(filter.query?.is_order) ? null : BOOLEAN.FALSE
    return {
      ...query,
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
      date_range: {
        // to avoid twice fetching data
        start: date_range?.start?.toString(),
        end: date_range?.end?.toString(),
      },
    }
  }, [filter.query, program])

  const {
    data: listTransactionsData,
    isLoading: isLoadingListTransactions,
    isFetching: isFetchingListTransactions,
  } = useQuery({
    queryKey: ['list-transaction', filterQueryKey, pagination, language],
    queryFn: () => listTransactions({ ...filterQueryKey, ...pagination }),
    placeholderData: keepPreviousData,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    enabled:
      router.isReady && Object.values(filter.query).some((item) => !!item),
  })

  const contextValue = useMemo(
    () => ({
      program,
      setPagination,
      transactionData,
      setTransactionData,
    }),
    [program, setPagination, transactionData, setTransactionData]
  )

  return {
    listTransactionsData,
    isLoadingListTransactions,
    isFetchingListTransactions,
    contextValue,
  }
}
