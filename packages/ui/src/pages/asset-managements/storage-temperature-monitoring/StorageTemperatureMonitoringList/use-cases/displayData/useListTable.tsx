import { useMemo } from 'react'
import Link from 'next/link'
import { ColumnDef } from '@tanstack/react-table'
import { Button } from '#components/button'
import { USER_ROLE } from '#constants/roles'
import useSmileRouter from '#hooks/useSmileRouter'
import cx from '#lib/cx'
import AssetManagementsFieldWithOtherOption from '#pages/asset-managements/components/AssetManagementsFieldWithOtherOption'
import { AssetManagementsOperationalStatusBadge } from '#pages/asset-managements/components/AssetManagementsOperationalStatusBadge'
import { ConnectionAndPowerCell } from '#pages/asset-managements/storage-temperature-monitoring/StorageTemperatureMonitoringDetail/use-cases/display-relation-table/ConnectionAndPowerCell'
import { TemperatureCell } from '#pages/asset-managements/storage-temperature-monitoring/StorageTemperatureMonitoringDetail/use-cases/display-relation-table/TemperatureCell'
import { getUserStorage } from '#utils/storage/user'
import { useTranslation } from 'react-i18next'

import { handleOtherValue } from '../../../../asset-managements.helper'
import { StorageTemperatureMonitoringModel } from '../../storage-temperature-monitoring-list.model'
import { useStorageTemperatureMonitoringList } from '../../StorageTemperatureMonitoringListContext'
import { NotDetectedCell } from './NotDetectedCell'

export const useListTable = () => {
  const { t, i18n } = useTranslation([
    'common',
    'assetInventory',
    'storageTemperatureMonitoringList',
  ])
  const user = getUserStorage()
  const smileRouter = useSmileRouter()

  const pathname = smileRouter.pathname
  const currentPathname = pathname.replace('[lang]', i18n.language)

  const storageTemperatureMonitoringList = useStorageTemperatureMonitoringList()
  const listFilter = storageTemperatureMonitoringList.filter

  const isWarehouse = storageTemperatureMonitoringList?.isWarehouse
  const isVendorIot = user?.role === USER_ROLE.VENDOR_IOT

  const columns: ColumnDef<StorageTemperatureMonitoringModel>[] = useMemo(
    () => [
      {
        header: t('storageTemperatureMonitoringList:table.column.no'),
        accessorKey: 'number',
        size: 50,
        maxSize: 50,
        cell: ({ row }) => {
          return (
            (listFilter.pagination.page - 1) * listFilter.pagination.paginate +
            (row.index + 1)
          )
        },
      },
      {
        header: t('storageTemperatureMonitoringList:table.column.asset_name'),
        accessorKey: 'asset_name',
        id: 'serial_number',
        enableSorting: true,
        size: 300,
        minSize: 300,
        cell: ({ row }) => {
          const item = row?.original
          return (
            <div className="ui-text-sm space-y-1">
              <div className="ui-text-dark-blue">
                <strong>{item?.serial_number}</strong>
                {handleOtherValue(
                  item?.asset_model?.name,
                  item?.other_asset_model_name
                )}{' '}
                {handleOtherValue(
                  item?.manufacture?.name,
                  item?.other_manufacture_name,
                  'manufacturer'
                )}
              </div>
              <div className="ui-text-dark-blue">
                {item?.entity?.name ?? '-'}
              </div>
              <div className="ui-text-neutral-500">
                {item?.regency?.name ? `${item?.regency?.name},` : ''}
                {item?.province?.name ? ` ${item?.province?.name}` : ''}
              </div>
            </div>
          )
        },
      },
      {
        accessorKey: 'asset_type',
        id: 'asset_type_name',
        enableSorting: true,
        header: t('assetInventory:device_relation.table.asset_type'),
        size: 200,
        minSize: 200,
        cell: ({ row }) => (
          <AssetManagementsFieldWithOtherOption
            primaryValue={row.original?.asset_type?.name}
            otherValue={row.original?.other_asset_type_name}
            t={t}
            optionKey={t('assetInventory:columns.asset_type.label')}
          />
        ),
        meta: {
          cellClassName: 'ui-content-start',
        },
      },
      {
        header: t(
          'storageTemperatureMonitoringList:table.column.operational_status'
        ),
        accessorKey: 'operational_status',
        id: 'working_status_name',
        size: 150,
        minSize: 150,
        meta: {
          cellClassName: 'ui-content-start',
        },
        cell: ({ row }) => {
          return (
            <div className="ui-min-h-[60px]">
              <AssetManagementsOperationalStatusBadge
                working_status={row.original.working_status}
              />
            </div>
          )
        },
      },
      {
        header: isWarehouse
          ? t(
              'storageTemperatureMonitoringList:table.column.temperature_humidity'
            )
          : t('storageTemperatureMonitoringList:table.column.temperature'),
        accessorKey: 'temperature_humidity',
        size: 220,
        minSize: 220,
        cell: ({ row }) => {
          if (row?.original?.rtmd_devices?.length === 0) {
            return (
              <div className="ui-min-h-[60px] ui-text-neutral-500 ui-content-start">
                <NotDetectedCell
                  message={t(
                    'storageTemperatureMonitoringList:table.column.not_detected'
                  )}
                />
              </div>
            )
          }
          const activeThreshold =
            row?.original?.asset_type?.temperature_thresholds?.find(
              (threshold) => threshold?.is_active === 1
            )
          const activeHumidityThreshold =
            row?.original?.asset_type?.humidity_thresholds?.[0]
          return (
            <div>
              {row.original?.rtmd_devices?.map((rtmdDevice) => {
                if (
                  !rtmdDevice?.latest_log?.temperature &&
                  !rtmdDevice?.latest_log?.humidity
                ) {
                  return (
                    <div
                      key={rtmdDevice.id}
                      className={cx(
                        'ui-min-h-[104px] ui-mb-2 last:ui-mb-0 ui-text-neutral-500',
                        {
                          'ui-min-h-[60px]': !rtmdDevice?.latest_log,
                        }
                      )}
                    >
                      <NotDetectedCell
                        message={t(
                          'storageTemperatureMonitoringList:table.column.not_detected'
                        )}
                      />
                    </div>
                  )
                }

                return (
                  <div
                    key={rtmdDevice.id}
                    className="ui-min-h-[104px] ui-mb-2 last:ui-mb-0"
                  >
                    {isVendorIot && (
                      <div className="ui-text-dark-blue ui-mb-1">
                        <strong>
                          {rtmdDevice?.serial_number}
                          {handleOtherValue(
                            rtmdDevice?.asset_model?.name,
                            rtmdDevice?.other_asset_model_name
                          )}{' '}
                          {handleOtherValue(
                            rtmdDevice?.manufacture?.name,
                            rtmdDevice?.other_manufacture_name,
                            'manufacturer'
                          )}
                        </strong>
                      </div>
                    )}
                    <TemperatureCell
                      log={rtmdDevice.latest_log}
                      threshold={activeThreshold}
                      isWarehouse={isWarehouse}
                      description={rtmdDevice?.description}
                      humidityThreshold={activeHumidityThreshold}
                    />
                  </div>
                )
              }) ?? '-'}
            </div>
          )
        },
      },
      {
        header: t(
          'storageTemperatureMonitoringList:table.column.device_status'
        ),
        accessorKey: 'device_status',
        size: 150,
        minSize: 150,
        cell: ({ row }) => {
          if (row?.original?.rtmd_devices?.length === 0) {
            return (
              <div className="ui-min-h-[60px] ui-text-neutral-500 ui-content-start">
                <NotDetectedCell
                  message={t(
                    'storageTemperatureMonitoringList:table.column.not_detected'
                  )}
                />
              </div>
            )
          } else {
            return (
              <div>
                {row.original?.rtmd_devices?.map((rtmdDevice) => {
                  return (
                    <div
                      key={rtmdDevice.id}
                      className={cx('ui-min-h-[104px] ui-mb-2 last:ui-mb-0', {
                        'ui-min-h-[60px]':
                          !rtmdDevice?.latest_log?.temperature &&
                          !rtmdDevice?.latest_log?.humidity,
                      })}
                    >
                      <ConnectionAndPowerCell
                        log={{
                          device_status: rtmdDevice.latest_log?.device_status,
                          battery: rtmdDevice.latest_log?.battery,
                          signal: rtmdDevice.latest_log?.signal,
                          is_power_connected:
                            rtmdDevice.latest_log?.is_power_connected,
                        }}
                        isWarehouse={isWarehouse}
                      />
                    </div>
                  )
                }) ?? '-'}
              </div>
            )
          }
        },
      },
      {
        header: t('common:action'),
        accessorKey: 'action',
        size: 30,
        minSize: 30,
        cell: ({ row }) => {
          const item = row?.original

          return (
            <div className="ui-flex ui-gap-2 -ml-3">
              <Button
                asChild
                id="btn-link-asset-vendor-detail"
                size="sm"
                variant="subtle"
              >
                <Link href={`${currentPathname}/${item.id}`}>Detail</Link>
              </Button>
            </div>
          )
        },
        meta: {
          cellClassName: 'ui-content-start',
        },
      },
    ],
    [
      t,
      listFilter,
      storageTemperatureMonitoringList?.response?.data,
      currentPathname,
    ]
  )

  return {
    data: storageTemperatureMonitoringList.response?.data || [],
    isLoading: storageTemperatureMonitoringList.isLoading,
    columns,
    totalPages: storageTemperatureMonitoringList.response?.total_page || 0,
    totalItem: storageTemperatureMonitoringList.response?.total_item || 0,
    pagination: {
      ...listFilter.pagination,
    },
    sorting: listFilter.sorting,
    setSorting: listFilter.setSorting,
  }
}
