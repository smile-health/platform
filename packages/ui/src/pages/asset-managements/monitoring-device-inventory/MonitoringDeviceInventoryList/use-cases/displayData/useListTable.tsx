import { useMemo } from 'react'
import Link from 'next/link'
import { ColumnDef } from '@tanstack/react-table'
import { Button } from '#components/button'
import useSmileRouter from '#hooks/useSmileRouter'
import MonitoringDeviceInventoryTitleBlock from '#pages/asset-managements/components/MonitoringDeviceInventoryTitleBlock'
import { hasPermission } from '#shared/permission/index'
import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'

import { OperationalStatusBadge } from '../../../components/OperationalStatusBadge'
import { MonitoringDeviceInventoryListItem } from '../../monitoring-device-inventory-list.type'
import { useMonitoringDeviceInventoryList } from '../../MonitoringDeviceInventoryListContext'
import { useListFilter } from '../filter/useListFilter'

export const useListTable = () => {
  const { t, i18n } = useTranslation(['common', 'monitoringDeviceInventory'])
  const smileRouter = useSmileRouter()

  const monitoringDeviceInventoryList = useMonitoringDeviceInventoryList()
  const listFilter = useListFilter()

  const currentPathname = smileRouter.pathname.replace('[lang]', i18n.language)

  const columns: ColumnDef<MonitoringDeviceInventoryListItem>[] = useMemo(
    () => [
      {
        header: t('monitoringDeviceInventory:table.column.no'),
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
        header: t('monitoringDeviceInventory:table.column.asset_name'),
        accessorKey: 'asset_name',
        id: 'serial_number',
        enableSorting: true,
        size: 300,
        minSize: 300,
        meta: {
          cellClassName: 'ui-content-start',
        },
        cell: ({
          row: {
            original: {
              serial_number,
              asset_model,
              manufacturer,
              entity,
              other_asset_model_name,
              other_manufacture_name,
            },
          },
        }) => {
          const assetModelName = asset_model?.name
            ? ` - ${asset_model?.name}`
            : `- ${other_asset_model_name ?? ''}`
          const manufactureName = manufacturer?.name
            ? ` (${manufacturer?.name ?? ''})`
            : ` (${other_manufacture_name ?? ''})`
          const provinceRegency = [
            entity?.regency_name ?? undefined,
            entity?.province_name ?? undefined,
          ].filter((item) => item !== undefined)

          return (
            <MonitoringDeviceInventoryTitleBlock
              arrText={[
                {
                  label: (
                    <p>
                      <span className="ui-font-bold ui-text-dark-blue">
                        {serial_number}
                      </span>
                      {assetModelName}
                      <span>{manufactureName}</span>
                    </p>
                  ),
                  className: 'ui-text-sm ui-font-normal ui-text-dark-blue',
                },
                {
                  label: entity?.name ?? '',
                  className:
                    'ui-text-sm ui-font-normal ui-text-dark-blue ui-my-1',
                },
                {
                  label:
                    provinceRegency.length > 1
                      ? provinceRegency.join(', ')
                      : provinceRegency[0],
                  className: 'ui-text-xs ui-font-thin ui-text-gray-700',
                },
              ]}
            />
          )
        },
      },
      {
        header: t('monitoringDeviceInventory:table.column.operational_status'),
        accessorKey: 'operational_status',
        id: 'rtmd_status_name',
        enableSorting: true,
        size: 80,
        minSize: 80,
        cell: ({ row }) => {
          const item = row?.original

          return (
            <OperationalStatusBadge
              statusId={item?.rtmd_status?.id}
              statusName={item?.rtmd_status?.name}
            />
          )
        },
        meta: {
          cellClassName: 'ui-content-start',
        },
      },
      {
        header: t('monitoringDeviceInventory:table.column.device_status'),
        accessorKey: 'device_status',
        id: 'status',
        enableSorting: true,
        size: 80,
        minSize: 80,
        cell: ({ row }) => row.original?.device_status?.name ?? '-',
        meta: {
          cellClassName: 'ui-content-start',
        },
      },

      {
        header: t('monitoringDeviceInventory:table.column.updated_by'),
        accessorKey: 'updated_by',
        id: 'updated_at',
        enableSorting: true,
        size: 150,
        minSize: 100,
        cell: ({ row }) => {
          const item = row?.original
          return (
            <div className="ui-text-sm ui-mb-1">
              <div className="ui-text-dark-blue ui-font-semibold">
                {item?.updated_by?.name ?? '-'}
              </div>
              <div className="ui-text-neutral-500">
                {item?.updated_at
                  ? dayjs(item?.updated_at).format('DD MMM YYYY HH:mm')
                  : '-'}
              </div>
            </div>
          )
        },
        meta: {
          cellClassName: 'ui-content-start',
        },
      },
      {
        header: t('monitoringDeviceInventory:table.column.action'),
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
              {hasPermission('monitoring-device-inventory-global-mutate') && (
                <Button
                  asChild
                  id="btn-link-asset-vendor-edit"
                  size="sm"
                  variant="subtle"
                >
                  <Link href={`${currentPathname}/${item.id}/edit`}>
                    {t('common:edit')}
                  </Link>
                </Button>
              )}
            </div>
          )
        },
        meta: {
          cellClassName: 'ui-content-start',
        },
      },
    ],
    [t, listFilter]
  )

  return {
    data: monitoringDeviceInventoryList.response?.data || [],
    isLoading: monitoringDeviceInventoryList.isLoading,
    columns,
    totalPages: monitoringDeviceInventoryList.response?.total_page || 0,
    totalItem: monitoringDeviceInventoryList.response?.total_item || 0,
    pagination: {
      ...listFilter.pagination,
    },
    sorting: listFilter.sorting,
    setSorting: listFilter.setSorting,
  }
}
