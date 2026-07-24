import { useState } from 'react'
import { useParams } from 'next/navigation'
import { yupResolver } from '@hookform/resolvers/yup'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '#components/toast'
import { useLoadingPopupStore } from '#store/loading.store'
import { ErrorResponse } from '#types/common'
import { AxiosError } from 'axios'
import { TFunction } from 'i18next'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { updateOrderStatusToPendingFromDraftFormSchema } from '../../order-detail-hierarchy.schema'
import { updateOrderStatusToPendingFromDraft } from '../../order-detail.service'
import useOrderDetailStore from '../../order-detail.store'
import {
  UpdateOrderStatusToPendingFromDraftFormValues,
  UpdateOrderStatusToPendingFromDraftResponseError,
} from '../../order-detail.type'
import { OrderDetailValidateDrawerForm } from './OrderDetailValidateDrawerForm'
import { OrderDetailValidateModalForm } from './OrderDetailValidateModalForm'

export const OrderDetailValidateForm = () => {
  const params = useParams()
  const queryClient = useQueryClient()
  const { t, i18n } = useTranslation(['common', 'orderDetail'])

  const orderId = params.id as string

  const {
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<UpdateOrderStatusToPendingFromDraftFormValues>({
    resolver: yupResolver(
      updateOrderStatusToPendingFromDraftFormSchema(t, i18n.language)
    ),
    defaultValues: {
      order_items: [],
      comment: '',
      letter_number: '',
    },
  })

  const { setLoadingPopup } = useLoadingPopupStore()

  const { setOpenValidateDrawerForm, setOpenValidateModalForm } =
    useOrderDetailStore()

  const [formErrors, setFormErrors] =
    useState<UpdateOrderStatusToPendingFromDraftResponseError>()

  const handleFieldResponseError = (
    responseErrors?: UpdateOrderStatusToPendingFromDraftResponseError
  ) => {
    setFormErrors(responseErrors)
    setOpenValidateModalForm(!responseErrors?.order_items)
  }

  const { mutate, isPending } = useMutation<
    unknown,
    AxiosError<ErrorResponse<UpdateOrderStatusToPendingFromDraftResponseError>>,
    UpdateOrderStatusToPendingFromDraftFormValues
  >({
    mutationKey: ['order', 'detail', 'validate', orderId],
    mutationFn: (values) =>
      updateOrderStatusToPendingFromDraft(orderId, values),
    onSuccess: async () => {
      setLoadingPopup(true)
      setOpenValidateDrawerForm(false)
      setOpenValidateModalForm(false)
      toast.success({
        description: t('orderDetail:message.validate_order_success'),
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
        responseData?.message ?? t('orderDetail:message.validate_order_failed')

      handleFieldResponseError(responseErrors)
      toast.danger({ description: message })
    },
  })

  const handleSubmitForm = (
    values: UpdateOrderStatusToPendingFromDraftFormValues
  ) => {
    mutate(values)
  }

  return (
    <>
      <OrderDetailValidateDrawerForm
        errors={formErrors}
        isLoading={isPending}
        onSubmit={(values) => {
          setValue('order_items', values.order_items)
        }}
      />
      <OrderDetailValidateModalForm
        errors={errors}
        isLoading={isPending}
        onSubmit={(values) => {
          setValue('letter_number', values.letter_number)
          setValue('comment', values.comment)
          handleSubmit(handleSubmitForm)()
        }}
      />
    </>
  )
}
