import { useParams } from 'next/navigation'
import { yupResolver } from '@hookform/resolvers/yup'
import { parseDate } from '@internationalized/date'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { DatePicker } from '#components/date-picker'
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '#components/form-control'
import { Input } from '#components/input'
import { Radio, RadioGroup } from '#components/radio'
import { TextArea } from '#components/text-area'
import { toast } from '#components/toast'
import { useLoadingPopupStore } from '#store/loading.store'
import { ErrorResponse } from '#types/common'
import { parseValidDate } from '#utils/date'
import { AxiosError } from 'axios'
import dayjs from 'dayjs'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { DEFAULT_VALUE } from '../../../../material/utils/material.constants'
import { orderDetailShipFormSchema } from '../../order-detail.schema'
import { updateOrderStatusToShipped } from '../../order-detail.service'
import useOrderDetailStore from '../../order-detail.store'
import {
  OrderDetailShipFormValues,
  UpdateOrderStatusToShippedPayload,
  UpdateOrderStatusToShippedResponseError,
} from '../../order-detail.type'
import { OrderDetailModalV2 } from '../OrderDetailModalV2'

export const OrderDetailShipForm = () => {
  const params = useParams()
  const { t, i18n } = useTranslation(['common', 'orderDetail'])
  const queryClient = useQueryClient()

  const orderId = params.id as string

  const { setLoadingPopup } = useLoadingPopupStore()
  const { isOpenShipForm, setOpenShipForm, isLoading } = useOrderDetailStore()

  const { control, handleSubmit, reset, setError, trigger } =
    useForm<OrderDetailShipFormValues>({
      defaultValues: {
        actual_shipment_date: '',
        comment: null,
        estimated_date: null,
        taken_by_customer: 0,
        sales_ref: null,
      },
      resolver: yupResolver(orderDetailShipFormSchema(t, i18n.language)),
    })

  const handleFieldResponseError = (
    responseErrors: UpdateOrderStatusToShippedResponseError
  ) => {
    Object.entries(responseErrors).forEach(([key, errorMessages], index) => {
      const fieldKey = key as keyof OrderDetailShipFormValues
      const messages = errorMessages as any
      setError(fieldKey, { message: messages[0] })
    })
  }

  const { mutate, isPending } = useMutation<
    unknown,
    AxiosError<ErrorResponse<UpdateOrderStatusToShippedResponseError>>,
    OrderDetailShipFormValues
  >({
    mutationKey: ['order', 'detail', 'allocate'],
    mutationFn: (values) => {
      const payload: UpdateOrderStatusToShippedPayload = {
        actual_shipment_date: values.actual_shipment_date as string,
        comment: values.comment as string,
        estimated_date: values.estimated_date as string,
        sales_ref: values.sales_ref as string,
        taken_by_customer: Number(values.taken_by_customer) as number,
      }

      return updateOrderStatusToShipped(orderId, payload)
    },
    onSuccess: async () => {
      setLoadingPopup(true)
      setOpenShipForm(false)
      toast.success({
        description: t('orderDetail:message.ship_order_success'),
      })
      setTimeout(async () => {
        await queryClient.refetchQueries({
          queryKey: [i18n.language, 'order', 'detail', orderId],
        })
        setLoadingPopup(false)
        reset()
      }, 500)
    },
    onError: (error) => {
      const responseData = error.response?.data
      const responseErrors =
        responseData?.errors as UpdateOrderStatusToShippedResponseError
      const message =
        responseData?.message ?? t('orderDetail:message.ship_order_failed')

      toast.danger({ description: message })
      handleFieldResponseError(responseErrors)
    },
  })

  const handleClose = () => {
    setOpenShipForm(false)
    reset()
  }

  const handleSubmitForm = (values: OrderDetailShipFormValues) => {
    mutate(values)
  }

  return (
    <OrderDetailModalV2
      title={t('orderDetail:modal.ship_order.title')}
      open={isOpenShipForm}
      onClose={handleClose}
      onSubmit={handleSubmit(handleSubmitForm)}
      isLoading={isLoading || isPending}
      size="lg"
      submitButton={{
        label: t('orderDetail:button.ship_order'),
      }}
      cancelButton={{
        label: t('common:cancel'),
      }}
    >
      <Controller
        name="sales_ref"
        control={control}
        render={({ field, fieldState }) => (
          <FormControl className="ui-space-y-1.5">
            <FormLabel className="text-sm">
              {t('orderDetail:form.sales_ref.label')}
            </FormLabel>
            <Input
              {...field}
              value={field.value ?? ''}
              placeholder={t('orderDetail:form.sales_ref.placeholder')}
              className="ui-text-sm"
              error={Boolean(fieldState.error?.message)}
            />
            {fieldState.error?.message && (
              <FormErrorMessage className="ui-leading-none">
                {fieldState.error.message}
              </FormErrorMessage>
            )}
          </FormControl>
        )}
      />

      <Controller
        name="estimated_date"
        control={control}
        render={({
          field: { onChange, value, ...field },
          fieldState: { error },
        }) => {
          return (
            <FormControl className="ui-space-y-0">
              <div className="ui-space-y-1.5">
                <FormLabel className="ui-text-sm">
                  {t('orderDetail:form.estimated_date.label')}
                </FormLabel>
                <DatePicker
                  {...field}
                  id="estimated_date"
                  value={value ? parseValidDate(value) : null}
                  minValue={parseDate(dayjs(new Date()).format('YYYY-MM-DD'))}
                  onChange={(date) => {
                    const newDate = new Date(date?.toString())
                    onChange(dayjs(newDate).format('YYYY-MM-DD'))
                  }}
                  error={!!error?.message}
                />
                {error?.message && (
                  <FormErrorMessage>{error?.message}</FormErrorMessage>
                )}
              </div>
            </FormControl>
          )
        }}
      />

      <Controller
        name="taken_by_customer"
        control={control}
        render={({
          field: { onChange, value, ...field },
          fieldState: { error },
        }) => {
          return (
            <FormControl className="ui-space-y-0">
              <div className="ui-space-y-1.5">
                <FormLabel className="ui-text-sm">
                  {t('orderDetail:form.taken_by_customer.label')}
                </FormLabel>
                <RadioGroup className="ui-py-2.5">
                  <Radio
                    {...field}
                    label={t('common:yes')}
                    id="radio_taken_by_customer"
                    value={DEFAULT_VALUE.YES}
                    checked={Number(value) === DEFAULT_VALUE.YES}
                    onChange={onChange}
                  />
                  <Radio
                    {...field}
                    label={t('common:no')}
                    id="radio_not_taken_by_customer"
                    value={DEFAULT_VALUE.NO}
                    checked={Number(value) === DEFAULT_VALUE.NO}
                    onChange={onChange}
                  />
                </RadioGroup>
                {error?.message && (
                  <FormErrorMessage>{error?.message}</FormErrorMessage>
                )}
              </div>
            </FormControl>
          )
        }}
      />

      <Controller
        name="actual_shipment_date"
        control={control}
        render={({
          field: { onChange, value, ...field },
          fieldState: { error },
        }) => {
          return (
            <FormControl className="ui-space-y-0">
              <div className="ui-space-y-1.5">
                <FormLabel className="ui-text-sm" required>
                  {t('orderDetail:form.actual_shipment_date.label')}
                </FormLabel>
                <DatePicker
                  {...field}
                  id="actual_shipment_date"
                  value={value ? parseValidDate(value) : null}
                  maxValue={parseDate(dayjs(new Date()).format('YYYY-MM-DD'))}
                  onChange={(date) => {
                    const newDate = new Date(date?.toString())
                    onChange(dayjs(newDate).format('YYYY-MM-DD'))
                    trigger('actual_shipment_date')
                  }}
                  error={!!error?.message}
                />
                {error?.message && (
                  <FormErrorMessage>{error?.message}</FormErrorMessage>
                )}
              </div>
            </FormControl>
          )
        }}
      />

      <Controller
        name="comment"
        control={control}
        render={({ field, fieldState: { error } }) => (
          <FormControl className="ui-space-y-0">
            <div className="ui-space-y-1.5">
              <FormLabel className="ui-text-sm">
                {t('orderDetail:form.comment.label')}
              </FormLabel>
              <TextArea
                {...field}
                value={field.value ?? ''}
                placeholder={`${t('orderDetail:form.comment.placeholder')}...`}
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
    </OrderDetailModalV2>
  )
}
