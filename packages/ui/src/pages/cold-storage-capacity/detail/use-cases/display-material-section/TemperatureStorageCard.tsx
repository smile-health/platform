'use client'

import { useMemo } from 'react'
import { InformationCircleIcon } from '@heroicons/react/24/outline'
import { CellContext, ColumnDef } from '@tanstack/react-table'
import { DataTable } from '#components/data-table'
import { RenderDetailValue } from '#components/modules/RenderDetailValue'
import {
  TooltipContent,
  TooltipRoot,
  TooltipTrigger,
} from '#components/tooltip'
import { numberFormatter } from '#utils/formatter'
import { TFunction } from 'i18next'
import { useTranslation } from 'react-i18next'

import { getCapacityColor } from '../../../cold-storage-capacity.utils'
import {
  TColdstorageMaterial,
  TemperatureStorage,
} from '../../cold-storage-capacity-detail.type'

type TemperatureStorageCardProps = Readonly<{
  data: TemperatureStorage
}>

function MaterialCell({
  row,
  t,
}: {
  row: CellContext<TColdstorageMaterial, unknown>['row']
  t: TFunction<['common', 'coldStorageCapacity']>
}) {
  const material = row.original.material?.name
  const hasInfo =
    row.original.material?.manufacture_material_volumes?.length > 1

  return (
    <div className="ui-flex ui-items-center ui-gap-1">
      {material}
      {hasInfo && (
        <TooltipRoot delayDuration={100}>
          <TooltipTrigger>
            <InformationCircleIcon className="ui-size-4 ui-text-gray-400" />
          </TooltipTrigger>
          <TooltipContent
            color="dark"
            side="right"
            className="ui-max-w-[350px]"
          >
            {t('coldStorageCapacity:detail.temperatureStorage.table.tooltip')}
          </TooltipContent>
        </TooltipRoot>
      )}
    </div>
  )
}

export default function TemperatureStorageCard({
  data,
}: TemperatureStorageCardProps) {
  const {
    t,
    i18n: { language },
  } = useTranslation(['common', 'coldStorageCapacity'])

  const columns: ColumnDef<TColdstorageMaterial>[] = useMemo(
    () => [
      {
        header: t('coldStorageCapacity:detail.temperatureStorage.table.no'),
        accessorKey: 'id',
        minSize: 100,
        size: 100,
        cell: ({ row }) => row.index + 1,
        meta: {
          cellClassName: 'ui-text-left',
        },
      },
      {
        header: t(
          'coldStorageCapacity:detail.temperatureStorage.table.material'
        ),
        size: 250,
        minSize: 250,
        accessorKey: 'name',
        cell: ({ row }) => {
          const material = row.original.material
          const hasInfo = material.name.includes('@')
          return (
            <div className="ui-flex ui-items-center ui-gap-1">
              {material?.name}
              {hasInfo && (
                <TooltipRoot delayDuration={100}>
                  <TooltipTrigger>
                    <InformationCircleIcon className="ui-size-4 ui-text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent
                    color="dark"
                    side="right"
                    className="ui-max-w-[350px]"
                  >
                    {t(
                      'coldStorageCapacity:detail.temperatureStorage.table.tooltip'
                    )}
                  </TooltipContent>
                </TooltipRoot>
              )}
            </div>
          )
        },
      },
      {
        header: t(
          'coldStorageCapacity:detail.temperatureStorage.table.stockDose'
        ),
        cell: ({ row }) => {
          const stockDose = row.original.dosage_stock
          return <div>{numberFormatter(stockDose, language)}</div>
        },
        minSize: 100,
        size: 100,
      },
      {
        header: t(
          'coldStorageCapacity:detail.temperatureStorage.table.stockVial'
        ),
        cell: ({ row }) => {
          const stockVial = row.original.vial_stock
          return <div>{numberFormatter(stockVial, language)}</div>
        },
        minSize: 100,
        size: 100,
      },
      {
        header: t(
          'coldStorageCapacity:detail.temperatureStorage.table.stockBox'
        ),
        cell: ({ row }) => {
          const stockBox = row.original.package_stock
          return <div>{numberFormatter(stockBox, language)}</div>
        },
        minSize: 100,
        size: 100,
      },
      {
        header: t(
          'coldStorageCapacity:detail.temperatureStorage.table.stockVolume'
        ),
        cell: ({ row }) => {
          const stockVolume = row.original.package_volume
          return <div>{numberFormatter(stockVolume, language)}</div>
        },
        minSize: 120,
        size: 120,
      },
      {
        header: t(
          'coldStorageCapacity:detail.temperatureStorage.table.maxFillBox'
        ),
        cell: ({ row }) => {
          const maxFillBox = row.original.max_dosage
          return <div>{numberFormatter(maxFillBox, language)}</div>
        },
        minSize: 350,
        size: 350,
      },
      {
        header: t(
          'coldStorageCapacity:detail.temperatureStorage.table.maxDose'
        ),
        cell: ({ row }) => {
          const maxDose = row.original.dosage_stock
          return <div>{numberFormatter(maxDose, language)}</div>
        },
        minSize: 100,
        size: 100,
      },
      {
        header: t(
          'coldStorageCapacity:detail.temperatureStorage.table.orderRecommendation'
        ),
        cell: ({ row }) => {
          const orderRecommendation = row.original.recommend_order_base_on_max
          return <div>{numberFormatter(orderRecommendation, language)}</div>
        },
        minSize: 180,
        size: 180,
      },
      {
        header: t(
          'coldStorageCapacity:detail.temperatureStorage.table.stockQuantityProjection'
        ),
        cell: ({ row }) => {
          const stockQuantityProjection = row.original.package_stock
          return <div>{numberFormatter(stockQuantityProjection, language)}</div>
        },
        minSize: 150,
        size: 150,
      },
    ],
    [t]
  )

  return (
    <div className="ui-rounded ui-border ui-border-gray-200 ui-overflow-hidden space-y-6 py-6">
      <div className="ui-px-6">
        <h4 className="ui-font-semibold ui-text-primary-700">
          {t('coldStorageCapacity:detail.temperatureStorage.temperature')}{' '}
          {data.temperature_range.min_temp}°C{' '}
          <span className="ui-lowercase">{t('common:to')}</span>{' '}
          {data.temperature_range.max_temp}°C
        </h4>
      </div>

      <div className="ui-bg-white ui-px-6 ui-space-y-2">
        {data.assets.map((asset, index) => (
          <RenderDetailValue
            key={asset.id}
            data={[
              {
                label:
                  index === 0
                    ? t(
                        'coldStorageCapacity:detail.temperatureStorage.assetName'
                      )
                    : '',
                value: (
                  <div>
                    <div className="ui-font-semibold ui-text-primary-700">
                      {asset.name}
                    </div>
                    {asset.items.map((item) => (
                      <div
                        key={item.id}
                        className="ui-text-sm ui-text-gray-600"
                      >
                        {item.serial_number} - {item.asset_model.name} (
                        {item.manufacture.name}) {item.capacity_nett}{' '}
                        {t('common:litre')}
                      </div>
                    ))}
                  </div>
                ),
              },
            ]}
            separator={index === 0 ? ':' : ''}
            skipEmptyValue={false}
          />
        ))}
      </div>

      <hr className="ui-border-gray-200" />

      <div className="ui-border-gray-200 ui-px-6 space-y-6">
        <h5 className="ui-font-semibold ui-text-primary-700">
          {t('coldStorageCapacity:detail.temperatureStorage.capacity')}
        </h5>
        <RenderDetailValue
          data={[
            {
              label: t(
                'coldStorageCapacity:detail.temperatureStorage.totalVolumeStock'
              ),
              value: data.capacity.total_volume_stock,
            },
            {
              label: t(
                'coldStorageCapacity:detail.temperatureStorage.assetNetoCapacity'
              ),
              value: data.capacity.asset_neto_capacity,
            },
            {
              label: t(
                'coldStorageCapacity:detail.temperatureStorage.usedPercentage'
              ),
              value: `${data.capacity.used_percentage}%`,
              valueClassName: getCapacityColor(data.capacity.used_percentage),
            },
          ]}
          skipEmptyValue={false}
        />
        <div className="ui-bg-white">
          <DataTable
            columns={columns}
            data={data.coldstorage_materials}
            stickyColumns={[0, 1]}
          />
        </div>
      </div>
    </div>
  )
}
