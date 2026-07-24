import React from 'react'
import { DataTable } from '#components/data-table'
import { useFieldArray, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import TransactionCreateMaterialDropdown from '../../components/TransactionCreateMaterialDropdown'
import { useTransactionCreateRemoveStock } from '../hooks/useTransactionCreateRemoveStock'
import { CreateTransactionRemoveForm } from '../transaction-remove-stock.type'
import TransactionRemoveStockInputBatchDrawer from './TransactionRemoveStockInputBatchDrawer'
import { MainColumn } from './TransactionRemoveStockItemColumn'

const TransactionRemoveStockItemTable = (): JSX.Element => {
  const { t, i18n } = useTranslation(['transactionCreate', 'common'])
  const { handleDeleteMaterial, handleAddItemRemoveStock } =
    useTransactionCreateRemoveStock(t)
  const methods = useFormContext<CreateTransactionRemoveForm>()
  const { fields } = useFieldArray({
    control: methods.control,
    name: 'items',
  })

  return (
    <>
      <div className="ui-mt-6">
        <TransactionRemoveStockInputBatchDrawer />
        <DataTable
          id="transaction__remove__stock__input__table"
          data={fields || []}
          columns={MainColumn({
            t,
            locale: i18n.language,
            handleDeleteMaterial,
            methods,
          })}
          className="ui-overflow-hidden"
        />
        {fields.length > 0 && (
          <TransactionCreateMaterialDropdown
            colSpan={1}
            onSelect={(stock) => handleAddItemRemoveStock({ item: stock })}
            className="ui-w-[294px] ui-font-normal"
          />
        )}
      </div>
      <style>{`
        #transaction__remove__stock__input__table table td {
          vertical-align: top !important;
          font-weight: 400;
        }

        #transaction__remove__stock__input__table table td:has(div#stock_on_hand_td) {
          padding: 0 !important;
          height: 100%;
        }

      ${!fields || fields.length === 0 ? `#transaction__remove__stock__input__table tbody tr td { height: 200px !important; }` : ''}
      `}</style>
    </>
  )
}

export default TransactionRemoveStockItemTable
