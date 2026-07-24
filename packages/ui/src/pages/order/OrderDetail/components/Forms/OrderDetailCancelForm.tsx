import { useMemo } from 'react'
import { useParams } from 'next/navigation'
import { yupResolver } from '@hookform/resolvers/yup'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '#components/form-control'
import { Input } from '#components/input'
import { OptionType, ReactSelectAsync } from '#components/react-select'
import { TextArea } from '#components/text-area'
import { toast } from '#components/toast'
import { useLoadingPopupStore } from '#store/loading.store'
import { ErrorResponse } from '#types/common'
import { AxiosError } from 'axios'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { OrderCancelReasonEnum, OrderReasonEnum } from '../../../order.constant'
import { loadCancelReasons } from '../../../OrderCreate/order-create.service'
import { orderDetailCancelFormSchema } from '../../order-detail.schema'
import { updateOrderStatusToCancel } from '../../order-detail.service'
import useOrderDetailStore from '../../order-detail.store'
import { UpdateOrderStatusToCancelFormValues } from '../../order-detail.type'
import { OrderDetailModal } from '../OrderDetailModal'

export const OrderDetailCancelForm = () => {
  const params = useParams()
  const queryClient = useQueryClient()
  const { t, i18n } = useTranslation('orderDetail')

  const { isOpenCancelForm, setOpenCancelForm } = useOrderDetailStore()
  const { setLoadingPopup } = useLoadingPopupStore()

  const orderId = params.id as string

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<UpdateOrderStatusToCancelFormValues>({
    resolver: yupResolver(orderDetailCancelFormSchema(t)),
    defaultValues: {
      cancel_reason_id: null,
      other_reason: '',
      comment: '',
    },
  })

  const { mutate, isPending } = useMutation<
    unknown,
    AxiosError<ErrorResponse>,
    UpdateOrderStatusToCancelFormValues
  >({
    mutationKey: ['order', 'detail', 'cancel', orderId],
    mutationFn: (values) => updateOrderStatusToCancel(orderId, values),
    onSuccess: async () => {
      setLoadingPopup(true)
      setOpenCancelForm(false)
      toast.success({ description: t('message.cancel_order_success') })
      setTimeout(async () => {
        await queryClient.refetchQueries({
          queryKey: [i18n.language, 'order', 'detail', orderId],
        })
        setLoadingPopup(false)
        reset()
      }, 500)
    },
    onError: (error) => {
      const responseMessage = error.response?.data.message
      const message = responseMessage ?? t('message.cancel_order_failed')
      toast.danger({ description: message })
    },
  })

  const handleSubmitForm = (values: any) => {
    mutate(values)
  }

  const handleClose = () => {
    reset()
    setOpenCancelForm(false)
  }

  const isOtherReasonNeeded = useMemo(() => {
    return watch('cancel_reason_id')?.value === OrderCancelReasonEnum.Others
  }, [watch('cancel_reason_id')?.value])

  return (
    <OrderDetailModal
      title={t('modal.cancel_order.title')}
      open={isOpenCancelForm}
      onClose={handleClose}
      onSubmit={handleSubmit(handleSubmitForm)}
      isLoading={isPending}
    >
      <Controller
        name="cancel_reason_id"
        control={control}
        render={({ field, fieldState: { error } }) => (
          <FormControl className="ui-space-y-1.5">
            <FormLabel className="text-sm" required>
              {t('form.reason.label')}
            </FormLabel>
            <ReactSelectAsync
              loadOptions={loadCancelReasons}
              onChange={(option: OptionType) => {
                field.onChange(option)
                if (option?.value !== OrderReasonEnum.Others) {
                  setValue('other_reason', '')
                }
              }}
              additional={{ page: 1 }}
              placeholder={t('form.reason.placeholder')}
              menuPosition="fixed"
              disabled={isPending}
              error={Boolean(error?.message)}
            />
            {error?.message && (
              <FormErrorMessage className="ui-leading-none">
                {error.message}
              </FormErrorMessage>
            )}
          </FormControl>
        )}
      />

      {isOtherReasonNeeded && (
        <Controller
          name="other_reason"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <FormControl className="ui-space-y-1.5">
              <FormLabel className="text-sm" required={isOtherReasonNeeded}>
                {t('form.other_reason.label')}
              </FormLabel>
              <Input
                {...field}
                maxLength={255}
                placeholder={t('form.other_reason.placeholder')}
                className="ui-text-sm"
                disabled={isPending}
                error={Boolean(error?.message)}
              />
              {error?.message && (
                <FormErrorMessage className="ui-leading-none">
                  {error.message}
                </FormErrorMessage>
              )}
            </FormControl>
          )}
        />
      )}

      <Controller
        name="comment"
        control={control}
        render={({ field, fieldState: { error } }) => (
          <FormControl className="ui-space-y-0">
            <div className="ui-space-y-1.5">
              <FormLabel className="ui-text-sm" required>
                {t('form.comment.label')}
              </FormLabel>
              <TextArea
                {...field}
                placeholder={`${t('form.comment.placeholder')}...`}
                className="ui-text-sm"
                disabled={isPending}
                maxLength={255}
                style={{ height: 154 }}
                error={Boolean(error?.message)}
              />
            </div>
            {error?.message && (
              <FormErrorMessage className="ui-leading-none">
                {error.message}
              </FormErrorMessage>
            )}
          </FormControl>
        )}
      />
    </OrderDetailModal>
  )
}
