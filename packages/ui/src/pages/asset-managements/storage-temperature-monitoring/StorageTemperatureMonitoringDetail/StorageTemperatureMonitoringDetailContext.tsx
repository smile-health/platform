import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useParams } from 'next/navigation'
import { parseDate } from '@internationalized/date'
import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from '@tanstack/react-query'
import { toast } from '#components/toast'
import { BOOLEAN } from '#constants/common'
import { AxiosError } from 'axios'
import { useTranslation } from 'react-i18next'

import { LoggerActivityTab } from './storage-temperature-monitoring-detail.constants'
import {
  exportStorageTemperatureMonitoringHistoryDetail,
  getStorageTemperatureMonitoringChartData,
  GetStorageTemperatureMonitoringChartDataResponse,
  getStorageTemperatureMonitoringDetail,
  GetStorageTemperatureMonitoringDetailHistoryResponse,
  getStorageTemperatureMonitoringHistoryDetail,
  updateStorageTemperatureMonitoringStatus,
  UpdateStorageTemperatureMonitoringStatusRequest,
  updateStorageTemperatureMonitoringThreshold,
  UpdateStorageTemperatureMonitoringThresholdRequest,
} from './storage-temperature-monitoring-detail.service'
import { StorageTemperatureMonitoringDetail } from './storage-temperature-monitoring-detail.type'

type ErrorResponse = {
  message: string
}

type HistoryPagination = {
  page: number
  paginate: number
}
type HistoryFilter = {
  logger_id?: number
  date_range?: any
}

type StorageTemperatureMonitoringDetailContextValue = {
  data?: StorageTemperatureMonitoringDetail
  isLoading: boolean
  isError: boolean
  isUpdatingActiveThreshold: boolean
  isUpdatingStatus: boolean
  isGlobal: boolean
  refetch: () => void
  onUpdateActiveThreshold: (
    data: UpdateStorageTemperatureMonitoringThresholdRequest
  ) => void
  onUpdateStatus: (
    data: UpdateStorageTemperatureMonitoringStatusRequest
  ) => void
  historyPagination: HistoryPagination
  historyFilter: HistoryFilter
  setHistoryFilter: (filter: HistoryFilter) => void
  setHistoryPagination: (pagination: HistoryPagination) => void
  historyData?: GetStorageTemperatureMonitoringDetailHistoryResponse
  isLoadingHistory: boolean
  isErrorHistory: boolean
  refetchHistory: () => void
  exportHistory: UseQueryResult<any, Error>
  sortedHistoryData?: GetStorageTemperatureMonitoringDetailHistoryResponse['data']
  isWarehouse: boolean
  activeTab: LoggerActivityTab
  setActiveTab: (tab: LoggerActivityTab) => void
  humidityThreshold?: {
    min: number
    max: number
  }
  chartData?: GetStorageTemperatureMonitoringChartDataResponse
  isLoadingChartData: boolean
  isErrorChartData: boolean
  refetchChartData: () => void
  sortedChartData?: GetStorageTemperatureMonitoringChartDataResponse['data']
}

export const StorageTemperatureMonitoringDetailContext = createContext<
  StorageTemperatureMonitoringDetailContextValue | undefined
>(undefined)

type StorageTemperatureMonitoringDetailProviderProps = PropsWithChildren & {
  isGlobal?: boolean
}

export const StorageTemperatureMonitoringDetailProvider = ({
  children,
  isGlobal = false,
}: StorageTemperatureMonitoringDetailProviderProps) => {
  const {
    t,
    i18n: { language },
  } = useTranslation(['common', 'storageTemperatureMonitoringDetail'])
  const queryClient = useQueryClient()
  const params = useParams()
  const id = params.id as string
  const [activeTab, setActiveTab] = useState(LoggerActivityTab.Temperature)

  const [historyPagination, setHistoryPagination] = useState<HistoryPagination>(
    {
      page: 1,
      paginate: 10,
    }
  )
  const [historyFilter, setHistoryFilter] = useState<HistoryFilter>({
    logger_id: undefined,
    date_range: undefined,
  })

  const dateFilter = useMemo(() => {
    return {
      from_date: historyFilter?.date_range
        ? parseDate(historyFilter?.date_range.from_date.toString()).toString()
        : undefined,
      to_date: historyFilter?.date_range
        ? parseDate(historyFilter?.date_range.to_date.toString()).toString()
        : undefined,
    }
  }, [historyFilter])

  const currentFilter = useMemo(() => {
    return {
      ...historyPagination,
      ...dateFilter,
    }
  }, [historyFilter, historyPagination, dateFilter])

  const {
    data: chartData,
    isLoading: isLoadingChartData,
    isError: isErrorChartData,
    refetch: refetchChartData,
  } = useQuery({
    queryKey: [
      'storage-temperature-monitoring-detail-chart-data',
      {
        logger_id: historyFilter?.logger_id,
        ...dateFilter,
      },
    ],
    queryFn: () =>
      getStorageTemperatureMonitoringChartData(
        historyFilter.logger_id as number,
        dateFilter
      ),
    enabled:
      !!historyFilter?.logger_id ||
      (!!historyFilter?.date_range?.start_date &&
        !!historyFilter?.date_range?.end_date),
  })

  const {
    data: historyData,
    isLoading: isLoadingHistory,
    isError: isErrorHistory,
    refetch: refetchHistory,
  } = useQuery({
    queryKey: [
      'storage-temperature-monitoring-detail-history',
      {
        logger_id: historyFilter?.logger_id,
        ...currentFilter,
      },
    ],
    queryFn: () =>
      getStorageTemperatureMonitoringHistoryDetail(
        historyFilter.logger_id as number,
        currentFilter
      ),
    enabled:
      !!historyFilter?.logger_id ||
      (!!historyFilter?.date_range?.start_date &&
        !!historyFilter?.date_range?.end_date),
  })

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['storage-temperature-monitoring-detail', { id }],
    queryFn: () => getStorageTemperatureMonitoringDetail(id),
    enabled: !!id,
  })

  useEffect(() => {
    if (language) {
      refetch()
    }
  }, [language, refetch])

  const {
    mutate: onUpdateActiveThreshold,
    isPending: isUpdatingActiveThreshold,
  } = useMutation({
    mutationFn: (data: UpdateStorageTemperatureMonitoringThresholdRequest) =>
      updateStorageTemperatureMonitoringThreshold(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['storage-temperature-monitoring-detail', { id }],
      })
      toast.success({
        description: t('common:message.success.update', {
          type: t(
            'storageTemperatureMonitoringDetail:message.temperature_threshold'
          ),
        }),
      })
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        const response = error.response?.data as ErrorResponse
        toast.danger({
          description: response?.message || t('common:message.common.error'),
        })
      }
    },
  })

  const { mutate: onUpdateStatus, isPending: isUpdatingStatus } = useMutation({
    mutationFn: (data: UpdateStorageTemperatureMonitoringStatusRequest) =>
      updateStorageTemperatureMonitoringStatus(id, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['storage-temperature-monitoring-detail', { id }],
      })
      toast.success({
        description: t('common:message.success.update_status', {
          type: t(
            'storageTemperatureMonitoringDetail:message.storage_temperature_monitoring'
          ),
        }),
      })
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        const response = error.response?.data as ErrorResponse
        toast.danger({
          description: response?.message || t('common:message.common.error'),
        })
      }
    },
  })

  const isWarehouse = useMemo(() => {
    return data?.asset_type?.is_warehouse === BOOLEAN.TRUE
  }, [data?.asset_type?.is_warehouse])

  const exportParams = useMemo(() => {
    return { ...currentFilter, ...(isWarehouse ? { is_warehouse: 1 } : {}) }
  }, [currentFilter, isWarehouse])

  const exportHistory = useQuery({
    queryKey: [
      'storage-temperature-monitoring-detail-history-export',
      {
        logger_id: historyFilter?.logger_id,
        ...exportParams,
      },
    ],
    queryFn: () =>
      exportStorageTemperatureMonitoringHistoryDetail(
        historyFilter.logger_id as number,
        exportParams
      ),
    enabled: false,
  })

  const sortedHistoryData = (
    Array.isArray(historyData?.data) ? [...historyData.data] : []
  ).sort(
    (a, b) =>
      new Date(a.actual_time).getTime() - new Date(b.actual_time).getTime()
  )

  const sortedChartData = (
    Array.isArray(chartData?.data) ? [...chartData.data] : []
  ).sort(
    (a, b) =>
      new Date(a.actual_time).getTime() - new Date(b.actual_time).getTime()
  )

  const humidityThreshold = useMemo(() => {
    return {
      min: data?.asset_type?.humidity_thresholds?.[0]?.min_humidity ?? 0,
      max: data?.asset_type?.humidity_thresholds?.[0]?.max_humidity ?? 0,
    }
  }, [data])

  const contextValue = useMemo(
    () => ({
      data,
      isLoading,
      isError,
      isUpdatingActiveThreshold,
      isUpdatingStatus,
      isGlobal,
      refetch,
      onUpdateActiveThreshold,
      onUpdateStatus,
      historyPagination,
      setHistoryPagination,
      historyFilter,
      setHistoryFilter,
      historyData,
      isLoadingHistory,
      isErrorHistory,
      refetchHistory,
      exportHistory,
      sortedHistoryData,
      isWarehouse,
      activeTab,
      setActiveTab,
      humidityThreshold,
      chartData,
      isLoadingChartData,
      isErrorChartData,
      refetchChartData,
      sortedChartData,
    }),
    [
      data,
      isLoading,
      isError,
      isUpdatingActiveThreshold,
      isUpdatingStatus,
      isGlobal,
      refetch,
      onUpdateActiveThreshold,
      onUpdateStatus,
      historyPagination,
      setHistoryPagination,
      historyFilter,
      setHistoryFilter,
      historyData,
      isLoadingHistory,
      isErrorHistory,
      refetchHistory,
      exportHistory,
      sortedHistoryData,
      isWarehouse,
      activeTab,
      setActiveTab,
      humidityThreshold,
      chartData,
      isLoadingChartData,
      isErrorChartData,
      refetchChartData,
    ]
  )

  return (
    <StorageTemperatureMonitoringDetailContext.Provider value={contextValue}>
      {children}
    </StorageTemperatureMonitoringDetailContext.Provider>
  )
}

StorageTemperatureMonitoringDetailContext.displayName =
  'StorageTemperatureMonitoringDetailContext'

export const useStorageTemperatureMonitoringDetail = () => {
  const context = useContext(StorageTemperatureMonitoringDetailContext)

  if (!context) {
    throw new Error(
      'useStorageTemperatureMonitoringDetail must be used within a StorageTemperatureMonitoringDetailProvider'
    )
  }

  return context
}

export const StorageTemperatureMonitoringDetailConsumer = ({
  children,
}: {
  children: (
    value: StorageTemperatureMonitoringDetailContextValue
  ) => React.ReactNode
}) => {
  const storageTemperatureMonitoringDetail =
    useStorageTemperatureMonitoringDetail()
  return children(storageTemperatureMonitoringDetail)
}
