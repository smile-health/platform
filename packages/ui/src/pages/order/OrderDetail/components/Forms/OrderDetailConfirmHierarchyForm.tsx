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
  UpdateOrderHierarchyStatusToConfirmResponseError,
  UpdateOrderStatusToConfirmFormValues,
  UpdateOrderStatusToConfirmHierarchyFormValues,
} from '../../order-detail.type'
import { OrderDetailConfirmHierarchyDrawerForm } from './OrderDetailConfirmHierarchyDrawerForm'
import { OrderDetailConfirmHierarchyModalForm } from './OrderDetailConfirmHierarchyModalForm'

export const OrderDetailConfirmHierarchyForm = () => {
  const params = useParams()
  const queryClient = useQueryClient()
  const { t, i18n } = useTranslation(['common', 'orderDetail'])

  const orderId = params.id as string

  const {
    handleSubmit: submit,
    setValue,
    trigger,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<UpdateOrderStatusToConfirmFormValues>({
    defaultValues: {
      order_items: [],
      comment: '',
    },
  })

  const { setLoadingPopup } = useLoadingPopupStore()

  const { data, setOpenConfirmDrawerForm, setOpenConfirmModalForm } =
    useOrderDetailStore()

  const [formErrors, setFormErrors] =
    useState<UpdateOrderHierarchyStatusToConfirmResponseError>()

  const handleFieldResponseError = (
    responseErrors: UpdateOrderHierarchyStatusToConfirmResponseError
  ) => {
    setFormErrors(responseErrors)

    if (errors?.order_items) {
      Object.keys(errors.order_items).forEach((itemIndex) => {
        const item = errors.order_items?.[itemIndex as unknown as number]
        setError(`order_items.${Number(itemIndex)}.confirmed_qty`, {
          message: item?.confirmed_qty as unknown as string,
        })
      })
    }

    setOpenConfirmModalForm(false)
  }
  const { mutate, isPending } = useMutation<
    unknown,
    AxiosError<ErrorResponse>,
    UpdateOrderStatusToConfirmHierarchyFormValues
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
      const responseErrors =
        responseData?.errors as unknown as UpdateOrderHierarchyStatusToConfirmResponseError
      const message =
        responseData?.message ?? t('orderDetail:message.confirm_order_failed')

      handleFieldResponseError(responseErrors)
      toast.danger({ description: message })
    },
  })

  const confirmOrderDetail = (
    values: UpdateOrderStatusToConfirmHierarchyFormValues
  ) => {
    setFormErrors(undefined)
    clearErrors('order_items')

    const payload = {
      order_items: values?.order_items?.map((item) => ({
        material_id: item?.material_id,
        id: item?.id,
        confirmed_qty: item?.confirmed_qty ?? 0,
        children: item?.children?.length
          ? item?.children?.map((child) => {
              return {
                id: child?.id,
                confirmed_qty: child?.confirmed_qty ?? 0,
                material_id: child?.material?.id,
              }
            })
          : undefined,
      })),
      comment: values?.comment,
    }
    mutate(payload as UpdateOrderStatusToConfirmHierarchyFormValues)
  }

  return (
    <>
      <OrderDetailConfirmHierarchyDrawerForm
        key={data?.order_items?.length}
        isLoading={isPending}
        errors={formErrors}
        onSubmit={(values) => {
          setValue('order_items', values.order_items)
          trigger(`order_items`)
          clearErrors(`order_items`)
        }}
      />
      <OrderDetailConfirmHierarchyModalForm
        isLoading={isPending}
        onConfirm={({ comment }) => {
          setValue('comment', comment)
          setTimeout(() => {
            submit(confirmOrderDetail)()
          }, 500)
        }}
      />
    </>
  )
}
