import { ColumnDef } from '@tanstack/react-table'
import { numberFormatter } from '#utils/formatter'
import { TFunction } from 'i18next'

import { TAsikItem } from './dashboard-asik.type'

export const getMaterialType = (t: TFunction<'dashboardAsik'>) => {
  return {
    label: t('data.vaccine'),
    value: 2,
  }
}

export enum DashboardAsikTabType {
  Vendor = '1',
  Customer = '2',
}

export function getDashboardAsikTabs(t: TFunction<'dashboardAsik'>) {
  return [
    {
      id: DashboardAsikTabType.Vendor,
      label: t('title.tabs.vendor'),
    },
    {
      id: DashboardAsikTabType.Customer,
      label: t('title.tabs.customer'),
    },
  ]
}

export function getDashboardAsikColumns(
  t: TFunction<'dashboardAsik'>,
  page: number,
  paginate: number,
  language = 'en'
) {
  const formatNumber = (value: number | string) => {
    return typeof value === 'number' ? numberFormatter(value, language) : value
  }

  const schema: Array<ColumnDef<TAsikItem>> = [
    {
      header: 'No.',
      accessorKey: 'number',
      size: 20,
      maxSize: 20,
      cell: ({ row }) => (page - 1) * paginate + (row?.index + 1),
    },
    {
      header: t('column.region'),
      accessorKey: 'label',
      size: 100,
      maxSize: 100,
    },
    {
      header: t('column.dose'),
      accessorKey: 'total_consumed',
      size: 100,
      maxSize: 100,
      cell: ({ getValue }) => formatNumber(getValue<number>()),
      meta: {
        headerClassName: 'ui-text-center',
        cellClassName: 'ui-text-center',
      },
    },
    {
      header: t('column.coverage'),
      accessorKey: 'total_pcare',
      size: 100,
      maxSize: 100,
      cell: ({ getValue }) => formatNumber(getValue<number>()),
      meta: {
        headerClassName: 'ui-text-center',
        cellClassName: 'ui-text-center',
      },
    },
    {
      header: t('column.dose_vial'),
      accessorKey: 'consumption_unit_per_distribution_unit',
      size: 100,
      maxSize: 100,
      cell: ({ getValue }) => formatNumber(getValue<number>()),
      meta: {
        headerClassName: 'ui-text-center',
        cellClassName: 'ui-text-center',
      },
    },
    {
      header: 'Vial',
      accessorKey: 'vial',
      size: 100,
      maxSize: 100,
      meta: {
        headerClassName: 'ui-text-center',
        cellClassName: 'ui-text-center',
      },
    },
    {
      header: t('column.usage'),
      accessorKey: 'usage_index',
      size: 100,
      maxSize: 100,
      cell: ({ getValue }) => formatNumber(getValue<number>()),
      meta: {
        headerClassName: 'ui-text-center',
        cellClassName: 'ui-text-center',
      },
    },
    {
      header: t('column.target'),
      accessorKey: 'target_qty',
      size: 100,
      maxSize: 100,
      cell: ({ getValue }) => formatNumber(getValue<number>()),
      meta: {
        headerClassName: 'ui-text-center',
        cellClassName: 'ui-text-center',
      },
    },
    {
      header: t('column.scope'),
      accessorKey: 'scope',
      size: 100,
      maxSize: 100,
      cell: ({ getValue }) => formatNumber(getValue<number>()),
      meta: {
        headerClassName: 'ui-text-center',
        cellClassName: 'ui-text-center',
      },
    },
  ]

  return schema
}
