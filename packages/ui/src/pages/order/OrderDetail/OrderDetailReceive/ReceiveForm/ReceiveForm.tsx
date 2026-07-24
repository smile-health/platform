import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { yupResolver } from '@hookform/resolvers/yup'
import { parseDate } from '@internationalized/date'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Row } from '@tanstack/react-table'
import { Button } from '#components/button'
import { DatePicker } from '#components/date-picker'
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '#components/form-control'
import { TextArea } from '#components/text-area'
import { toast } from '#components/toast'
import useSmileRouter from '#hooks/useSmileRouter'
import { useLoadingPopupStore } from '#store/loading.store'
import { ErrorResponse } from '#types/common'
import { parseValidDate } from '#utils/date'
import { AxiosError } from 'axios'
import dayjs from 'dayjs'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { OrderTypeEnum } from '../../../order.constant'
import { OrderDetailBox } from '../../components/OrderDetailBox'
import useOrderDetail from '../../hooks/useOrderDetail'
import { receiveSchema } from '../receive.schema'
import {
  ReceiveErrorResponse,
  ReceivePayload,
  updateOrderStatusToFulfilled,
} from '../receive.service'
import {
  ReceiveOrderItemsDrawerForm,
  ReceiveOrderItemsDrawerFormValues,
} from '../ReceiveOrderItemsDrawerForm/ReceiveOrderItemsDrawerForm'
import {
  ReceiveOrderItemsTable,
  ReceiveOrderItemsTableData,
} from '../ReceiveOrderItemsTable/ReceiveOrderItemsTable'

export type ReceiveFormValues = {
  order_items?: ReceiveOrderItemsDrawerFormValues[]
  fulfilled_at?: string
  comment?: string
}

export const ReceiveForm = () => {
  const router = useSmileRouter()
  const params = useParams()
  const queryClient = useQueryClient()
  const { t, i18n } = useTranslation(['common', 'orderDetail'])

  const orderId = params.id as string

  const { mappedOrderItems, isLoading, orderDetailData } =
    useOrderDetail(orderId)

  const isNonRegularOrder = [
    OrderTypeEnum.Distribution,
    OrderTypeEnum.CentralDistribution,
    OrderTypeEnum.Return,
  ].includes(orderDetailData?.type as OrderTypeEnum)

  const { setLoadingPopup } = useLoadingPopupStore()

  const [selectedRow, setSelectedRow] =
    useState<Row<ReceiveOrderItemsTableData>>()

  const {
    control,
    reset,
    getValues,
    handleSubmit,
    setValue,
    trigger,
    formState,
    clearErrors,
  } = useForm<ReceiveFormValues>({
    mode: 'onChange',
    resolver: yupResolver(
      receiveSchema(
        t,
        i18n.language,
        orderDetailData?.actual_shipment_date ?? ''
      )
    ),
  })

  const { mutate, isPending } = useMutation<
    unknown,
    AxiosError<ErrorResponse<ReceiveErrorResponse>>,
    ReceiveFormValues
  >({
    mutationKey: ['order', orderId, 'receive'],
    mutationFn: async (values) => {
      const orderItemsPayload =
        values?.order_items?.map((item) => {
          const receives = item?.receives ?? []
          return {
            id: item.id as number,
            receives: receives.map((receive) => ({
              stock_id: receive.stock_id,
              received_qty: Number(receive.received_qty),
              fulfill_stock_status_id: receive.fulfill_stock_status_id?.value,
            })),
          }
        }) ?? []

      const payload: ReceivePayload = {
        order_items: orderItemsPayload,
        fulfilled_at: values?.fulfilled_at ?? '',
        comment: values?.comment ?? '',
      }

      return updateOrderStatusToFulfilled(orderId, payload)
    },
    onSuccess: async () => {
      setLoadingPopup(true)
      toast.success({
        description: t('orderDetail:message.receive_order_success'),
      })
      setTimeout(async () => {
        await queryClient.refetchQueries({
          queryKey: [i18n.language, 'order', 'detail', orderId],
        })
        setLoadingPopup(false)
        reset()
      }, 500)
      router.push('/v5/order/' + orderId)
    },
    onError: (error: AxiosError) => {
      setLoadingPopup(false)
      const { message, errors } = error.response?.data as {
        message: string
        errors: {
          [key: string]: string[]
        }
      }
      const messageErrorFulfilledAt = errors?.fulfilled_at?.[0]
      if (messageErrorFulfilledAt) {
        toast.danger({ description: messageErrorFulfilledAt })
        return
      }
      toast.danger({
        description: message ?? t('orderDetail:message.receive_order_failed'),
      })
    },
  })

  const { update } = useFieldArray({ name: 'order_items', control })
  const isDrawerOpen = Boolean(selectedRow)

  const handleRowClick = (row: Row<ReceiveOrderItemsTableData>) => {
    setSelectedRow(row)
  }

  const handleOrderItemSubmit = (
    values: ReceiveOrderItemsDrawerFormValues,
    rowIndex: number
  ) => {
    update(rowIndex, values)
    trigger(`order_items.${rowIndex}.receives`)
  }

  const handleCancel = () => {
    router.push(`/v5/order/${orderId}`)
    setSelectedRow(undefined)
  }

  const handleReceiveFormSubmit = (values: ReceiveFormValues) => {
    setLoadingPopup(true)
    mutate(values)
  }

  useEffect(() => {
    if (!isLoading) {
      const orderItems: Array<ReceiveOrderItemsDrawerFormValues> =
        mappedOrderItems?.map((item) => ({
          id: item.order_item.id,
          receives:
            item?.order_item?.order_stocks.map((stock) => ({
              stock_id: stock.stock_id,
              received_qty: null,
              fulfill_stock_status_id: null,
              _order_item_stock: stock ?? undefined,
            })) ?? [],
          _order_item: item?.order_item,
          _vendor_stock: item?.vendor_stock,
        })) ?? []

      setValue('order_items', orderItems)
    }
  }, [isLoading])

  return (
    <OrderDetailBox
      title={mappedOrderItems ? `Item (${mappedOrderItems.length})` : 'Item'}
      enableShowHide
    >
      <form className="ui-space-y-6">
        <ReceiveOrderItemsTable
          errors={formState.errors}
          onRowClick={handleRowClick}
          orderItems={getValues('order_items') ?? []}
          clearErrors={clearErrors}
          isLoading={isLoading}
        />

        <div className="ui-space-y-6 ui-w-1/2">
          <Controller
            name="fulfilled_at"
            control={control}
            render={({
              field: { onChange, value, ...field },
              fieldState: { error },
            }) => {
              return (
                <FormControl className="ui-space-y-0">
                  <div className="ui-space-y-1.5">
                    <FormLabel className="ui-text-sm" required>
                      {t('orderDetail:form.received_date.label')}
                    </FormLabel>
                    <DatePicker
                      {...field}
                      id="fulfilled_at"
                      value={value ? parseValidDate(value) : null}
                      maxValue={parseDate(
                        dayjs(new Date()).format('YYYY-MM-DD')
                      )}
                      minValue={parseDate(
                        dayjs(orderDetailData?.actual_shipment_date).format(
                          'YYYY-MM-DD'
                        )
                      )}
                      onChange={(date) => {
                        const newDate = new Date(date?.toString() ?? '')
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
            name="comment"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <FormControl className="ui-space-y-0 ui-w-full">
                <div className="ui-space-y-1.5">
                  <FormLabel className="ui-text-sm">
                    {t('orderDetail:form.comment.label')}
                  </FormLabel>
                  <TextArea
                    {...field}
                    placeholder={`${t('orderDetail:form.comment.placeholder')}...`}
                    className="ui-min-h-[150px] ui-text-sm"
                    disabled={isLoading}
                    error={Boolean(error?.message)}
                  />
                </div>
                {error?.message && (
                  <FormErrorMessage>{error.message}</FormErrorMessage>
                )}
              </FormControl>
            )}
          />
        </div>

        <div className="ui-flex ui-justify-end ui-gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="ui-min-w-[100px]"
            disabled={isLoading || isPending}
            onClick={handleCancel}
          >
            {t('common:cancel')}
          </Button>
          <Button
            type="submit"
            variant="solid"
            size="sm"
            className="ui-min-w-[100px]"
            disabled={isLoading || isPending}
            onClick={handleSubmit(handleReceiveFormSubmit)}
          >
            {t('orderDetail:button.receive')}
          </Button>
        </div>
      </form>

      <ReceiveOrderItemsDrawerForm
        isNonRegularOrder={isNonRegularOrder}
        isOpen={isDrawerOpen}
        selectedRow={selectedRow}
        isLoading={isLoading}
        onClose={() => setSelectedRow(undefined)}
        onSubmit={handleOrderItemSubmit}
      />
    </OrderDetailBox>
  )
}
