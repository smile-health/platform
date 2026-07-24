import { useMutation } from '@tanstack/react-query'
import { toast } from '#components/toast'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import useSmileRouter from '#hooks/useSmileRouter'
import { AxiosError } from 'axios'
import { SubmitHandler } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { CreateCancelTransactionDiscard } from '../transaction-cancel-discard.type'
import { createPayloadCancelTransactionDiscard } from '../transaction-cancel-discard.helper'
import { CreateTransctionForm } from '../../transaction-create.type'
import { createCancelTransactionDiscard } from '../transaction-cancel-discard.service'

export const useTransactionSubmitCancelDiscard = () => {
  const { t } = useTranslation('transactionCreate')
  const router = useSmileRouter()

  const { mutate, isPending } = useMutation({
    mutationKey: ['transactionDiscard'],
    mutationFn: createCancelTransactionDiscard,
    onSuccess: () => {
      toast.success({
        description: t('cancel_transaction_discard.toast.success.create'),
      })

      router.push('/v5/transaction')
    },
    onError: (error: AxiosError) => {
      const { message } = error.response?.data as { message: string }

      toast.danger({ description: message })
    },
  })

  const submitCancelDiscard: SubmitHandler<CreateTransctionForm> = (formData: CreateCancelTransactionDiscard) => {
    const payload = createPayloadCancelTransactionDiscard(formData)
    
    mutate(payload)
  }

  useSetLoadingPopupStore(isPending)

  return {
    submitCancelDiscard,
  }
}
