import { useMutation } from '@tanstack/react-query'
import { toast } from '#components/toast'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import useSmileRouter from '#hooks/useSmileRouter'
import { AxiosError } from 'axios'
import { SubmitHandler } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { createTransactionDiscard } from '../../transaction-create.service'
import { CreateTransctionForm } from '../../transaction-create.type'
import { createPayloadTransactionDiscard } from '../transaction-discard.helper'
import { CreateTransactionDiscard } from '../transaction-discard.type'

export const useTransactionSubmitDiscard = () => {
  const { t } = useTranslation('transactionCreate')
  const router = useSmileRouter()

  const { mutate, isPending } = useMutation({
    mutationKey: ['transactionDiscard'],
    mutationFn: createTransactionDiscard,
    onSuccess: () => {
      toast.success({
        description: t('transaction_discard.toast.success.create'),
      })

      router.push('/v5/transaction')
    },
    onError: (error: AxiosError) => {
      const { message } = error.response?.data as { message: string }

      toast.danger({ description: message })
    },
  })

  const submitDiscard: SubmitHandler<CreateTransctionForm> = (
    formData: CreateTransactionDiscard
  ) => {
    const payload = createPayloadTransactionDiscard(formData)
    mutate(payload)
  }

  useSetLoadingPopupStore(isPending)

  return {
    submitDiscard,
  }
}
