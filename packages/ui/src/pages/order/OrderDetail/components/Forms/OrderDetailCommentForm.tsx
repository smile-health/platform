import { useEffect } from 'react'
import { useParams } from 'next/navigation'
import { yupResolver } from '@hookform/resolvers/yup'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '#components/button'
import { FormControl, FormErrorMessage } from '#components/form-control'
import { TextArea } from '#components/text-area'
import { toast } from '#components/toast'
import { useLoadingPopupStore } from '#store/loading.store'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import i18n from '../../../../../locales/i18n'
import { orderDetailCommentFormSchema } from '../../order-detail.schema'
import { createOrderDetailComment } from '../../order-detail.service'
import useOrderDetailStore from '../../order-detail.store'
import { CreateOrderDetailCommentPayload } from '../../order-detail.type'

export type OrderDetailCommentFormValues = CreateOrderDetailCommentPayload

export const OrderDetailCommentForm = () => {
  const params = useParams()
  const queryClient = useQueryClient()
  const { t } = useTranslation('orderDetail')
  const { isLoading } = useOrderDetailStore()
  const { setLoadingPopup } = useLoadingPopupStore()

  const orderId = params?.id as string

  const { control, trigger, handleSubmit, setValue, formState, watch } =
    useForm<OrderDetailCommentFormValues>({
      resolver: yupResolver(orderDetailCommentFormSchema(t)),
      defaultValues: {
        comment: undefined,
      },
    })

  const { comment } = watch()

  const handleSubmitSuccess = async () => {
    toast.success({
      description: t('message.comment_success'),
    })
    await queryClient.refetchQueries({
      queryKey: [i18n.language, 'order', 'detail', orderId],
    })
    setLoadingPopup(false)
    setValue('comment', '')
  }

  const handleSubmitError = () => {
    toast.danger({
      description: t('message.comment_failed'),
    })
    setLoadingPopup(false)
  }

  const { mutate } = useMutation({
    mutationKey: ['order', 'detail', orderId, 'comment'],
    mutationFn: (values: OrderDetailCommentFormValues) =>
      createOrderDetailComment(orderId, values),
    onSuccess: handleSubmitSuccess,
    onError: handleSubmitError,
  })

  const handleSubmitComment = (values: OrderDetailCommentFormValues) => {
    setLoadingPopup(true)
    mutate(values)
  }

  useEffect(() => {
    if (formState.isSubmitted) setTimeout(async () => await trigger(), 0)
  }, [i18n.language, formState.isSubmitted])

  return (
    <form className="ui-flex ui-gap-2">
      <Controller
        name="comment"
        control={control}
        render={({ field, fieldState: { error } }) => (
          <FormControl className="ui-space-y-0 ui-w-full">
            <TextArea
              {...field}
              placeholder={`${t('form.comment.placeholder')}...`}
              className="ui-min-h-[80px] ui-text-sm"
              disabled={isLoading}
              error={Boolean(error?.message)}
            />
            {error?.message && (
              <FormErrorMessage>{error.message}</FormErrorMessage>
            )}
          </FormControl>
        )}
      />
      <Button
        type="submit"
        variant="outline"
        size="sm"
        className="ui-min-w-[150px]"
        disabled={isLoading || !comment}
        onClick={handleSubmit(handleSubmitComment)}
      >
        {t('button.submit_comment')}
      </Button>
    </form>
  )
}
