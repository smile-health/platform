import { useEffect } from 'react'
import { yupResolver } from '@hookform/resolvers/yup'
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '#components/form-control'
import { TextArea } from '#components/text-area'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { orderDetailCommentFormSchema as orderDetailConfirmModalFormSchema } from '../../order-detail.schema'
import useOrderDetailStore from '../../order-detail.store'
import { UpdateOrderStatusToConfirmHierarchyFormValues } from '../../order-detail.type'
import { OrderDetailModal } from '../OrderDetailModal'

type OrderDetailConfirmHierarchyModalFormProps = {
  onConfirm: (values: UpdateOrderStatusToConfirmHierarchyFormValues) => void
  isLoading?: boolean
}

export const OrderDetailConfirmHierarchyModalForm = ({
  onConfirm,
  isLoading,
}: OrderDetailConfirmHierarchyModalFormProps) => {
  const { t } = useTranslation('orderDetail')
  const { isOpenConfirmModalForm, setOpenConfirmModalForm } =
    useOrderDetailStore()

  const { control, handleSubmit, reset } =
    useForm<UpdateOrderStatusToConfirmHierarchyFormValues>({
      resolver: yupResolver(orderDetailConfirmModalFormSchema(t)),
      defaultValues: {
        comment: '',
      },
    })

  const handleSubmitForm = (
    values: UpdateOrderStatusToConfirmHierarchyFormValues
  ) => {
    onConfirm(values)
  }

  const handleClose = () => {
    reset()
    setOpenConfirmModalForm(false)
  }

  useEffect(
    () => () => {
      reset()
    },
    []
  )

  return (
    <OrderDetailModal
      title={t('modal.confirm_order.title')}
      open={isOpenConfirmModalForm}
      onClose={handleClose}
      onSubmit={handleSubmit(handleSubmitForm)}
      isLoading={isLoading}
    >
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
