import React, { useEffect, useMemo, useState } from 'react'
import { PlusIcon } from '@heroicons/react/24/solid'
import { ColumnDef, Row } from '@tanstack/react-table'
import { Button } from '#components/button'
import { DataTable } from '#components/data-table'
import cx from '#lib/cx'
import { MetricIndicator } from '#pages/asset-managements/components/MetricIndicator'
import { formatDateWithoutTimezone, parseDateTime } from '#utils/date'
import { useTranslation } from 'react-i18next'

import { TAssetInventory } from '../../asset-inventory/list/libs/asset-inventory-list.types'
import { RELATION_TYPE } from '../asset-managements.constants'
import { TRelationType } from '../asset-managements.service'
import {
  TRelationData,
  TTemperatureThreshold,
} from '../asset-managements.types'
import { useLoggerRelation } from '../hooks/useLoggerRelation'
import { useLoggerRelationCreateEdit } from '../hooks/useLoggerRelationCreateEdit'
import {
  AssetType,
  MonitoringDeviceInventoryDetail,
} from '../monitoring-device-inventory/MonitoringDeviceInventoryDetail/monitoring-device-inventory.type'
import { StorageTemperatureMonitoringDetail } from '../storage-temperature-monitoring/StorageTemperatureMonitoringDetail/storage-temperature-monitoring-detail.type'
import AssetManagementsAddDeviceRelation from './AssetManagementsAddDeviceRelation'

type TemperatureCellProps = {
  threshold?: TTemperatureThreshold
  temperature: number
  updatedAt: string
  noUtcDate?: boolean
}

const TemperatureCell: React.FC<TemperatureCellProps> = ({
  temperature,
  threshold,
  updatedAt,
  noUtcDate = false,
}) => {
  const date = noUtcDate
    ? formatDateWithoutTimezone(
        updatedAt,
        'DD MMM YYYY HH:mm'
      ).toLocaleUpperCase()
    : parseDateTime(updatedAt, 'DD MMM YYYY HH:mm').toLocaleUpperCase()
  const metricData = useMemo(() => {
    return {
      value: temperature,
      threshold: {
        min_value: threshold?.min_temperature ?? 0,
        max_value: threshold?.max_temperature ?? 0,
      },
    }
  }, [temperature, threshold])

  return (
    <div className="ui-flex ui-flex-col">
      <MetricIndicator
        value={metricData?.value}
        threshold={metricData?.threshold}
      />
      <div className="ui-text-sm ui-text-gray-500">{date}</div>
    </div>
  )
}

type ActionCellProps = {
  id: number
  onDelete: (id: number) => void
  deleteButtonText: string
}

const ActionCell: React.FC<ActionCellProps> = ({
  id,
  onDelete,
  deleteButtonText,
}) => {
  return (
    <Button
      id={`delete-button-${id}`}
      size="sm"
      type="button"
      variant="subtle"
      color="danger"
      onClick={() => onDelete(id)}
    >
      {deleteButtonText}
    </Button>
  )
}

type AssetManagementsAddDeviceRelationProps = {
  type: TRelationType
  detailId: number
  title?: string
  detailData?:
    | TAssetInventory
    | MonitoringDeviceInventoryDetail
    | StorageTemperatureMonitoringDetail
  withAddButton?: boolean
  customColumns?: Array<ColumnDef<TRelationData>>
  withActionColumn?: boolean
  withOuterBorder?: boolean
  rtmdData?: TRelationData[]
  isWarehouse?: boolean
  setAssetType?: (assetType: AssetType | undefined) => void
  noUtcDate?: boolean
}

export const renderTemperatureCell = (
  temperature: number,
  updatedAt: string,
  threshold?: TTemperatureThreshold,
  noUtcDate?: boolean
) => (
  <TemperatureCell
    temperature={temperature}
    updatedAt={updatedAt}
    threshold={threshold}
    noUtcDate={noUtcDate}
  />
)

const renderActionCell = (
  id: number,
  onDelete: (id: number) => void,
  deleteButtonText: any
) => (
  <ActionCell id={id} onDelete={onDelete} deleteButtonText={deleteButtonText} />
)

const AssetManagementsDeviceRelation = ({
  type,
  title,
  detailId,
  detailData,
  withAddButton,
  customColumns,
  withActionColumn,
  withOuterBorder = true,
  rtmdData,
  isWarehouse,
  setAssetType,
  noUtcDate,
}: AssetManagementsAddDeviceRelationProps) => {
  const [showAddRelation, setShowAddRelation] = useState(false)
  const { t } = useTranslation(['common', 'assetInventory'])

  const { loggerData, isLoadingLogger, refetch } = useLoggerRelation({
    id: detailId ?? 0,
    type,
  })

  const { onRemoveLoggerRelation } = useLoggerRelationCreateEdit({
    detailData: detailData as TAssetInventory,
    isDelete: true,
    onHandleSuccess: refetch,
    loggerData: loggerData?.data || [],
    isWarehouse,
  })

  const activeThreshold = useMemo(() => {
    return (
      detailData?.asset_type?.temperature_thresholds?.find(
        (threshold) => threshold.is_active
      ) ??
      loggerData?.data?.[0]?.asset_type?.temperature_thresholds?.find(
        (threshold) => threshold.is_active
      )
    )
  }, [detailData, loggerData])

  const renderNameCell = ({ row }: { row: Row<TRelationData> }) => {
    const serialNumber = row.original?.serial_number
    const assetModelName = row.original?.asset_model?.name
      ? `- ${row.original?.asset_model?.name}`
      : ''
    const manufactureName = row?.original?.manufacture?.name
      ? `(${row.original?.manufacture?.name})`
      : ''
    return (
      <div>
        <p>
          <span className="ui-font-bold ui-text-dark-teal">{serialNumber}</span>{' '}
          {assetModelName} {manufactureName}
        </p>
      </div>
    )
  }

  const assetRelationColumns: Array<ColumnDef<TRelationData>> = useMemo(
    () => [
      {
        accessorKey: 'no',
        header: t('assetInventory:device_relation.table.no'),
        size: 30,
        minSize: 30,
        cell: ({ row }) => row.index + 1,
      },
      {
        accessorKey: 'name',
        header: t('assetInventory:device_relation.table.name'),
        size: 400,
        minSize: 200,
        cell: ({ row }) => renderNameCell({ row }),
      },
      ...(customColumns || []),
      ...(type !== RELATION_TYPE.STORAGE_TEMPERATURE_MONITORING
        ? ([
            {
              accessorKey: 'asset_temperature',
              header: t(
                'assetInventory:device_relation.table.asset_temperature'
              ),
              minSize: 200,
              size: 200,
              cell: ({ row }) =>
                renderTemperatureCell(
                  row.original?.latest_log?.temperature,
                  row.original?.latest_log?.actual_time,
                  activeThreshold,
                  noUtcDate
                ),
            },
          ] as Array<ColumnDef<TRelationData>>)
        : []),
      ...(withActionColumn
        ? ([
            {
              accessorKey: 'action',
              header: t('assetInventory:device_relation.table.action'),
              size: 150,
              minSize: 150,
              cell: ({ row }) =>
                renderActionCell(
                  row.original.id,
                  onRemoveLoggerRelation,
                  t(
                    'assetInventory:device_relation.button.remove_relation'
                  ) as unknown as string
                ),
            },
          ] as Array<ColumnDef<TRelationData>>)
        : []),
    ],
    [
      t,
      loggerData,
      isLoadingLogger,
      activeThreshold,
      customColumns,
      isWarehouse,
    ]
  )

  useEffect(() => {
    if (loggerData?.data?.length && setAssetType) {
      setAssetType(loggerData?.data?.[0]?.asset_type as AssetType)
    }
  }, [loggerData, setAssetType])
  return (
    <div
      className={cx({
        'ui-my-6 ui-border ui-border-gray-300 ui-rounded ui-p-4':
          withOuterBorder,
      })}
    >
      <div className="ui-grid ui-grid-cols-2 ui-gap-4 ui-mx-auto ui-mb-4">
        <div className=" ui-font-semibold ui-text-gray-900">
          {title ?? t('assetInventory:device_relation.title.table')}
        </div>
        {withAddButton && (
          <div className="flex justify-end">
            <Button
              size="sm"
              type="button"
              leftIcon={<PlusIcon className="ui-w-5" />}
              variant="solid"
              onClick={() => setShowAddRelation(true)}
            >
              {t('assetInventory:device_relation.button.add')}
            </Button>
          </div>
        )}
      </div>
      <div>
        <DataTable
          columns={assetRelationColumns}
          data={rtmdData ?? loggerData?.data ?? []}
          isLoading={isLoadingLogger}
        />
        <AssetManagementsAddDeviceRelation
          open={showAddRelation}
          detailData={detailData as TAssetInventory}
          loggerData={loggerData?.data ?? []}
          onClose={() => setShowAddRelation(false)}
          onHandleSuccess={refetch}
          isWarehouse={isWarehouse}
        />
      </div>
    </div>
  )
}

export default AssetManagementsDeviceRelation
