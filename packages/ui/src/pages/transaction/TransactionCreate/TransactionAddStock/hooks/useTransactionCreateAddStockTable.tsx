import { useTranslation } from 'react-i18next'

export const useTransactionCreateAddStockTable = () => {
  const { t } = useTranslation('transactionCreateAddStock')
  const columns = [
    {
      header: 'SI.No',
      id: 'no',
      size: 64,
    },
    {
      header: t('table.column.material_info'),
      id: 'material_info',
    },
    {
      header: t('table.column.stock_info'),
      id: 'stock_info',
    },
    {
      header: t('table.column.quantity'),
      id: 'quantity',
    },
    {
      header: t('table.column.action'),
      id: 'action',
    },
  ]

  return { columns }
}

export default useTransactionCreateAddStockTable
