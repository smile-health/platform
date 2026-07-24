import { useState } from "react"
import { useFormContext } from "react-hook-form"
import { NewOpnameItems, NewOpnameStocks, StockOpnameCreateForm } from "../types"
import { useTranslation } from "react-i18next"

export const useStockOpnameStock = () => {
  const { t, i18n: { language } } = useTranslation(['common', 'stockOpnameCreate'])
  const {
    watch,
    setValue,
    clearErrors,
    formState: { errors }
  } = useFormContext<StockOpnameCreateForm>()
  const [openDetail, setOpenDetail] = useState<{
    index: number,
    data: NewOpnameItems | null
    open: boolean
  }>({
    data: null,
    index: -1,
    open: false,
  })

  const handleOpenDetail = (index: number, data: NewOpnameItems | null) => {
    setOpenDetail({
      data,
      index,
      open: true,
    })
  }

  const handleCloseDetail = () => {
    setOpenDetail({
      data: null,
      index: -1,
      open: false,
    })
  }

  const handleRemove = (index: number) => {
    const newItems = [...watch('new_opname_items')]

    newItems.splice(index, 1)

    setValue('new_opname_items', newItems)
    clearErrors('new_opname_items')
  }

  const handleUpdateItems = (data: NewOpnameStocks[]) => {
    if (openDetail.data) {
      const newOpnameItem: NewOpnameItems = {
        ...openDetail.data,
        is_valid: true,
        new_opname_stocks: data,
      }

      setValue(`new_opname_items.${openDetail.index}`, newOpnameItem)
      clearErrors(`new_opname_items.${openDetail.index}`)
      handleCloseDetail()
    }
  }

  const createTitleActionBatch = (isBatch: boolean, isUpdateAble: boolean) => {
    if (isUpdateAble) {
      if (isBatch) {
        return t('stockOpnameCreate:form.transaction.action.update_batch_quantity')
      }
      return t('stockOpnameCreate:form.transaction.action.update_detail_quantity')
    }

    if (isBatch) {
      return t('stockOpnameCreate:form.transaction.action.add_batch_quantity')
    }
    return t('stockOpnameCreate:form.transaction.action.add_detail_quantity')
  }

  const getErrorMessage = (index: number) => {
    const message = errors?.new_opname_items?.[index]?.is_valid?.message;
    return message ? t(message as 'common:validation.required') : '';
  };

  return {
    t,
    language,
    openDetail,
    handleOpenDetail,
    handleCloseDetail,
    handleRemove,
    handleUpdateItems,
    items: watch('new_opname_items') as StockOpnameCreateForm['new_opname_items'] || [],
    createTitleActionBatch,
    getErrorMessage,
  }
}