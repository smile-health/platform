import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { BOOLEAN } from '#constants/common'
import useSmileRouter from '#hooks/useSmileRouter'
import { useTranslation } from 'react-i18next'

import { listPeriodOfStockTaking } from '../../services/period-of-stock-taking.services'
import { TPeriodOfStockTakingData } from '../libs/period-of-stock-taking-list.type'

export const usePeriodOfStockTakingActiveData = (key: number | string) => {
  const router = useSmileRouter()
  const {
    i18n: { language },
  } = useTranslation(['common', 'periodOfStockTaking'])
  const [activeStockTakingData, setActiveStockTakingData] =
    useState<TPeriodOfStockTakingData | null>(null)

  const {
    data: activePeriodData,
    isLoading: isLoadingActivePeriodData,
    isFetching: isFetchingActivePeriodData,
  } = useQuery({
    queryKey: ['active-period-of-stock-taking', key, language],
    queryFn: () => listPeriodOfStockTaking({ status: BOOLEAN.TRUE }),
    refetchOnMount: true,
    enabled: router.isReady && !!key,
    select: (data) => {
      return data?.data?.find((item) => item.status === BOOLEAN.TRUE) || null
    },
  })

  useEffect(() => {
    if (activePeriodData) {
      setActiveStockTakingData(activePeriodData)
    } else {
      setActiveStockTakingData(null)
    }
  }, [activePeriodData])

  const contextValue = useMemo(
    () => ({
      activeStockTakingData,
      setActiveStockTakingData,
    }),
    [activeStockTakingData, setActiveStockTakingData]
  )

  return {
    activePeriodData,
    isLoadingActivePeriodData,
    isFetchingActivePeriodData,
    contextValue,
  }
}
