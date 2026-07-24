import React, { useContext, useEffect } from 'react'
import { XMarkIcon } from '@heroicons/react/24/solid'
import { Button } from '#components/button'
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
} from '#components/drawer'
import Reload from '#components/icons/Reload'
import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import TransactionCreateModalWarningItem from '../../components/TransactionCreateModalWarningItem'
import { useModalWarningStore } from '../../store/modal-warning.store'
import TransactionRemoveStockContext from '../transaction-remove-stock.context'
import {
  CreateTransactionRemoveForm,
  TDetailMaterials,
} from '../transaction-remove-stock.type'
import { transactionRemoveStockBatchValidation } from '../transaction-remove-stock.validation-schema'
import TransactionRemoveStockBatchIdentityBox from './TransactionRemoveStockBatchIdentityBox'
import TransactionRemoveStockItemDetailBatchTable from './TransactionRemoveStockItemDetailBatchTable'

const TransactionRemoveStockInputBatchDrawer = () => {
  const { t } = useTranslation(['transactionCreate', 'common'])
  const { setModalWarning } = useModalWarningStore()
  const {
    stockData,
    setStockData,
    savedStockData,
    setErrorForms,
    setSavedStockData,
  } = useContext(TransactionRemoveStockContext)

  const schema = transactionRemoveStockBatchValidation(t)

  const nullInputObjects = {
    input_qty: null,
    transaction_reason: null,
    other_reason: null,
    material_status: null,
  }

  const methods = useFormContext<CreateTransactionRemoveForm>()
  const itemIndex = methods
    .watch('items')
    ?.findIndex((item) => item?.material?.id === stockData?.material?.id)
  const stockFromValues = methods.getValues(`items.${itemIndex}`)
  useEffect(() => {
    setSavedStockData(stockFromValues)
  }, [stockData])

  const handleSave = async () => {
    if (!savedStockData?.stocks.some((stock) => Number(stock?.input_qty) > 0))
      return setModalWarning(true, t('transactionCreate:alert_save_batch'))
    try {
      await schema.validate(savedStockData, { abortEarly: false })
      methods.setValue(`items.${itemIndex}`, savedStockData)
      methods.trigger(`items.${itemIndex}.stocks`)
      setStockData(null)
    } catch (error: any) {
      const errors: { [key: string]: string } = {}
      error.inner.forEach((err: any) => {
        errors[err.path] = err.message
      })
      setErrorForms(errors)
    }
  }

  const handleReset = () => {
    const resettedStockData = {
      ...stockData,
      stocks: stockData?.stocks?.map((stock) => ({
        ...stock,
        ...nullInputObjects,
      })),
    }
    setSavedStockData(resettedStockData as TDetailMaterials)
  }

  const drawerTitle = methods.watch('items')?.[itemIndex]?.material
    ?.is_managed_in_batch
    ? t('transactionCreate:transaction_remove_stock.batch_list')
    : t('transactionCreate:transaction_remove_stock.material_detail')

  return (
    <Drawer
      key={stockData?.id}
      open={stockData !== null}
      placement="bottom"
      size="full"
      sizeHeight="md"
    >
      <Button
        className="ui-absolute ui-right-2 ui-top-2 ui-rounded ui-text-gray-800 ui-outline-none ui-border-none"
        onClick={() => setStockData(null)}
        variant="subtle"
        type="button"
      >
        <XMarkIcon className="ui-h-5 ui-w-5" />
      </Button>
      <DrawerHeader title={drawerTitle} className="ui-mx-auto" />
      <div className="ui-border-b-zinc-300 ui-h-1 ui-border-b" />
      <DrawerContent className="!ui-rounded-lg">
        <TransactionCreateModalWarningItem />
        <TransactionRemoveStockBatchIdentityBox />
        <TransactionRemoveStockItemDetailBatchTable />
      </DrawerContent>
      <DrawerFooter>
        <Button
          variant="subtle"
          onClick={handleReset}
          className="ui-px-4"
          leftIcon={<Reload className="ui-w-5 ui-h-5 ui-mr-2" />}
        >
          {t('common:reset')}
        </Button>
        <Button variant="solid" onClick={handleSave} className="ui-px-16">
          {t('common:save')}
        </Button>
      </DrawerFooter>
    </Drawer>
  )
}

export default TransactionRemoveStockInputBatchDrawer
