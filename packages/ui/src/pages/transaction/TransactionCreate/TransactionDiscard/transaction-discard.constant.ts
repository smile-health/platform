import { TFunction } from "i18next";

type CreateColumnDiscardProps = {
  t: TFunction<['transactionCreate', 'common']>
}

type CreateColumnDiscardPropsDetail = {
  t: TFunction<'transactionCreate'>,
  is_sensitive: boolean
  is_open_vial: boolean
}

export const createColumnDiscard = ({ t }: CreateColumnDiscardProps) => [
  {
    header: 'SI.No',
    id: 'no',
    minSize: 40,
  },
  {
    header: t('transactionCreate:transaction_discard.form.table.column.material'),
    id: 'material_info',
  },
  {
    header: t('transactionCreate:transaction_discard.form.table.column.stock'),
    id: 'stock_info',
  },
  {
    header: t('transactionCreate:transaction_discard.form.table.column.quantity'),
    id: 'quantity',
  },
  {
    header: t('transactionCreate:transaction_discard.form.table.column.action'),
    id: 'action',
  },
]

export const createColumnDiscardDetail = ({ t, is_sensitive, is_open_vial }: CreateColumnDiscardPropsDetail) => [
  {
    header: 'SI.No',
    id: 'no',
    minSize: 50,
  },
  {
    header: t('transaction_discard.form.table.column.batch'),
    id: 'batch-info',
    minSize: 130,
  },
  {
    header: t('transaction_discard.form.table.column.stock'),
    id: 'stock-info',
    minSize: 150,
  },
  {
    header: t('transaction_discard.form.table.column.activity'),
    id: 'activity',
    minSize: 130,
  },
  ...!is_open_vial ? [
    {
      header: t('transaction_discard.form.table.column.quantity'),
      id: 'quantity',
      minSize: 150,
    },
  ] : [
    {
      header: t('transaction_discard.form.table.column.open_vial'),
      id: 'open-vial',
      minSize: 100,
    },
    {
      header: t('transaction_discard.form.table.column.close_vial'),
      id: 'close-vial',
      minSize: 100,
    },
  ],
  ...(is_sensitive ? [{
    header: t('transaction_discard.form.table.column.material_status'),
    id: 'material_status',
    minSize: 130,
  }] : []),
  {
    header: t('transaction_discard.form.table.column.reason'),
    id: 'reason',
    minSize: 130,
  },
]
