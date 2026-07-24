import { useCallback, useMemo } from 'react'
import { ColumnDef, Row } from '@tanstack/react-table'
import AssetManagementsDeviceRelation from '#pages/asset-managements/components/AssetManagementsDeviceRelationTable'
import { numberFormatter } from '#utils/formatter'
import { useTranslation } from 'react-i18next'

import { RELATION_TYPE } from '../../../../asset-managements.constants'
import { TRelationData } from '../../../../asset-managements.types'
import { useStorageTemperatureMonitoringDetail } from '../../StorageTemperatureMonitoringDetailContext'
import { ConnectionAndPowerCell } from './ConnectionAndPowerCell'
import { TemperatureCell } from './TemperatureCell'

export const RelationTable = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation(['storageTemperatureMonitoringDetail'])
  const { data, isWarehouse } = useStorageTemperatureMonitoringDetail()
  const relationData = data?.rtmd_devices ?? []

  const activeThreshold = useMemo(() => {
    return data?.asset_type?.temperature_thresholds?.find(
      (threshold) => threshold.is_active
    )
  }, [data])

  const humidityThreshold = useMemo(() => {
    return data?.asset_type?.humidity_thresholds?.[0]
  }, [data])

  const renderCell = useCallback(
    (
      row: Row<TRelationData>,
      type: 'asset_temperature' | 'connection_and_power'
    ) => {
      if (type === 'asset_temperature') {
        return (
          <TemperatureCell
            log={row.original?.latest_log}
            threshold={activeThreshold}
            humidityThreshold={humidityThreshold}
            isWarehouse={isWarehouse}
            isList={false}
          />
        )
      }
      if (type === 'connection_and_power') {
        return (
          <ConnectionAndPowerCell
            log={row.original?.latest_log}
            isWarehouse={isWarehouse}
          />
        )
      }
    },
    [activeThreshold, isWarehouse, humidityThreshold]
  )

  const customColumns: Array<ColumnDef<TRelationData>> = [
    ...(isWarehouse
      ? ([
          {
            accessorKey: 'description',
            header: t(
              'storageTemperatureMonitoringDetail:relation_table.columns.description.label'
            ),
            size: 200,
            minSize: 200,
            cell: ({ row }) => row.original?.description,
          },
        ] as Array<ColumnDef<TRelationData>>)
      : ([
          {
            accessorKey: 'sensor',
            header: t(
              'storageTemperatureMonitoringDetail:relation_table.columns.sensor.label'
            ),
            size: 100,
            minSize: 100,
            cell: ({ row }) =>
              numberFormatter(row.original?.sensor_qty, language),
          },
        ] as Array<ColumnDef<TRelationData>>)),
    {
      accessorKey: 'asset_temperature',
      header: isWarehouse
        ? t(
            'storageTemperatureMonitoringDetail:relation_table.columns.asset_temperature.label_warehouse'
          )
        : t(
            'storageTemperatureMonitoringDetail:relation_table.columns.asset_temperature.label'
          ),
      minSize: 200,
      size: 200,
      cell: ({ row }) => renderCell(row, 'asset_temperature'),
    },
    {
      accessorKey: 'connection_and_power',
      header: t(
        'storageTemperatureMonitoringDetail:relation_table.columns.connection_and_power.label'
      ),
      minSize: 200,
      size: 200,
      cell: ({ row }) => renderCell(row, 'connection_and_power'),
    },
  ]

  return (
    <AssetManagementsDeviceRelation
      title={
        isWarehouse
          ? t(
              'storageTemperatureMonitoringDetail:relation_table.title_warehouse'
            )
          : t('storageTemperatureMonitoringDetail:relation_table.title_cce')
      }
      type={RELATION_TYPE.STORAGE_TEMPERATURE_MONITORING}
      detailId={data?.id ?? 0}
      withOuterBorder={false}
      rtmdData={relationData}
      customColumns={customColumns}
      detailData={data}
      isWarehouse={isWarehouse}
    />
  )
}
