import { useCallback, useMemo } from 'react'
import { ColumnDef, Row } from '@tanstack/react-table'
import { DataTable } from '#components/data-table'
import {
  Pagination,
  PaginationContainer,
  PaginationInfo,
  PaginationSelectLimit,
} from '#components/pagination'
import { AssetManagementsOperationalStatusBadge } from '#pages/asset-managements/components/AssetManagementsOperationalStatusBadge'
import { MetricIndicator } from '#pages/asset-managements/components/MetricIndicator'
import { formatDateWithoutTimezone } from '#utils/date'
import { useTranslation } from 'react-i18next'

import { StorageTemperatureMonitoringDetailHistory } from '../../../../storage-temperature-monitoring/StorageTemperatureMonitoringDetail/storage-temperature-monitoring-detail.type'
import { useMonitoringDeviceInventoryDetail } from '../../MonitoringDeviceInventoryDetailContext'

export const LoggerActivityTable = () => {
  const { t } = useTranslation(['storageTemperatureMonitoringDetail'])
  const {
    historyData,
    isWarehouse,
    historyFilter,
    isLoadingHistory,
    historyPagination,
    humidityThreshold,
    setHistoryPagination,
  } = useMonitoringDeviceInventoryDetail()

  const renderCell = useCallback(
    (
      row: Row<StorageTemperatureMonitoringDetailHistory>,
      type: 'temperature' | 'humidity' | 'cold_chain_status'
    ) => {
      if (type === 'temperature') {
        const log = {
          temperature: row.original?.temperature ?? 0,
          threshold: {
            min_value:
              row.original?.temperature_threshold?.min_temperature ?? 0,
            max_value:
              row.original?.temperature_threshold?.max_temperature ?? 0,
          },
        }
        return (
          <MetricIndicator value={log.temperature} threshold={log.threshold} />
        )
      }
      if (type === 'humidity') {
        const log = {
          humidity: row.original?.humidity ?? 0,
          threshold: {
            min_value: humidityThreshold?.min ?? 0,
            max_value: humidityThreshold?.max ?? 0,
          },
        }
        return (
          <MetricIndicator
            value={log.humidity}
            threshold={log.threshold}
            unit="%"
          />
        )
      }
      if (type === 'cold_chain_status') {
        return (
          <AssetManagementsOperationalStatusBadge
            working_status={row.original?.working_status}
          />
        )
      }
    },
    [humidityThreshold]
  )

  const customColumns: Array<
    ColumnDef<StorageTemperatureMonitoringDetailHistory>
  > = useMemo(
    () => [
      {
        accessorKey: 'no',
        header: 'No',
        minSize: 50,
        size: 50,
        cell: ({ row }) => row.index + 1,
      },
      {
        accessorKey: 'date',
        header: t(
          'storageTemperatureMonitoringDetail:logger_activity.activity_table.columns.date'
        ),
        minSize: 100,
        size: 100,
        cell: ({ row }) => {
          return formatDateWithoutTimezone(
            row.original?.actual_time,
            'DD MMM YYYY HH:mm'
          ).toLocaleUpperCase()
        },
      },
      {
        accessorKey: 'temperature',
        header: t(
          'storageTemperatureMonitoringDetail:logger_activity.activity_table.columns.temperature'
        ),
        minSize: 76,
        size: 76,
        cell: ({ row }) => renderCell(row, 'temperature'),
      },
      ...(isWarehouse
        ? ([
            {
              accessorKey: 'humidity',
              header: t(
                'storageTemperatureMonitoringDetail:logger_activity.activity_table.columns.humidity'
              ),
              minSize: 76,
              size: 76,
              cell: ({ row }) => renderCell(row, 'humidity'),
            },
          ] as Array<ColumnDef<StorageTemperatureMonitoringDetailHistory>>)
        : ([] as Array<ColumnDef<StorageTemperatureMonitoringDetailHistory>>)),
      {
        accessorKey: 'cold_chain_status',
        header: isWarehouse
          ? t(
              'storageTemperatureMonitoringDetail:logger_activity.activity_table.columns.room_status'
            )
          : t(
              'storageTemperatureMonitoringDetail:logger_activity.activity_table.columns.cold_chain_status'
            ),
        minSize: 100,
        size: 100,
        cell: ({ row }) => renderCell(row, 'cold_chain_status'),
      },
      {
        accessorKey: 'temperature_threshold',
        header: t(
          'storageTemperatureMonitoringDetail:logger_activity.activity_table.columns.temperature_threshold'
        ),
        minSize: 100,
        size: 100,
        cell: ({ row }) => {
          const min = `Min ${
            row.original?.other_temperature_threshold?.other_min_threshold ??
            row.original?.temperature_threshold?.min_temperature ??
            0
          }°C`
          const max = `Max ${
            row.original?.other_temperature_threshold?.other_max_threshold ??
            row.original?.temperature_threshold?.max_temperature ??
            0
          }°C`
          return `${min} - ${max}`
        },
      },
      ...(isWarehouse
        ? [
            {
              accessorKey: 'humidity_threshold',
              header: t(
                'storageTemperatureMonitoringDetail:logger_activity.activity_table.columns.humidity_threshold'
              ),
              minSize: 100,
              size: 100,
              cell: () => {
                const min = `Min ${humidityThreshold?.min}%`
                const max = `Max ${humidityThreshold?.max}%`
                return `${min} - ${max}`
              },
            },
          ]
        : ([] as Array<ColumnDef<StorageTemperatureMonitoringDetailHistory>>)),
    ],
    [t, renderCell, historyFilter?.logger_id]
  )

  return (
    <>
      <DataTable
        key={historyFilter?.logger_id ?? 'logger'}
        columns={customColumns}
        data={historyData?.data ?? []}
        isLoading={isLoadingHistory}
      />
      <PaginationContainer>
        <PaginationSelectLimit
          size={historyPagination.paginate}
          onChange={(limit) =>
            setHistoryPagination({
              page: 1,
              paginate: limit,
            })
          }
        />
        <PaginationInfo
          size={historyPagination.paginate}
          currentPage={historyPagination.page}
          total={historyData?.total_item ?? 0}
        />
        <Pagination
          totalPages={historyData?.total_page ?? 0}
          currentPage={historyPagination.page}
          onPageChange={(page) => {
            setHistoryPagination({
              page,
              paginate: historyPagination.paginate,
            })
          }}
        />
      </PaginationContainer>
    </>
  )
}
