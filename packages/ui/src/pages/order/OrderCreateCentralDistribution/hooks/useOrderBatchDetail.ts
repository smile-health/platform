import { useState } from 'react'
import { yupResolver } from '@hookform/resolvers/yup'
import { SubmitErrorHandler, SubmitHandler, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { defaultStock } from '../order-create-central-distribution.constant'
import { isAllFieldEmpty } from '../order-create-central-distribution.helper'
import {
  TOrderFormItemStocksValues,
  TOrderFormItemsValues,
} from '../order-create-central-distribution.type'
import orderCreateCentralDistributionStocksSchema from '../schemas/orderCreateCentralDistributionStocksSchema'

type FormValues = {
  pieces_per_unit?: number
  is_managed_in_batch?: number
  stocks: TOrderFormItemStocksValues[]
}

type TModalBatch = {
  open: boolean
  data: TOrderFormItemStocksValues | null
  index: number | null
}

type Params = {
  data: TOrderFormItemsValues | null
  setOpen: (open: boolean) => void
  onSubmitOrderItems: (stocks: TOrderFormItemStocksValues[]) => void
}

export default function useOrderBatchDetail({
  data,
  setOpen,
  onSubmitOrderItems,
}: Params) {
  const { t } = useTranslation('orderCentralDistribution')
  const [openModalWarning, setOpenModalWarning] = useState(false)
  const [modalBatch, setModalBatch] = useState<TModalBatch>({
    open: false,
    data: null,
    index: null,
  })

  const defaultValues = {
    is_managed_in_batch: data?.is_managed_in_batch,
    pieces_per_unit: data?.pieces_per_unit,
    stocks: data?.stocks,
  }

  const isManagedInBatch = Boolean(data?.is_managed_in_batch)

  const schema = orderCreateCentralDistributionStocksSchema(t)

  const methods = useForm<FormValues>({
    resolver: yupResolver(schema),
    context: {
      pieces_per_unit: defaultValues?.pieces_per_unit,
      is_managed_in_batch: defaultValues?.is_managed_in_batch,
    },
    mode: 'onChange',
    defaultValues,
  })

  const handleCloseModal = (show: boolean, type: 'warning' | 'batch') => {
    if (type === 'warning') setOpenModalWarning(show)
    if (type === 'batch') {
      setModalBatch({
        open: show,
        data: null,
        index: null,
      })
    }
  }

  const handleReset = () => {
    const stocks = !isManagedInBatch ? defaultStock : []

    methods.reset({
      stocks,
      is_managed_in_batch: data?.is_managed_in_batch,
    })
  }

  const onValid: SubmitHandler<FormValues> = (form) => {
    onSubmitOrderItems(form?.stocks)
    setOpen(false)
  }

  const onInvalid: SubmitErrorHandler<FormValues> = (error) => {
    const isEmptyBatch = error?.stocks?.type === 'min'
    const stocks = methods.watch('stocks')
    const isEmptyField = isAllFieldEmpty(stocks, isManagedInBatch)
    const isOpen = isEmptyBatch || isEmptyField

    setOpenModalWarning(isOpen)

    if (isEmptyBatch) {
      const drawerElement = document.getElementById('drawer-batch')
      if (drawerElement) {
        drawerElement.scrollTop = drawerElement.scrollHeight
      }
    }
  }

  return {
    methods,
    modalBatch,
    handleReset,
    setModalBatch,
    handleCloseModal,
    openModalWarning,
    handleSubmit: () => methods.handleSubmit(onValid, onInvalid)(),
  }
}
