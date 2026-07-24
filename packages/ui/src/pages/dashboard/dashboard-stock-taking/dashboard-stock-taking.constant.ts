import { ColumnDef } from '@tanstack/react-table'
import { TFunction } from 'i18next'

import { TCompliance, TResult } from './dashboard-stock-taking.type'

export enum StockTakingType {
  Entity = 'entity',
  Result = 'result',
  Material = 'material',
}

export function getStockTakingDashboardTabs(
  t: TFunction<'dashboardStockTaking'>
) {
  return [
    {
      id: StockTakingType.Entity,
      label: t('tab.entity'),
    },
    {
      id: StockTakingType.Result,
      label: t('tab.result'),
    },
    {
      id: StockTakingType.Material,
      label: t('tab.material'),
    },
  ]
}

export function getComplianceSummaryList(t: TFunction<'dashboardStockTaking'>) {
  return [
    {
      title: t('column.entity.not_yet'),
      valueKey: 'not_yet',
      percentageKey: 'not_yet_percentage',
      colorClass: 'ui-bg-red-600 ui-text-white',
    },
    {
      title: t('column.entity.done'),
      valueKey: 'done',
      percentageKey: 'done_percentage',
      colorClass: 'ui-bg-green-500 ui-text-white',
    },
    {
      title: t('column.entity.total'),
      valueKey: 'entity_total',
      colorClass: 'ui-bg-blue-900 ui-text-white',
    },
  ]
}

export function getResultSummaryList(t: TFunction<'dashboardStockTaking'>) {
  return [
    {
      title: t('column.result.stock.taking'),
      valueKey: 'stock',
      colorClass: 'ui-bg-green-500 ui-text-white',
    },
    {
      title: t('column.result.stock.expired'),
      valueKey: 'exp_stock',
      colorClass: 'ui-bg-red-600 ui-text-white',
    },
    {
      title: t('column.result.stock.in_transit'),
      valueKey: 'stock_in_transit',
      colorClass: 'ui-bg-yellow-500 ui-text-dark-blue',
    },
    {
      title: t('column.result.stock.real'),
      valueKey: 'real_stock',
      colorClass: 'ui-bg-sky-600 ui-text-white',
    },
    {
      title: t('column.result.difference'),
      valueKey: 'difference',
      percentageKey: 'difference_percentage',
      colorClass: 'ui-bg-orange-600 ui-text-white',
    },
  ]
}

export function getComplianceColumns(
  t: TFunction<'dashboardStockTaking'>,
  generateNumber: (index: number) => number,
  formatNumber: (value?: number) => string
) {
  const schema: Array<ColumnDef<TCompliance>> = [
    {
      header: 'No.',
      accessorKey: 'no',
      size: 20,
      maxSize: 20,
      cell: ({ row }) => generateNumber(row?.index),
    },
    {
      header: t('column.entity.main'),
      accessorKey: 'entity.name',
      size: 100,
      maxSize: 100,
    },
    {
      header: t('column.entity.not_yet'),
      accessorKey: 'not_yet',
      size: 100,
      maxSize: 100,
      cell: ({ getValue }) => formatNumber(getValue<number>()),
    },
    {
      header: t('column.entity.done'),
      accessorKey: 'done',
      size: 100,
      maxSize: 100,
      cell: ({ getValue }) => formatNumber(getValue<number>()),
    },
    {
      header: t('column.entity.total'),
      accessorKey: 'entity_total',
      size: 100,
      maxSize: 100,
      cell: ({ getValue }) => formatNumber(getValue<number>()),
    },
  ]

  return schema
}

export function getResultColumns(
  t: TFunction<'dashboardStockTaking'>,
  generateNumber: (index: number) => number,
  formatNumber: (value?: number) => string
) {
  const schema: Array<ColumnDef<TResult>> = [
    {
      header: 'No.',
      accessorKey: 'no',
      size: 20,
      maxSize: 20,
      cell: ({ row }) => generateNumber(row?.index),
    },
    {
      header: t('column.entity.main'),
      accessorKey: 'entity.name',
      size: 100,
      maxSize: 100,
    },
    {
      header: t('column.result.stock.taking'),
      accessorKey: 'stock',
      size: 100,
      maxSize: 100,
      cell: ({ getValue }) => formatNumber(getValue<number>()),
    },
    {
      header: t('column.result.stock.expired'),
      accessorKey: 'exp_stock',
      size: 100,
      maxSize: 100,
      cell: ({ getValue }) => formatNumber(getValue<number>()),
    },
    {
      header: t('column.result.stock.in_transit'),
      accessorKey: 'stock_in_transit',
      size: 100,
      maxSize: 100,
      cell: ({ getValue }) => formatNumber(getValue<number>()),
    },
    {
      header: t('column.result.stock.real'),
      accessorKey: 'real_stock',
      size: 100,
      maxSize: 100,
      cell: ({ getValue }) => formatNumber(getValue<number>()),
    },
    {
      header: t('column.result.difference'),
      accessorKey: 'difference',
      size: 100,
      maxSize: 100,
      cell: ({ getValue }) => formatNumber(getValue<number>()),
    },
  ]

  return schema
}
