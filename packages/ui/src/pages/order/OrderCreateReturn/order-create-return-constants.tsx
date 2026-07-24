import { TFunction } from 'i18next'

export const columnsOrderReturnCreateTableHeader = (
  t: TFunction<['common', 'orderCreateReturn']>
) => {
  return [
    {
      header: 'SI.No',
      id: 'si-no',
      size: 50,
    },
    {
      header: t('orderCreateReturn:list.selected.column.material_info'),
      id: 'material_info',
      size: 380,
    },
    {
      header: t('orderCreateReturn:list.selected.column.stock_info.label'),
      id: 'stock_info',
      size: 380,
    },
    {
      header: t('orderCreateReturn:list.selected.column.quantity.label'),
      id: 'quantity',
      size: 300,
    },
    {
      header: t('orderCreateReturn:list.selected.column.action.label'),
      id: 'action',
      size: 180,
    },
  ]
}

export const columnsOrderReturnCreateTableDrawer = (
  t: TFunction<['common', 'orderCreateReturn']>
) => {
  return [
    {
      header: 'SI.No',
      id: 'si-no',
      size: 50,
    },
    {
      header: t('orderCreateReturn:drawer.table.column.batch_info.label'),
      id: 'batch_info',
      size: 240,
    },
    {
      header: t('orderCreateReturn:drawer.table.column.stock_info.label'),
      id: 'stock_info',
      size: 180,
    },
    {
      header: t('orderCreateReturn:drawer.table.column.activity.label'),
      id: 'activity',
      size: 100,
    },
    {
      header: t('orderCreateReturn:drawer.table.column.quantity.label'),
      id: 'quantity',
      size: 400,
    },
    {
      header: t('orderCreateReturn:drawer.table.column.material_status.label'),
      id: 'material_status',
      size: 180,
    },
  ]
}
