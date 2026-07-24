import { TFunction } from 'i18next'

export enum TRANSACTION_TYPE {
  STOCK_COUNT = 1,
  RECEIVE = 3,
  DISCARD = 4,
  RETURN_FROM_HEALTH_FACILITIES = 5,
  OPEN_VIAL_ACCEPTANCE = 6,
  ADD_STOCK = 7,
  REMOVE_STOCK = 8,
  CANCELLATION_OF_DISCARD = 9,
  LAST_MILE = 10,
  TRANSFER_STOCK = 11,
  ISSUE = 2,
}

export const TableSchemaTransactionDetail = (
  t: TFunction<['transactionCreate']>
) => {
  const schema = [
    {
      header: 'SI.No',
      accessorKey: 'no',
      size: 40,
      minSize: 40,
    },
    {
      header: t('table.column.activity'),
      accessorKey: 'activity',
    },
    {
      header: 'Material',
      accessorKey: 'material',
    },
    {
      header: t('table.column.stock_on_hand'),
      accessorKey: 'stock_on_hand',
    },
    {
      header: t('table.column.available_stock'),
      accessorKey: 'available_stock',
    },
    {
      header: t('table.column.action'),
      accessorKey: 'action',
    },
  ]

  return schema
}

export const TRANSACTION_TYPE_LIST = (t: TFunction<['transactionCreate']>) => [
  {
    id : TRANSACTION_TYPE.LAST_MILE,
    title: t('transaction_type_list.last_mile')
  },
  {
    id : TRANSACTION_TYPE.DISCARD,
    title: t('transaction_type_list.discard')
  },
  {
    id : TRANSACTION_TYPE.RETURN_FROM_HEALTH_FACILITIES,
    title: t('transaction_type_list.return_of_health_facilities')
  },
  {
    id : TRANSACTION_TYPE.ADD_STOCK,
    title: t('transaction_type_list.add_stock')
  },
  {
    id : TRANSACTION_TYPE.REMOVE_STOCK,
    title: t('transaction_type_list.remove_stock')
  },
  {
    id : TRANSACTION_TYPE.CANCELLATION_OF_DISCARD,
    title: t('transaction_type_list.cancellation_of_discard')
  },
  {
    id : TRANSACTION_TYPE.TRANSFER_STOCK,
    title: t('transaction_type_list.transfer_stock')
  },
]

export const OTHER_REASON_ID: number = 14