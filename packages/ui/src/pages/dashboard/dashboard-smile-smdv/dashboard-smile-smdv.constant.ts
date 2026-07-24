import { ColumnDef } from '@tanstack/react-table'
import { orderStatusList } from '#constants/order'
import { numberFormatter } from '#utils/formatter'
import { TFunction } from 'i18next'

import { OrderStatusEnum } from '../../order/order.constant'
import DashboardSmileSmdvTable from './components/DashboardSmileSmdvTable'
import {
  TSmileVsSmdvEntity,
  TSmileVsSmdvMaterial,
} from './dashboard-smile-smdv.type'

export enum DefaultDashboardSelection {
  SMDV_VS_SMILE = '1',
  SMILE_VS_SMDV = '0',
}

export enum SummaryCardId {
  QTY_SMDV = 'smdv_qty',
  QTY_SMILE = 'smile_qty',
  QTY_DEVIATION = 'deviation_qty',
}

export enum TableType {
  MATERIAL = 'material',
  ENTITY = 'entity',
}

export function getTabs(t: TFunction<'dashboardSmileSmdv'>) {
  return [
    {
      id: TableType.MATERIAL,
      label: t('title.tab.material'),
      component: DashboardSmileSmdvTable,
    },
    {
      id: TableType.ENTITY,
      label: t('title.tab.entity'),
      component: DashboardSmileSmdvTable,
    },
  ]
}

export const defaultOrderStatuses = [
  OrderStatusEnum?.Shipped,
  OrderStatusEnum?.Fulfilled,
  OrderStatusEnum?.Cancelled,
]

export const getOrderStatusList = (
  t: TFunction<['common', 'order', 'orderList']>
) =>
  orderStatusList?.(t)?.filter((item) =>
    defaultOrderStatuses.includes(item?.value)
  )

export const getDefaultSummaryCardDashboard = (
  t: TFunction<'dashboardSmileSmdv'>,
  defaultDashboard?: DefaultDashboardSelection
) => {
  return [
    {
      id: SummaryCardId.QTY_SMDV,
      label: t('summary.qty_smdv'),
      color: '#A8E9D1',
    },
    {
      id: SummaryCardId.QTY_SMILE,
      label: t('summary.qty_smile'),
      color: '#C6DEF1',
    },
    {
      id: SummaryCardId.QTY_DEVIATION,
      label:
        defaultDashboard === DefaultDashboardSelection.SMDV_VS_SMILE
          ? t('summary.qty_deviation.label.smdv_vs_smile')
          : t('summary.qty_deviation.label.smile_vs_smdv'),
      color: '#FFD9E4',
    },
  ]
}

export const defaultDashboardOptions = (t: TFunction<'dashboardSmileSmdv'>) => {
  return [
    {
      id: 'smdv_vs_smile',
      value: DefaultDashboardSelection.SMDV_VS_SMILE,
      label: t('form.default_dashboard.options.smdv_vs_smile'),
    },
    {
      id: 'smile_vs_smdv',
      value: DefaultDashboardSelection.SMILE_VS_SMDV,
      label: t('form.default_dashboard.options.smile_vs_smdv'),
    },
  ]
}

export function getColumns(
  t: TFunction<'dashboardSmileSmdv'>,
  page: number,
  paginate: number,
  activeTab: TableType,
  lang: string,
  defaultDashboard?: DefaultDashboardSelection
) {
  const schema: Array<ColumnDef<TSmileVsSmdvMaterial | TSmileVsSmdvEntity>> = [
    {
      header: 'No.',
      accessorKey: 'no',
      size: 40,
      maxSize: 40,
      cell: ({ row }) => (page - 1) * paginate + (row?.index + 1),
    },
    ...(activeTab === TableType.MATERIAL
      ? [
          {
            header: t('columns.material_name'),
            accessorKey: 'material_name',
            size: 220,
            minSize: 220,
          },
          {
            header: t('columns.material_biofarma'),
            accessorKey: 'biofarma_material_name',
            size: 220,
            minSize: 220,
          },
        ]
      : [
          {
            header: t('columns.entity_name'),
            accessorKey: 'entity_name',
            size: 220,
            minSize: 220,
          },
        ]),
    {
      header: t('columns.total_smile'),
      accessorKey: 'smile_qty',
      size: 100,
      minSize: 100,
      cell: ({ row }) => {
        const { smile_qty } = row?.original ?? {}
        return numberFormatter(smile_qty, lang)
      },
    },
    {
      header: t('columns.total_smdv'),
      accessorKey: 'smdv_qty',
      size: 100,
      minSize: 100,
      cell: ({ row }) => {
        const { smdv_qty } = row?.original ?? {}
        return numberFormatter(smdv_qty, lang)
      },
    },
    {
      header:
        defaultDashboard === DefaultDashboardSelection.SMDV_VS_SMILE
          ? t('columns.difference.smdv_vs_smile')
          : t('columns.difference.smile_vs_smdv'),
      accessorKey: 'deviation_qty',
      size: 120,
      minSize: 120,
      cell: ({ row }) => {
        const { deviation_qty } = row?.original ?? {}
        return numberFormatter(deviation_qty, lang)
      },
    },
    {
      header: t('columns.difference_percentage'),
      accessorKey: 'deviation_percentage',
      size: 80,
      minSize: 80,
      cell: ({ row }) => {
        const { deviation_percentage } = row?.original ?? {}
        return `${numberFormatter(deviation_percentage, lang)}%`
      },
    },
  ]

  return schema
}
