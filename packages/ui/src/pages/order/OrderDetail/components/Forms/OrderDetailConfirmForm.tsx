import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '#components/toast'
import { useLoadingPopupStore } from '#store/loading.store'
import { ErrorResponse } from '#types/common'
import { AxiosError } from 'axios'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { updateOrderStatusToConfirm } from '../../order-detail.service'
import useOrderDetailStore from '../../order-detail.store'
import {
  UpdateOrderStatusToConfirmFormValues,
  UpdateOrderStatusToConfirmResponseError,
} from '../../order-detail.type'
import { OrderDetailConfirmDrawerForm } from './OrderDetailConfirmDrawerForm'
import { OrderDetailConfirmModalForm } from './OrderDetailConfirmModalForm'

export const OrderDetailConfirmForm = () => {
  const params = useParams()
  const queryClient = useQueryClient()
  const { t, i18n } = useTranslation(['common', 'orderDetail'])

  const orderId = params.id as string

  const { handleSubmit, setValue } =
    useForm<UpdateOrderStatusToConfirmFormValues>({
      defaultValues: {
        order_items: [],
        comment: '',
      },
    })

  const { setLoadingPopup } = useLoadingPopupStore()

  const { setOpenConfirmDrawerForm, setOpenConfirmModalForm } =
    useOrderDetailStore()

  const [formErrors, setFormErrors] =
    useState<UpdateOrderStatusToConfirmResponseError>()

  const handleFieldResponseError = (
    responseErrors?: UpdateOrderStatusToConfirmResponseError
  ) => {
    setFormErrors(responseErrors)
    setOpenConfirmModalForm(!responseErrors?.order_items)
  }

  const { mutate, isPending } = useMutation<
    unknown,
    AxiosError<ErrorResponse<UpdateOrderStatusToConfirmResponseError>>,
    UpdateOrderStatusToConfirmFormValues
  >({
    mutationKey: ['order', 'detail', 'confirm', orderId],
    mutationFn: (values) => updateOrderStatusToConfirm(orderId, values),
    onSuccess: async () => {
      setLoadingPopup(true)
      setOpenConfirmDrawerForm(false)
      setOpenConfirmModalForm(false)
      toast.success({
        description: t('orderDetail:message.confirm_order_success'),
      })
      setTimeout(async () => {
        await queryClient.refetchQueries({
          queryKey: [i18n.language, 'order', 'detail', orderId],
        })
        setLoadingPopup(false)
      }, 500)
    },
    onError: (error) => {
      const responseData = error.response?.data
      const responseErrors = responseData?.errors
      const message =
        responseData?.message ?? t('orderDetail:message.confirm_order_failed')

      handleFieldResponseError(responseErrors)
      toast.danger({ description: message })
    },
  })

  const handleSubmitForm = (values: UpdateOrderStatusToConfirmFormValues) => {
    mutate(values)
  }

  return (
    <>
      <OrderDetailConfirmDrawerForm
        errors={formErrors}
        isLoading={isPending}
        onSubmit={(values) => {
          setValue('order_items', values.order_items)
        }}
      />
      <OrderDetailConfirmModalForm
        isLoading={isPending}
        onSubmit={(values) => {
          setValue('comment', values.comment)
          handleSubmit(handleSubmitForm)()
        }}
      />
    </>
  )
}
