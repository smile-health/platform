import React, { useMemo } from 'react'
import { useParams, usePathname } from 'next/navigation'
import { CheckCircleIcon } from '@heroicons/react/24/outline'
import { ColumnDef, Row } from '@tanstack/react-table'
import { DataTable } from '#components/data-table'
import cx from '#lib/cx'
import { TCapacity } from '#services/asset-model'
import { HumidityThreshold, TemperatureThreshold } from '#services/asset-type'
import { numberFormatter } from '#utils/formatter'
import { useTranslation } from 'react-i18next'

const CheckIconCell: React.FC = () => (
  <CheckCircleIcon className="ui-text-green-500 ui-w-5 ui-h-5" />
)

const renderCheckIconCell = (isActive: boolean) => {
  const activeCell = isActive ? <CheckIconCell /> : null
  return activeCell
}

type AssetInventoryDetailThresholdTableProps = {
  data: TemperatureThreshold[] | TCapacity[] | HumidityThreshold[]
  tableHead: string[]
  type: 'temperature_threshold' | 'capacity' | 'humidity_threshold'
}

const AssetInventoryDetailThresholdTable: React.FC<
  AssetInventoryDetailThresholdTableProps
> = ({ data, tableHead, type }) => {
  const {
    t,
    i18n: { language },
  } = useTranslation(['common', 'assetInventory'])
  const params = useParams()
  const pathname = usePathname().split('/').pop()
  const isEditPage =
    (Boolean(params?.id) && pathname === 'edit') || pathname === 'create'

  const classRow = (item: TemperatureThreshold) => {
    const isActive = item?.is_active
    if (!isActive) {
      return 'ui-bg-neutral-100 ui-cursor-not-allowed'
    }
    return ''
  }

  const handleThresholdActiveStyling = (
    item: TemperatureThreshold,
    isActive: boolean
  ) => {
    return cx('ui-bg-white', { [classRow(item)]: isActive })
  }

  const columns: ColumnDef<TCapacity>[] = useMemo(() => {
    const isCapacity = type === 'capacity'
    const isHumidityThreshold = type === 'humidity_threshold'

    const isThresholdActive = !isEditPage && !isCapacity && !isHumidityThreshold
    const thresholdMetrics = isHumidityThreshold ? '%' : '°C'

    const metrics = isCapacity ? t('common:litre') : thresholdMetrics

    const handleRowValue = (row: Row<TCapacity>, key: 'min' | 'max') => {
      if (isHumidityThreshold) {
        return row?.original?.[`${key}_humidity`]
      }
      if (isCapacity) {
        return row?.original?.[`${key === 'min' ? 'net' : 'gross'}_capacity`]
      }
      return row?.original?.[`${key}_temperature`]
    }
    return [
      {
        accessorKey: tableHead?.[0] ?? '',
        header: tableHead?.[0] ?? '',
        meta: {
          cellClassName: ({ original }) =>
            handleThresholdActiveStyling(
              original as TemperatureThreshold,
              isThresholdActive
            ),
        },
        cell: ({ row }) => {
          const value = handleRowValue(row, 'min')
          return `${numberFormatter(value, language) ?? '-'} ${metrics}`
        },
      },
      {
        accessorKey: tableHead?.[1] ?? '',
        header: tableHead?.[1] ?? '',
        meta: {
          cellClassName: ({ original }) =>
            handleThresholdActiveStyling(
              original as TemperatureThreshold,
              isThresholdActive
            ),
        },
        cell: ({ row }) => {
          const value = handleRowValue(row, 'max')
          return `${numberFormatter(value, language) ?? '-'} ${metrics}`
        },
      },
      ...(isThresholdActive
        ? ([
            {
              accessorKey: ' ',
              header: ' ',
              meta: {
                cellClassName: ({ original }) =>
                  handleThresholdActiveStyling(
                    original as TemperatureThreshold,
                    isThresholdActive
                  ),
              },
              cell: ({ row }) => {
                return renderCheckIconCell(
                  Boolean(row?.original?.is_active ?? 0)
                )
              },
            },
          ] as ColumnDef<TCapacity>[])
        : []),
    ]
  }, [type])

  return (
    <div
      className={cx('ui-border-none ui-rounded-sm ui-border ui-bg-white', {
        'ui-table !ui-w-full': isEditPage,
      })}
    >
      <div className="ui-bg-gray-100 ui-table-header-group">
        <DataTable columns={columns} data={data} />
      </div>
    </div>
  )
}

export default AssetInventoryDetailThresholdTable
