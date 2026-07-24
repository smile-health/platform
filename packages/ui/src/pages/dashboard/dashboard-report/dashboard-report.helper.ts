import { ColumnDef } from '@tanstack/react-table'
import { getReactSelectValue } from '#utils/react-select'
import { TFunction } from 'i18next'

import { TDashboardReportFilter, TItem } from './dashboard-report.type'

export function handleFilter(filter: TDashboardReportFilter) {
  return {
    period: filter?.period,
    province_id: getReactSelectValue(filter?.province),
    regency_id: getReactSelectValue(filter?.regency),
    subdistrict_id: getReactSelectValue(filter?.subdistrict),
    activity_id: getReactSelectValue(filter?.activity),
    entity_id: getReactSelectValue(filter?.entity),
    from: filter?.date?.start?.toString(),
    to: filter?.date?.end?.toString(),
  }
}

export function handleTableColumns(
  t: TFunction<'dashboardReport'>,
  format: (number: number) => string
) {
  const schema: Array<ColumnDef<TItem>> = [
    {
      header: 'No.',
      accessorKey: 'number',
      size: 20,
      maxSize: 20,
      meta: {
        cellClassName: (row) => {
          return typeof row?.original?.number === 'string'
            ? 'ui-bg-slate-50'
            : ''
        },
      },
    },
    {
      header: t('column.vaccine'),
      accessorKey: 'name',
      meta: {
        cellClassName: (row) => {
          return typeof row?.original?.number === 'string'
            ? 'ui-bg-slate-50'
            : ''
        },
      },
    },
    {
      header: t('column.opening'),
      accessorKey: 'opening_qty',
      cell: ({ getValue }) => format(getValue<number>()),
      meta: {
        headerClassName: 'ui-text-center',
        cellClassName: (row) => {
          return typeof row?.original?.number === 'string'
            ? 'ui-bg-slate-50 ui-text-center'
            : 'ui-text-center'
        },
      },
    },
    {
      header: t('column.acceptance'),
      accessorKey: 'received_qty',
      cell: ({ getValue }) => format(getValue<number>()),
      meta: {
        headerClassName: 'ui-text-center',
        cellClassName: (row) => {
          return typeof row?.original?.number === 'string'
            ? 'ui-bg-slate-50 ui-text-center'
            : 'ui-text-center'
        },
      },
    },
    {
      header: t('column.stock'),
      accessorKey: 'opening_qty',
      cell: ({ row }) => {
        const item = row?.original
        return typeof item?.opening_qty === 'number' &&
          typeof item?.received_qty === 'number'
          ? format(item?.opening_qty + item?.received_qty)
          : ''
      },
      meta: {
        headerClassName: 'ui-text-center',
        cellClassName: (row) => {
          return typeof row?.original?.number === 'string'
            ? 'ui-bg-slate-50 ui-text-center'
            : 'ui-text-center'
        },
      },
    },
    {
      header: t('column.usage'),
      accessorKey: 'issues_qty',
      cell: ({ getValue }) => format(getValue<number>()),
      meta: {
        cellClassName: (row) => {
          return typeof row?.original?.number === 'string'
            ? 'ui-bg-slate-50 ui-text-center'
            : 'ui-text-center'
        },
      },
    },
    {
      header: t('column.disposal'),
      accessorKey: 'discard_qty',
      cell: ({ getValue }) => format(getValue<number>()),
      meta: {
        cellClassName: (row) => {
          return typeof row?.original?.number === 'string'
            ? 'ui-bg-slate-50 ui-text-center'
            : 'ui-text-center'
        },
      },
    },
    {
      header: t('column.closing'),
      accessorKey: 'closing_qty',
      cell: ({ getValue }) => format(getValue<number>()),
      meta: {
        headerClassName: 'ui-text-center',
        cellClassName: (row) => {
          return typeof row?.original?.number === 'string'
            ? 'ui-bg-slate-50 ui-text-center'
            : 'ui-text-center'
        },
      },
    },
    {
      header: t('column.total'),
      accessorKey: 'scope_total',
      meta: {
        headerClassName: 'ui-text-center',
        cellClassName: (row) => {
          return typeof row?.original?.number === 'string'
            ? 'ui-bg-slate-50'
            : ''
        },
      },
    },
    {
      header: t('column.vaccine_ip'),
      accessorKey: 'vaccine_ip',
      meta: {
        headerClassName: 'ui-text-center',
        cellClassName: (row) => {
          return typeof row?.original?.number === 'string'
            ? 'ui-bg-slate-50'
            : ''
        },
      },
    },
  ]

  return schema
}
