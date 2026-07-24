import {
  createContext,
  PropsWithChildren,
  useContext,
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
import useSmileRouter from '#hooks/useSmileRouter'
import { AxiosError } from 'axios'
import { useTranslation } from 'react-i18next'

import { LoggerActivityTab } from '../../storage-temperature-monitoring/StorageTemperatureMonitoringDetail/storage-temperature-monitoring-detail.constants'
import {
  exportStorageTemperatureMonitoringHistoryDetail,
  getStorageTemperatureMonitoringChartData,
  GetStorageTemperatureMonitoringChartDataResponse,
  GetStorageTemperatureMonitoringDetailHistoryResponse,
  getStorageTemperatureMonitoringHistoryDetail,
} from '../../storage-temperature-monitoring/StorageTemperatureMonitoringDetail/storage-temperature-monitoring-detail.service'
import {
  deleteMonitoringDeviceInventory,
  getMonitoringDeviceInventoryDetail,
  updateMonitoringDeviceInventoryStatus,
  UpdateMonitoringDeviceInventoryStatusRequest,
} from './monitoring-device-inventory-detail.service'
import {
  AssetType,
  MonitoringDeviceInventoryDetail,
} from './monitoring-device-inventory.type'

type HistoryPagination = {
  page: number
  paginate: number
}

type HistoryFilter = {
  logger_id?: number
  date_range?: any
}

type ErrorResponse = {
  message: string
}

type MonitoringDeviceInventoryDetailContextValue = {
  data?: MonitoringDeviceInventoryDetail
  isLoading: boolean
  isError: boolean
  isDeleting: boolean
  isUpdatingStatus: boolean
  isGlobal: boolean
  refetch: () => void
  onDelete: () => void
  onUpdateStatus: (data: UpdateMonitoringDeviceInventoryStatusRequest) => void
  historyPagination: HistoryPagination
  setHistoryPagination: (pagination: HistoryPagination) => void
  historyFilter: HistoryFilter
  setHistoryFilter: (filter: HistoryFilter) => void
  activeTab: LoggerActivityTab
  setActiveTab: (tab: LoggerActivityTab) => void
  historyData?: GetStorageTemperatureMonitoringDetailHistoryResponse
  isLoadingHistory: boolean
  isErrorHistory: boolean
  refetchHistory: () => void
  exportHistory: UseQueryResult<any, Error>
  sortedHistoryData?: GetStorageTemperatureMonitoringDetailHistoryResponse['data']
  isWarehouse: boolean
  humidityThreshold: {
    min: number
    max: number
  }
  assetType?: AssetType
  setAssetType: (assetType: AssetType | undefined) => void
  chartData?: GetStorageTemperatureMonitoringChartDataResponse
  isLoadingChartData: boolean
  isErrorChartData: boolean
  refetchChartData: () => void
  sortedChartData?: GetStorageTemperatureMonitoringChartDataResponse['data']
}

export const MonitoringDeviceInventoryDetailContext = createContext<
  MonitoringDeviceInventoryDetailContextValue | undefined
>(undefined)

type MonitoringDeviceInventoryDetailProviderProps = PropsWithChildren & {
  isGlobal?: boolean
}

export const MonitoringDeviceInventoryDetailProvider = ({
  children,
  isGlobal = false,
}: MonitoringDeviceInventoryDetailProviderProps) => {
  const { t } = useTranslation(['common', 'monitoringDeviceInventory'])
  const router = useSmileRouter()
  const queryClient = useQueryClient()
  const params = useParams()
  const id = params.id as string

  const [activeTab, setActiveTab] = useState(LoggerActivityTab.Temperature)
  const [assetType, setAssetType] = useState<AssetType | undefined>(undefined)

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
      'monitoring-device-inventory-detail-chart-data',
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
      'monitoring-device-inventory-detail-history',
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

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['monitoring-device-inventory-detail', { id }],
    queryFn: () => getMonitoringDeviceInventoryDetail(id),
    enabled: !!id,
  })

  const humidityThreshold = useMemo(() => {
    return {
      min: assetType?.humidity_thresholds?.[0]?.min_humidity ?? 0,
      max: assetType?.humidity_thresholds?.[0]?.max_humidity ?? 0,
    }
  }, [assetType?.humidity_thresholds])

  const isWarehouse = useMemo(() => {
    return assetType?.is_warehouse === BOOLEAN.TRUE
  }, [assetType?.is_warehouse])

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

  const { mutate: onDelete, isPending: isDeleting } = useMutation({
    mutationFn: () => deleteMonitoringDeviceInventory(id),
    onSuccess: () => {
      toast.success({
        description: t('common:message.success.delete', {
          type: t('monitoringDeviceInventory:monitoring_device'),
        }),
      })
      router.pushGlobal(
        isGlobal
          ? '/v5/global-asset/management/monitoring-device-inventory'
          : '/v5/asset-managements/monitoring-device-inventory'
      )
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
    mutationFn: (data: UpdateMonitoringDeviceInventoryStatusRequest) =>
      updateMonitoringDeviceInventoryStatus(id, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['monitoring-device-inventory-detail', { id }],
      })
      toast.success({
        description: t('common:message.success.update_status', {
          type: t('monitoringDeviceInventory:monitoring_device'),
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

  const contextValue = useMemo(
    () => ({
      data,
      isLoading,
      isError,
      isDeleting,
      isUpdatingStatus,
      isGlobal,
      refetch,
      onDelete,
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
      assetType,
      setAssetType,
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
      isDeleting,
      isUpdatingStatus,
      isGlobal,
      refetch,
      onDelete,
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
      assetType,
      setAssetType,
      chartData,
      isLoadingChartData,
      isErrorChartData,
      refetchChartData,
      sortedChartData,
    ]
  )

  return (
    <MonitoringDeviceInventoryDetailContext.Provider value={contextValue}>
      {children}
    </MonitoringDeviceInventoryDetailContext.Provider>
  )
}

MonitoringDeviceInventoryDetailContext.displayName =
  'MonitoringDeviceInventoryDetailContext'

export const useMonitoringDeviceInventoryDetail = () => {
  const context = useContext(MonitoringDeviceInventoryDetailContext)

  if (!context) {
    throw new Error(
      'useMonitoringDeviceInventoryDetail must be used within a MonitoringDeviceInventoryDetailProvider'
    )
  }

  return context
}

export const MonitoringDeviceInventoryDetailConsumer = ({
  children,
}: {
  children: (
    value: MonitoringDeviceInventoryDetailContextValue
  ) => React.ReactNode
}) => {
  const monitoringDeviceInventoryDetail = useMonitoringDeviceInventoryDetail()
  return children(monitoringDeviceInventoryDetail)
}
