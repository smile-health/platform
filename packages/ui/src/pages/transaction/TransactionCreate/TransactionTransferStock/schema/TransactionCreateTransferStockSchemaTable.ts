import { useTranslation } from 'react-i18next'

export const TransactionCreateTransferStockSchemaTable = () => {
  const { t } = useTranslation('transactionCreate')
  const columns = [
    {
      header: 'SI.No',
      id: 'no',
      size: 64,
    },
    {
      header: t('transaction_transfer_stock.table.material_info'),
      id: 'material_info',
    },
    {
      header: t('transaction_transfer_stock.table.available_stock'),
      id: 'stock_info',
    },
    {
      header: t('transaction_transfer_stock.table.quantity'),
      id: 'quantity',
    },
    {
      header: t('transaction_transfer_stock.table.destination_activity'),
      id: 'destination_activity',
    },
    {
      header: t('transaction_transfer_stock.table.action'),
      id: 'action',
    },
  ]

  const columnsBatch = (managed_in_batch: boolean = true) => [
    {
      header: 'SI.No',
      id: 'no',
      size: 64,
    },
    {
      header: t('transaction_transfer_stock.table_batch.batch_info', {
        type: managed_in_batch ? 'Batch' : 'Detail',
      }),
      id: 'batch_info',
    },
    {
      header: t('transaction_transfer_stock.table_batch.activity'),
      id: 'activity',
    },
    {
      header: t('transaction_transfer_stock.table_batch.total_available_stock'),
      id: 'total_available_stock',
    },
    {
      header: t('transaction_transfer_stock.table_batch.budget_info'),
      id: 'budget_info',
    },
    {
      header: t('transaction_transfer_stock.table_batch.quantity'),
      id: 'quantity',
    },
  ]

  return {
    columns,
    columnsBatch,
  }
}
