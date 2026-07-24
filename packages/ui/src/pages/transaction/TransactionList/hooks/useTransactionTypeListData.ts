import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { BOOLEAN } from '#constants/common'
import useSmileRouter from '#hooks/useSmileRouter'

import { listTransactionTypes } from '../../transaction.services'

export const useTransactionListData = (lang: string) => {
  const constantFilter = {
    page: 1,
    paginate: 50,
    is_enable: BOOLEAN.TRUE,
    lang,
  }
  const router = useSmileRouter()
  return useQuery({
    queryKey: ['list-transaction-type', constantFilter],
    queryFn: () => listTransactionTypes(constantFilter),
    placeholderData: keepPreviousData,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    enabled: router.isReady,
  })
}
