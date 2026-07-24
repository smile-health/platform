import { ColumnDef } from '@tanstack/react-table'
import { parseDateTime } from '#utils/date'
import { TFunction } from 'i18next'

import DashboardProvinceChart from '../components/DashboardProvinceChart'
import DashboardRegencyChart from '../components/DashboardRegencyChart'
import { TDashboardTabs, TEntity } from '../dashboard.type'
import { TMaterialEntity, TStockEntity } from './dashboard-stock.type'
import DashboardStockEntityTable from './sections/DashboardStockEntityTable'

export enum ChartColor {
  Yellow = '#EAB308',
  Green = '#22C55E',
}

export enum InformationType {
  Remaining_Stock = '1',
  In_Transit_Stock = '0',
}

export const informationTypeList = (t: TFunction<'dashboardStock'>) => [
  {
    id: 'radio-information-remaining',
    label: t('data.information_type.remaining_stock'),
    value: InformationType.Remaining_Stock,
  },
  {
    id: 'radio-information-transit',
    label: t('data.information_type.in_transit_stock'),
    value: InformationType.In_Transit_Stock,
  },
]

export enum StockChartType {
  Province = 'province',
  Regency = 'regency',
  Entity = 'entity',
  Material_Entity = 'material-entity',
  Stock_Entity = 'stock-entity',
}

export const stockChartTabs = (
  t: TFunction<'dashboardStock'>
): Array<TDashboardTabs<StockChartType>> => [
  {
    id: StockChartType.Province,
    label: t('title.province'),
  },
  {
    id: StockChartType.Regency,
    label: t('title.regency'),
  },
  {
    id: StockChartType.Entity,
    label: t('title.entity.main'),
  },
  {
    id: StockChartType.Material_Entity,
    label: t('title.entity.material'),
  },
  {
    id: StockChartType.Stock_Entity,
    label: t('title.entity.stock'),
  },
]

export const tableEntityColumns = (
  t: TFunction<'dashboardStock'>,
  page: number,
  paginate: number,
  formatNumber: (value?: number) => string,
  isInTransit?: boolean
) => {
  const schema: Array<ColumnDef<TEntity>> = [
    {
      header: 'No.',
      accessorKey: 'no',
      size: 20,
      maxSize: 20,
      cell: ({ row }) => (page - 1) * paginate + (row?.index + 1),
    },
    {
      header: t('column.province'),
      accessorKey: 'province.name',
      size: 100,
      minSize: 100,
    },
    {
      header: t('column.regency'),
      accessorKey: 'regency.name',
      size: 100,
      minSize: 100,
    },
    {
      header: t('column.entity.name'),
      accessorKey: 'entity.name',
      size: 100,
      minSize: 100,
    },
    {
      header: isInTransit
        ? t('column.stock.in_transit')
        : t('column.stock.remaining'),

      accessorKey: 'value',
      size: 100,
      minSize: 100,
      cell: ({ getValue }) => {
        const value = getValue<number>()
        return formatNumber(value)
      },
    },
  ]

  return schema
}

export const tableMaterialEntityColumns = (
  t: TFunction<'dashboardStock'>,
  page: number,
  paginate: number,
  formatNumber: (value?: number) => string,
  isInTransit?: boolean
) => {
  const schema: Array<ColumnDef<TMaterialEntity>> = [
    {
      header: 'No.',
      accessorKey: 'no',
      size: 20,
      maxSize: 100,
      cell: ({ row }) => (page - 1) * paginate + (row?.index + 1),
    },
    {
      header: t('column.province'),
      accessorKey: 'province.name',
      size: 100,
      minSize: 100,
    },
    {
      header: t('column.regency'),
      accessorKey: 'regency.name',
      size: 100,
      minSize: 100,
    },
    {
      header: t('column.entity.name'),
      accessorKey: 'entity.name',
      size: 100,
      minSize: 100,
    },
    {
      header: t('column.material'),
      accessorKey: 'material.name',
      size: 100,
      minSize: 100,
    },
    {
      header: t('column.unit'),
      accessorKey: 'unit',
      size: 100,
      minSize: 100,
    },
    {
      header: isInTransit
        ? t('column.stock.in_transit')
        : t('column.stock.remaining'),

      accessorKey: 'total_stock_available',
      size: 100,
      minSize: 100,
      cell: ({ getValue }) => {
        const value = getValue<number>()
        return formatNumber(value)
      },
    },
    {
      header: t('column.stock.min'),
      accessorKey: 'stock_min',
      size: 100,
      minSize: 100,
      cell: ({ getValue }) => {
        const value = getValue<number>()
        return formatNumber(value)
      },
    },
    {
      header: t('column.stock.max'),
      accessorKey: 'stock_max',
      size: 100,
      minSize: 100,
      cell: ({ getValue }) => {
        const value = getValue<number>()
        return formatNumber(value)
      },
    },
  ]

  return schema
}

export const tableStockEntityColumns = (
  t: TFunction<'dashboardStock'>,
  page: number,
  paginate: number,
  formatNumber: (value?: number) => string,
  isInTransit?: boolean
) => {
  const schema: Array<ColumnDef<TStockEntity>> = [
    {
      header: 'No.',
      accessorKey: 'no',
      size: 20,
      maxSize: 100,
      cell: ({ row }) => (page - 1) * paginate + (row?.index + 1),
    },
    {
      header: t('column.province'),
      accessorKey: 'province.name',
      size: 100,
      minSize: 100,
    },
    {
      header: t('column.regency'),
      accessorKey: 'regency.name',
      size: 100,
      minSize: 100,
    },
    {
      header: t('column.entity.name'),
      accessorKey: 'entity.name',
      size: 100,
      minSize: 100,
    },
    {
      header: t('column.entity.tag'),
      accessorKey: 'entityTag.name',
      size: 100,
      minSize: 100,
    },
    {
      header: t('column.activity'),
      accessorKey: 'activity.name',
      size: 100,
      minSize: 100,
    },
    {
      header: 'KFA Level',
      accessorKey: 'kfaLevel.label',
      size: 100,
      minSize: 100,
    },
    {
      header: t('column.material'),
      accessorKey: 'material.name',
      size: 100,
      minSize: 100,
    },
    {
      header: t('column.batch.code'),
      accessorKey: 'batches.code',
      size: 100,
      minSize: 100,
    },
    {
      header: t('column.batch.expired'),
      accessorKey: 'batches.date',
      size: 100,
      minSize: 100,
      cell: ({ getValue }) => {
        const value = getValue<string>()
        return parseDateTime(value, 'DD/MM/YYYY')
      },
    },
    {
      header: isInTransit
        ? t('column.stock.in_transit')
        : t('column.stock.remaining'),
      accessorKey: 'value',
      size: 100,
      minSize: 100,
      cell: ({ getValue }) => {
        const value = getValue<number>()
        return formatNumber(value)
      },
    },
  ]

  return schema
}

export const stockDataElementTab = (
  t: TFunction<'dashboardStock'>,
  isInTransit?: boolean,
  materialLevel?: string
) => {
  const stockDescriptionKey = isInTransit
    ? 'description.stock.in_transit'
    : 'description.stock.remaining'

  const materialLevelLabel = materialLevel
    ? ` | Level KFA Material: ${materialLevel}`
    : ''
  const titleProvince = t('title.province')
  const titleRegency = t('title.regency')
  const titleEntity = t('title.entity.main')
  const titleEntityMaterial = t('title.entity.material')
  const titleStockMaterial = t('title.entity.stock')

  return {
    [StockChartType.Province]: {
      title: titleProvince,
      subtitle:
        t(stockDescriptionKey, { title: titleProvince?.toLowerCase() }) +
        materialLevelLabel,
      exportFileName: 'Dashboard Stock - By Province',
    },
    [StockChartType.Regency]: {
      title: titleRegency,
      subtitle:
        t(stockDescriptionKey, { title: titleRegency?.toLowerCase() }) +
        materialLevelLabel,
      exportFileName: 'Dashboard Stock - By City',
    },
    [StockChartType.Entity]: {
      title: titleEntity,
      subtitle:
        t(stockDescriptionKey, { title: titleEntity?.toLowerCase() }) +
        materialLevelLabel,
      exportFileName: '',
    },
    [StockChartType.Material_Entity]: {
      title: titleEntityMaterial,
      subtitle:
        t(stockDescriptionKey, { title: titleEntityMaterial?.toLowerCase() }) +
        materialLevelLabel,
      exportFileName: '',
    },
    [StockChartType.Stock_Entity]: {
      title: titleStockMaterial,
      subtitle:
        t(stockDescriptionKey, { title: titleStockMaterial?.toLowerCase() }) +
        materialLevelLabel,
      exportFileName: '',
    },
  }
}

export const STOCK_TAB_CONTENT = {
  [StockChartType.Province]: DashboardProvinceChart,
  [StockChartType.Regency]: DashboardRegencyChart,
  [StockChartType.Entity]: DashboardStockEntityTable,
  [StockChartType.Material_Entity]: DashboardStockEntityTable,
  [StockChartType.Stock_Entity]: DashboardStockEntityTable,
}
