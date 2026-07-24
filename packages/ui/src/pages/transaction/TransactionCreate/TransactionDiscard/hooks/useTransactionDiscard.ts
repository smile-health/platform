import { useState } from "react"
import { useFormContext } from "react-hook-form"
import { useTranslation } from 'react-i18next'
import { CreateTransactionDiscard, ItemsTransactionDiscard, ItemTransactionDiscard } from "../transaction-discard.type"

export const useTransactionDiscard = () => {
  const {
    watch,
    setValue,
    clearErrors,
    formState: { errors },
  } = useFormContext<CreateTransactionDiscard>()
  const {
    t,
    i18n: { language },
  } = useTranslation(['transactionCreate', 'common'])
  const [openDetail, setOpenDetail] = useState<{
    open: boolean, detail: ItemTransactionDiscard | null, index: number
  }>({
    detail: null,
    index: 0,
    open: false,
  })

  const handleOpenDetail = (detail: ItemTransactionDiscard, index: number) => {
    setOpenDetail({ open: true, detail, index })
  }

  const handleCloseDetail = () => setOpenDetail({ open: false, detail: null, index: 0 })

  const handleRemove = (index: number) => {
    const newItems = [...watch('items')]

    newItems.splice(index, 1)

    setValue('items', newItems as ItemsTransactionDiscard)
    clearErrors('items')
  }

  const getErrorMessage = (index: number) => {
    const message = errors?.items?.[index]?.details?.message;
    return message ? t(message as 'common:validation.required') : '';
  };


  return {
    t,
    language,
    openDetail,
    handleOpenDetail,
    handleCloseDetail,
    handleRemove,
    items: watch('items') as ItemsTransactionDiscard || [],
    getErrorMessage,
  }
}