import { yupResolver } from '@hookform/resolvers/yup'
import { OptionType } from '#components/react-select'
import { SubmitHandler, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import {
  handleDefaultBatchList,
  isAllFieldEmpty,
  mergeBatch,
  resetBatch,
} from '../order-create-distribution.helper'
import {
  TFormatBatch,
  TOrderFormItemsValues,
} from '../order-create-distribution.type'
import orderCreateDistributionBatchSchema from '../schemas/orderCreateDistributionBatchSchema'

type FormValues = Pick<TOrderFormItemsValues, 'material'> & {
  validBatch: TFormatBatch[]
  expiredBatch: TFormatBatch[]
}

type Params = {
  activity: OptionType | null
  data: TOrderFormItemsValues | null
  setOpen: (open: boolean) => void
  setOpenModalWarning: (open: boolean) => void
  onSubmitOrderItems: (stocks: TFormatBatch[]) => void
}

export default function useOrderBatchDetail({
  data,
  setOpen,
  activity,
  onSubmitOrderItems,
  setOpenModalWarning,
}: Params) {
  const { t } = useTranslation('orderDistribution')

  const isDisabledMaterialStatus = !data?.material?.is_temperature_sensitive

  const schema = orderCreateDistributionBatchSchema(t)

  const methods = useForm<FormValues>({
    resolver: yupResolver(schema),
    mode: 'onChange',
    defaultValues: handleDefaultBatchList(data),
  })

  const handleCloseDrawer = (open: boolean) => {
    setOpen(open)
  }

  const handleReset = () => {
    const validBatch = methods.watch('validBatch')
    const expiredBatch = methods.watch('expiredBatch')

    if (validBatch) {
      methods?.setValue('validBatch', resetBatch(validBatch, activity?.value))
    }

    if (expiredBatch) {
      methods?.setValue(
        'expiredBatch',
        resetBatch(expiredBatch, activity?.value)
      )
    }
  }

  const onValid: SubmitHandler<FormValues> = (form) => {
    const batch = mergeBatch(
      Boolean(form?.material?.is_managed_in_batch),
      form.validBatch,
      form.expiredBatch
    )
    onSubmitOrderItems(batch)
    setOpen(false)
  }

  const onInvalid = () => {
    const { material, validBatch, expiredBatch } = methods.watch()
    const batch = mergeBatch(
      Boolean(material?.is_managed_in_batch),
      validBatch,
      expiredBatch
    )
    const isOpen = isAllFieldEmpty(batch, isDisabledMaterialStatus)

    setOpenModalWarning(isOpen)
  }

  return {
    methods,
    handleReset,
    handleCloseDrawer,
    handleSubmit: () => methods.handleSubmit(onValid, onInvalid)(),
  }
}
