import { useMutation } from '@tanstack/react-query'
import { toast } from '#components/toast'
import useSmileRouter from '#hooks/useSmileRouter'
import { useLoadingPopupStore } from '#store/loading.store'
import { AxiosError } from 'axios'
import { UseFormSetError } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { createOrderRelocation } from '../order-create-relocation.service'
import {
  createOrderRelocationBody,
  OrderRelocationCreateForm,
} from '../order-create-relocation.types'
import { handleOrderRelocationErrors } from '../order-create-relocation.util'

type Props = {
  setError: UseFormSetError<OrderRelocationCreateForm>
}

export const useOrderCreateRelocation = ({ setError }: Props) => {
  const { t } = useTranslation(['orderCreateRelocation', 'common'])
  const router = useSmileRouter()
  const { setLoadingPopup } = useLoadingPopupStore()

  const { mutate, isPending } = useMutation({
    mutationKey: ['create-relocation'],
    mutationFn: (data: createOrderRelocationBody) =>
      createOrderRelocation(data),
    onSettled: () => setLoadingPopup(false),
    onSuccess: async (response) => {
      toast.success({
        description: t('common:message.success.create', {
          type: t('orderCreateRelocation:create.title'),
        }),
      })
      router.push(`/v5/order/${response.createdOrderId}`)
    },
    onError: (error: AxiosError) => {
      setLoadingPopup(false)
      handleOrderRelocationErrors(error, setError)
    },
  })

  return {
    mutateOrderRelocation: mutate,
    isPendingMutateRelocation: isPending,
  }
}
