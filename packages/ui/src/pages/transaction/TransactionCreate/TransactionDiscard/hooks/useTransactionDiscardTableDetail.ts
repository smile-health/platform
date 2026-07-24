import { useEffect } from 'react'
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { useModalWarningStore } from '../../store/modal-warning.store'
import { formDiscardSchema } from '../transaction-discard.schema'
import {
  CreateTransactionDiscard,
  ItemTransactionDiscard,
} from '../transaction-discard.type'

type Props = {
  index: number
  data: ItemTransactionDiscard | null
  handleClose: () => void
}
export const useTransactionDiscardTableDetail = (props: Props) => {
  const { t } = useTranslation(['transactionCreate', 'common'])
  const { data, index, handleClose } = props
  const { setValue, clearErrors } = useFormContext<CreateTransactionDiscard>()
  const methods = useForm<ItemTransactionDiscard>({
    mode: 'onChange',
    defaultValues: {},
    resolver: yupResolver(formDiscardSchema(t)),
  })
  const { setModalWarning } = useModalWarningStore()

  const handleUpdateItems = async () => {
    const isValid = await methods.trigger()
    if (!isValid) {
      const {
        formState: { errors },
      } = methods
      if (errors.details?.root?.type === 'at-least-one-qty') {
        return setModalWarning(
          true,
          t('alert_save_batch')
        )
      }

      return
    }
    const { details } = methods.getValues()

    setValue(`items.${index}.details`, details)
    clearErrors(`items.${index}.details`)
    handleClose()
    methods.reset({})
  }

  const handleReset = () => {
    const newDetails = data?.details.map((x) => ({
      ...x,
      qty: undefined,
      open_vial: undefined,
      close_vial: undefined,
      transaction_reason: null,
      stock_quality: null,
    })) ?? []

    methods.setValue('details', newDetails)
    methods.clearErrors('details')
  }

  const getValueBoolean = (value: boolean) => (value ? 1 : 0)

  useEffect(() => {
    methods.reset(data ?? {})
  }, [data])

  return {
    handleUpdateItems,
    is_sensitive: !!data?.material?.is_temperature_sensitive,
    is_open_vial: !!data?.material?.is_open_vial,
    is_batch: data?.stocks.some((stock) => stock.batch),
    getValueBoolean,
    details: methods.watch(),
    methods,
    handleReset,
  }
}
