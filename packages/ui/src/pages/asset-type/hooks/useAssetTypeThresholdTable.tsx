import { useMemo } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '#components/data-table'
import { BOOLEAN } from '#constants/common'
import { numberFormatter } from '#utils/formatter'
import { useTranslation } from 'react-i18next'

import {
  AssetTypeTemperatureThresholds,
  DetailAssetTypeResponse,
} from '../asset-type.type'

const useAssetTypeThresholdTable = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation(['assetType', 'common'])

  const temperatureSchema: ColumnDef<AssetTypeTemperatureThresholds>[] =
    useMemo(
      () => [
        {
          header: t('form.detail.temperature_threshold.column.min_temperature'),
          accessorKey: 'min_temperature',
          size: 150,
          minSize: 150,
          cell: ({ row }: any) => {
            return `${numberFormatter(row.original.min_temperature, language)} °C`
          },
        },
        {
          header: t('form.detail.temperature_threshold.column.max_temperature'),
          accessorKey: 'max_temperature',
          size: 150,
          minSize: 150,
          cell: ({ row }: any) => {
            return `${numberFormatter(row.original.max_temperature, language)} °C`
          },
        },
      ],
      []
    )

  const humiditySchema: ColumnDef<{
    min_humidity: number
    max_humidity: number
  }>[] = useMemo(
    () => [
      {
        header: t('form.detail.label.humidity_threshold.min_humidity'),
        accessorKey: 'min_humidity',
        size: 150,
        minSize: 150,
        cell: ({ row }: any) => {
          return `${numberFormatter(row.original.min_humidity, language)} %`
        },
      },
      {
        header: t('form.detail.label.humidity_threshold.max_humidity'),
        accessorKey: 'max_humidity',
        size: 150,
        minSize: 150,
        cell: ({ row }: any) => {
          return `${numberFormatter(row.original.max_humidity, language)} %`
        },
      },
    ],
    []
  )

  const generateAssetUtilization = (detail?: DetailAssetTypeResponse) => {
    const hasTemperatureTreshold = detail?.temperature_thresholds?.length ?? 0
    const hasHumidityTreshold = detail?.humidity_thresholds?.length ?? 0

    const isWarehouse = detail?.is_warehouse === BOOLEAN.TRUE
    return [
      {
        label: t('form.detail.label.is_cce_equipment'),
        value:
          detail?.is_cce === BOOLEAN.TRUE ? t('common:yes') : t('common:no'),
      },
      {
        label: t('form.detail.label.is_warehouse'),
        value:
          detail?.is_warehouse === BOOLEAN.TRUE
            ? t('common:yes')
            : t('common:no'),
      },
      {
        label: t('form.detail.label.is_adjustable'),
        value:
          detail?.is_temperature_adjustable === BOOLEAN.TRUE
            ? t('common:yes')
            : t('common:no'),
      },
      {
        label: t('form.detail.label.temperature_threshold'),
        value: hasTemperatureTreshold ? (
          <div className="ui-grid ui-grid-cols-2">
            <DataTable
              columns={temperatureSchema}
              data={detail?.temperature_thresholds}
            />
          </div>
        ) : (
          '-'
        ),
      },
      ...(isWarehouse
        ? [
            {
              label: t('form.detail.label.humidity_threshold.label'),
              value: hasHumidityTreshold ? (
                <div className="ui-grid ui-grid-cols-2">
                  <DataTable
                    columns={humiditySchema}
                    data={detail?.humidity_thresholds}
                  />
                </div>
              ) : (
                '-'
              ),
            },
          ]
        : []),
    ]
  }

  return { temperatureSchema, humiditySchema, generateAssetUtilization }
}

export default useAssetTypeThresholdTable
