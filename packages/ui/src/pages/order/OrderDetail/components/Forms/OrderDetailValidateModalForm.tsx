import { useEffect } from 'react'
import { yupResolver } from '@hookform/resolvers/yup'
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '#components/form-control'
import { Input } from '#components/input'
import { TextArea } from '#components/text-area'
import { Controller, FieldErrors, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { orderDetailCommentFormSchema as orderDetailValidateModalFormSchema } from '../../order-detail.schema'
import useOrderDetailStore from '../../order-detail.store'
import { UpdateOrderStatusToPendingFromDraftFormValues } from '../../order-detail.type'
import { OrderDetailModal } from '../OrderDetailModal'

type OrderDetailValidateModalFormProps = {
  errors: FieldErrors<UpdateOrderStatusToPendingFromDraftFormValues>
  isLoading?: boolean
  onSubmit: (values: UpdateOrderStatusToPendingFromDraftFormValues) => void
}

export const OrderDetailValidateModalForm = ({
  onSubmit,
  isLoading,
  errors,
}: OrderDetailValidateModalFormProps) => {
  const { t } = useTranslation('orderDetail')

  const { isOpenValidateModalForm, setOpenValidateModalForm } =
    useOrderDetailStore()

  const { control, handleSubmit, reset } =
    useForm<UpdateOrderStatusToPendingFromDraftFormValues>({
      resolver: yupResolver(orderDetailValidateModalFormSchema(t)),
      defaultValues: {
        comment: '',
      },
    })

  const handleSubmitForm = (
    values: UpdateOrderStatusToPendingFromDraftFormValues
  ) => {
    onSubmit(values)
  }

  const handleClose = () => {
    reset()
    setOpenValidateModalForm(false)
  }

  useEffect(
    () => () => {
      reset()
    },
    []
  )

  return (
    <OrderDetailModal
      title={t('modal.validate_order.title')}
      open={isOpenValidateModalForm}
      onClose={handleClose}
      onSubmit={handleSubmit(handleSubmitForm)}
      isLoading={isLoading}
    >
      <Controller
        name="letter_number"
        control={control}
        render={({ field }) => (
          <FormControl className="ui-space-y-2">
            <div className="ui-space-y-1.5">
              <FormLabel className="ui-text-sm" required>
                {t('form.letter_number.label')}
              </FormLabel>
              <Input
                {...field}
                placeholder={t('form.letter_number.placeholder')}
                className="ui-text-sm"
                disabled={isLoading}
                error={Boolean(errors?.letter_number?.message)}
              />
            </div>
            {errors?.letter_number?.message && (
              <FormErrorMessage className="ui-leading-none">
                {errors.letter_number.message}
              </FormErrorMessage>
            )}
          </FormControl>
        )}
      />
      <Controller
        name="comment"
        control={control}
        render={({ field, fieldState: { error } }) => (
          <FormControl className="ui-space-y-0">
            <div className="ui-space-y-1.5">
              <FormLabel className="ui-text-sm">
                {t('form.comment.label')}
              </FormLabel>
              <TextArea
                {...field}
                placeholder={`${t('form.comment.placeholder')}...`}
                className="ui-text-sm"
                disabled={isLoading}
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
