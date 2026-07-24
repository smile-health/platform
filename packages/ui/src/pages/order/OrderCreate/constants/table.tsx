import { TFunction } from 'i18next'

export const columnsOrderCreateTableHeader = (
  t: TFunction<['common', 'orderCreate']>
) => {
  return [
    {
      header: 'SI.No',
      id: 'si-no',
      size: 50,
    },

    {
      header: t('orderCreate:list.selected.column.material_info.label'),
      id: 'material-name',
      size: 200,
    },
    {
      header: t('orderCreate:list.selected.column.stock_on_hand'),
      id: 'stock-on-hand',
      size: 200,
    },
    {
      header: t('orderCreate:list.selected.column.quantity.label'),
      id: 'quantity',
      size: 200,
    },
    {
      header: t('orderCreate:list.selected.column.reason.label'),
      id: 'reason',
      size: 200,
    },
    {
      header: t('orderCreate:list.selected.column.action'),
      id: 'action',
      size: 100,
    },
  ]
}

export const columnsOrderCreateTableHeaderDrawer = (
  t: TFunction<['common', 'orderCreate']>
) => {
  return [
    {
      header: 'SI.No',
      id: 'si-no',
      size: 50,
    },

    {
      header: t('orderCreate:list.selected.column.material_info.label'),
      id: 'material-name',
      size: 250,
    },
    {
      header: t('orderCreate:list.selected.column.stock_available.label'),
      id: 'stock-on-hand',
      size: 100,
    },
    {
      header: t('orderCreate:list.selected.column.quantity.label'),
      id: 'quantity',
      size: 600,
    },
  ]
}
