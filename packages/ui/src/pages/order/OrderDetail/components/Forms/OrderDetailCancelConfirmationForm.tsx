import { useParams } from 'next/navigation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '#components/toast'
import { useLoadingPopupStore } from '#store/loading.store'
import { ErrorResponse } from '#types/common'
import { AxiosError } from 'axios'
import { useTranslation } from 'react-i18next'

import { updateOrderStatusToPending } from '../../order-detail.service'
import useOrderDetailStore from '../../order-detail.store'
import { OrderDetailModal } from '../OrderDetailModal'

export const OrderDetailCancelConfirmationForm = () => {
  const params = useParams()
  const queryClient = useQueryClient()

  const { t, i18n } = useTranslation('orderDetail')

  const orderId = params.id as string

  const { setLoadingPopup } = useLoadingPopupStore()
  const { isOpenCancelConfirmationForm, setOpenCancelConfirmationForm } =
    useOrderDetailStore()

  const { mutate, isPending } = useMutation<unknown, AxiosError<ErrorResponse>>(
    {
      mutationKey: ['order', 'detail', 'cancel_confirmation', orderId],
      mutationFn: () => updateOrderStatusToPending(orderId),
      onSuccess: () => {
        setLoadingPopup(true)
        setOpenCancelConfirmationForm(false)
        toast.success({ description: t('message.cancel_confirmation_success') })
        setTimeout(async () => {
          await queryClient.refetchQueries({
            queryKey: [i18n.language, 'order', 'detail', orderId],
          })
          setLoadingPopup(false)
        }, 500)
      },
      onError: (error) => {
        const responseData = error.response?.data
        const message =
          responseData?.message ?? t('message.cancel_confirmation_failed')
        toast.danger({ description: message })
      },
    }
  )

  const handleSubmit = () => mutate()

  const handleClose = () => {
    setOpenCancelConfirmationForm(false)
  }

  return (
    <OrderDetailModal
      title={t('modal.cancel_confirmation.title')}
      description={t('modal.cancel_confirmation.description')}
      open={isOpenCancelConfirmationForm}
      onClose={handleClose}
      onSubmit={handleSubmit}
      isLoading={isPending}
      submitButton={{
        label: t('modal.cancel_confirmation.submit_button'),
      }}
    />
  )
}
