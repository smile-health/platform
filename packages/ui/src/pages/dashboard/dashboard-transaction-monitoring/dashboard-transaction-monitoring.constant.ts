import { ColumnDef } from '@tanstack/react-table'
import { growthbook } from '#lib/growthbook'
import { parseDateTime } from '#utils/date'
import { TFunction } from 'i18next'

import DashboardProvinceChart from '../components/DashboardProvinceChart'
import DashboardRegencyChart from '../components/DashboardRegencyChart'
import { TDashboardTabs, TEntity } from '../dashboard.type'
import { TEntityComplete } from './dashboard-transaction-monitoring.type'
import DashboardTransactionMonitoringBigNumber from './sections/DashboardTransactionMonitoringBigNumber'
import DashboardTransactionMonitoringEntityTable from './sections/DashboardTransactionMonitoringEntityTable'
import DashboardTransactionMonitoringMaterialChart from './sections/DashboardTransactionMonitoringMaterialChart'
import DashboardTransactionMonitoringReasonChart from './sections/DashboardTransactionMonitoringReasonChart'

export enum TransactionType {
  Issues = 2,
  Receipts = 3,
  Discards = 4,
  Accept_Return = 101,
  Return = 102,
  Consumption = 103,
}

export enum TransactionTypeV2 {
  Issues = 2,
  Receipts = 3,
  Discards = 4,
  Accept_Return = 101,
  Return = 102,
  Consumption = 103,
  Add_Stock = 7,
  Reduce_Stock = 8,
}

export const transactionTypeList = (
  t: TFunction<'dashboardMonitoringTransactions'>
) => [
  {
    label: t('data.transaction_type.receipts'),
    value: TransactionType.Receipts,
  },
  {
    label: t('data.transaction_type.accept_return'),
    value: TransactionType.Accept_Return,
  },
  {
    label: t('data.transaction_type.issues'),
    value: TransactionType.Issues,
  },
  {
    label: t('data.transaction_type.return'),
    value: TransactionType.Return,
  },
  {
    label: t('data.transaction_type.consumption'),
    value: TransactionType.Consumption,
  },
  {
    label: t('data.transaction_type.discards'),
    value: TransactionType.Discards,
  },
]

export const transactionTypeListV2 = (
  t: TFunction<'dashboardMonitoringTransactions'>
) => [
  {
    label: t('data.transaction_type.consumption'),
    value: TransactionTypeV2.Consumption,
  },
  {
    label: t('data.transaction_type.discards'),
    value: TransactionTypeV2.Discards,
  },
  {
    label: t('data.transaction_type.return'),
    value: TransactionTypeV2.Return,
  },
  {
    label: t('data.transaction_type.issues'),
    value: TransactionTypeV2.Issues,
  },
  {
    label: t('data.transaction_type.receipts'),
    value: TransactionTypeV2.Receipts,
  },
  {
    label: t('data.transaction_type.accept_return'),
    value: TransactionTypeV2.Accept_Return,
  },
  {
    label: t('data.transaction_type.stock.add'),
    value: TransactionTypeV2.Add_Stock,
  },
  {
    label: t('data.transaction_type.stock.reduce'),
    value: TransactionTypeV2.Reduce_Stock,
  },
]

export const TRANSACTION_TYPE_COLOR = {
  [TransactionType.Receipts]: {
    className: 'ui-bg-sky-400 ui-text-white',
    chart: '#38BDF8',
  },
  [TransactionType.Accept_Return]: {
    className: 'ui-bg-cyan-950 ui-text-white',
    chart: '#083344',
  },
  [TransactionType.Issues]: {
    className: 'ui-bg-yellow-500 ui-text-dark-blue',
    chart: '#EAB308',
  },
  [TransactionType.Return]: {
    className: 'ui-bg-emerald-300 ui-text-dark-blue',
    chart: '#6EE7B7',
  },
  [TransactionType.Consumption]: {
    className: 'ui-bg-blue-900 ui-text-white',
    chart: '#1E3A8A',
  },
  [TransactionType.Discards]: {
    className: 'ui-bg-red-600 ui-text-white',
    chart: '#DC2626',
  },
}

export const TRANSACTION_TYPE_COLOR_V2 = {
  [TransactionTypeV2.Receipts]: '#4EADEA',
  [TransactionTypeV2.Accept_Return]: '#1B3B4A',
  [TransactionTypeV2.Issues]: '#FFC002',
  [TransactionTypeV2.Return]: '#61CFA6',
  [TransactionTypeV2.Consumption]: '#004990',
  [TransactionTypeV2.Discards]: '#ED1B23',
  [TransactionTypeV2.Add_Stock]: '#7C3AED',
  [TransactionTypeV2.Reduce_Stock]: '#EA580C',
}

export enum InformationType {
  Frequency = '1',
  Quantity = '0',
}

export const informationTypeList = (
  t: TFunction<'dashboardMonitoringTransactions'>
) => [
  {
    id: 'radio-information-remaining',
    label: t('data.information_type.frequency'),
    value: InformationType.Frequency,
  },
  {
    id: 'radio-information-transit',
    label: t('data.information_type.quantity'),
    value: InformationType.Quantity,
  },
]

export enum TransactionChartType {
  Total = 'total',
  Material = 'material',
  Reason = 'reason',
  Province = 'province',
  Regency = 'regency',
  Entity = 'entity',
  Entity_Complete = 'entity-complete',
}

export const transactionChartTabs = (
  t: TFunction<'dashboardMonitoringTransactions'>,
  isDiscard?: boolean
): Array<TDashboardTabs<TransactionChartType>> => {
  const isNewVersionEnabled = growthbook.getFeatureValue(
    'dashboard.transaction_monitoring.new',
    false
  )

  return [
    ...(isNewVersionEnabled
      ? [
          {
            id: TransactionChartType.Total,
            label: 'Total',
          },
        ]
      : []),
    {
      id: TransactionChartType.Material,
      label: 'Material',
    },
    ...(isDiscard
      ? [
          {
            id: TransactionChartType.Reason,
            label: t('title.transaction_reason'),
          },
        ]
      : []),
    {
      id: TransactionChartType.Province,
      label: t('title.province'),
    },
    {
      id: TransactionChartType.Regency,
      label: t('title.regency'),
    },
    {
      id: TransactionChartType.Entity,
      label: t('title.entity.main'),
    },
    {
      id: TransactionChartType.Entity_Complete,
      label: t('title.entity.complete'),
    },
  ]
}

export const tableEntityColumns = (
  t: TFunction<'dashboardMonitoringTransactions'>,
  page: number,
  paginate: number,
  formatNumber: (value?: number) => string,
  transactionType: string
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
      header: t('column.total', { type: transactionType }),
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

export const tableEntityCompleteColumns = (
  t: TFunction<'dashboardMonitoringTransactions'>,
  page: number,
  paginate: number,
  formatNumber: (value?: number) => string,
  informationType: string
) => {
  const isQty = informationType === '0'
  const type = isQty
    ? t('data.information_type.quantity')
    : t('data.information_type.frequency')

  const schema: Array<ColumnDef<TEntityComplete>> = [
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
      header: t('column.entity.id'),
      accessorKey: 'entity.id',
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
      header: `Material ${t('data.material_level.active_subtance')}`,
      accessorKey: 'material.parent',
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
      accessorKey: 'batch.code',
      size: 100,
      minSize: 100,
    },
    {
      header: t('column.batch.expired'),
      accessorKey: 'batch.expDate',
      size: 100,
      minSize: 100,
      cell: ({ getValue }) => {
        const value = getValue<string>()
        return parseDateTime(value, 'DD/MM/YYYY')
      },
    },
    {
      header: t('column.manufacturer'),
      accessorKey: 'batch.manufacture.name',
      size: 100,
      minSize: 100,
    },
    {
      header: t('column.vendor'),
      accessorKey: 'vendor.name',
      size: 100,
      minSize: 100,
    },
    {
      header: t('column.customer'),
      accessorKey: 'customer.name',
      size: 100,
      minSize: 100,
    },
    {
      header: t('column.created_at'),
      accessorKey: 'created_at',
      size: 100,
      minSize: 100,
      cell: ({ getValue }) => {
        const value = getValue<string>()
        return parseDateTime(value, 'DD/MM/YYYY')
      },
    },
    {
      header: t('column.transaction_type'),
      accessorKey: 'transaction_type.name',
      size: 100,
      minSize: 100,
    },
    {
      header: t('column.unit'),
      accessorKey: 'material.unit',
      size: 100,
      minSize: 100,
    },
    {
      header: type,
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

export const transactionDataElementTab = (
  t: TFunction<'dashboardMonitoringTransactions'>,
  informationType: InformationType
) => {
  const titleReason = t('title.transaction_reason')
  const titleProvince = t('title.province')
  const titleRegency = t('title.regency')
  const titleEntity = t('title.entity.main')
  const titleEntityComplete = t('title.entity.complete')

  const isQty = informationType === '0'

  const type = (
    isQty
      ? t('data.information_type.quantity')
      : t('data.information_type.frequency')
  )?.toLowerCase()

  return {
    [TransactionChartType.Total]: {
      title: 'Total',
      subtitle: t('description.information', {
        title: 'total',
        type,
      }),
      exportFileName: '',
    },
    [TransactionChartType.Material]: {
      title: 'Material',
      subtitle: t('description.information', {
        title: 'material',
        type,
      }),
      exportFileName: '',
    },
    [TransactionChartType.Reason]: {
      title: titleReason,
      subtitle: t('description.information', {
        title: titleReason?.toLowerCase(),
        type,
      }),
      exportFileName: '',
    },
    [TransactionChartType.Province]: {
      title: titleProvince,
      subtitle: t('description.information', {
        title: titleProvince?.toLowerCase(),
        type,
      }),
      exportFileName: 'Dashboard Transaction Monitoring - By Province',
    },
    [TransactionChartType.Regency]: {
      title: titleRegency,
      subtitle: t('description.information', {
        title: titleRegency?.toLowerCase(),
        type,
      }),
      exportFileName: 'Dashboard Transaction Monitoring - By City',
    },
    [TransactionChartType.Entity]: {
      title: titleEntity,
      subtitle: t('description.information', {
        title: titleEntity?.toLowerCase(),
        type,
      }),
      exportFileName: '',
    },
    [TransactionChartType.Entity_Complete]: {
      title: titleEntityComplete,
      subtitle: t('description.information', {
        title: titleEntityComplete?.toLowerCase(),
        type,
      }),
      exportFileName: '',
    },
  }
}

export const TRANSACTION_MONITORING_TAB_CONTENT = {
  [TransactionChartType.Total]: DashboardTransactionMonitoringBigNumber,
  [TransactionChartType.Material]: DashboardTransactionMonitoringMaterialChart,
  [TransactionChartType.Reason]: DashboardTransactionMonitoringReasonChart,
  [TransactionChartType.Province]: DashboardProvinceChart,
  [TransactionChartType.Regency]: DashboardRegencyChart,
  [TransactionChartType.Entity]: DashboardTransactionMonitoringEntityTable,
  [TransactionChartType.Entity_Complete]:
    DashboardTransactionMonitoringEntityTable,
}
