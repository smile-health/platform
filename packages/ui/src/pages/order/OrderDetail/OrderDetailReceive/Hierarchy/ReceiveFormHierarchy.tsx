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
import {
  Controller,
  FormProvider,
  useFieldArray,
  useForm,
} from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { OrderDetailBox } from '../../components/OrderDetailBox'
import useOrderDetail from '../../hooks/useOrderDetail'
import { orderDetailReceivedHierarchyFormSchema } from '../../order-detail-hierarchy.schema'
import {
  ReceiveErrorResponse,
  ReceiveOrderItemHierarchy,
  ReceivePayload,
  updateOrderStatusToFulfilled,
} from '../receive.service'
import {
  ReceiveOrderItemsDrawerFormHierarchy,
  ReceiveOrderItemsDrawerFormHierarchyValues,
} from './ReceiveOrderItemsDrawerFormHierarchy'
import ReceiveOrderItemsModalFormHierarchy from './ReceiveOrderItemsModalFormHierarchy'
import {
  ReceiveOrderItemsTableHierarchy,
  ReceiveOrderItemsTableHierarchyData,
} from './ReceiveOrderItemsTableHierarchy'

export type ReceiveFormHierarchyValues = {
  order_items: ReceiveOrderItemsDrawerFormHierarchyValues[]
  fulfilled_at?: string
  comment?: string
}

export const ReceiveFormHierarchy = () => {
  const router = useSmileRouter()
  const params = useParams()
  const queryClient = useQueryClient()
  const { t, i18n } = useTranslation(['common', 'orderDetail'])

  const orderId = params.id as string

  const { mappedOrderItems, isLoading, orderDetailData, vendorStockData } =
    useOrderDetail(orderId)

  const { setLoadingPopup } = useLoadingPopupStore()

  const [selectedRow, setSelectedRow] =
    useState<Row<ReceiveOrderItemsTableHierarchyData>>()

  const methods = useForm<ReceiveFormHierarchyValues>({
    resolver: yupResolver(
      orderDetailReceivedHierarchyFormSchema(
        t,
        i18n?.language,
        orderDetailData?.actual_shipment_date ?? ''
      )
    ),
    mode: 'onChange',
  })

  const {
    control,
    reset,
    watch,
    handleSubmit,
    setValue,
    formState: { errors },
  } = methods

  const { order_items } = watch()

  const { mutate, isPending } = useMutation<
    unknown,
    AxiosError<ErrorResponse<ReceiveErrorResponse>>,
    ReceivePayload
  >({
    mutationKey: ['order', orderId, 'receive'],
    mutationFn: async (values) => updateOrderStatusToFulfilled(orderId, values),
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

  const handleRowClick = (row: Row<ReceiveOrderItemsTableHierarchyData>) => {
    setSelectedRow(row)
  }

  const handleOrderItemSubmit = (
    values: ReceiveOrderItemsDrawerFormHierarchyValues,
    rowIndex: number
  ) => {
    update(rowIndex, values)
  }

  const handleCancel = () => {
    router.push(`/v5/order/${orderId}`)
    setSelectedRow(undefined)
  }

  const handleReceiveFormHierarchySubmit = (
    values: ReceiveFormHierarchyValues
  ) => {
    const payload: ReceivePayload = {
      comment: values?.comment ?? '',
      fulfilled_at: values?.fulfilled_at ?? '',
      order_items: values?.order_items?.map((item) => ({
        id: item?.id,
        children: item?.children?.map((child) => ({
          id: child?.id,
          receives: child?.receives
            ?.filter((receive) => Boolean(receive?.received_qty))
            ?.map((receive) => ({
              stock_id: receive?._order_stock?.stock_id,
              received_qty: receive?.received_qty,
              fulfill_stock_status_id: receive?.fulfill_stock_status_id?.value
                ? receive?.fulfill_stock_status_id?.value
                : null,
            })),
        })),
      })) as ReceiveOrderItemHierarchy[],
    }
    setLoadingPopup(true)
    mutate(payload)
  }

  useEffect(() => {
    if (!isLoading && orderDetailData) {
      const orderItems: Array<ReceiveOrderItemsDrawerFormHierarchyValues> =
        mappedOrderItems?.map((item) => ({
          id: item.order_item.id,
          children:
            item?.order_item?.children?.map((child) => ({
              id: child?.id,
              receives:
                child?.order_stocks?.map((stock) => ({
                  stock_id: stock?.id,
                  received_qty: undefined,
                  fulfill_stock_status_id: null,
                  _order_item_children: child,
                  _order_stock: {
                    ...stock,
                    confirmed_qty: stock?.allocated_qty ?? 0,
                    order_item_id: child?.id ?? 0,
                    ordered_qty: child?.ordered_qty ?? 0,
                  },
                  _vendor_stock: item?.vendor_stock,
                  _customer: orderDetailData.customer,
                  _vendor: orderDetailData.vendor,
                  _activity: orderDetailData.activity,
                })) ?? [],
              _order_item_children: child,
              _vendor_stock: item?.vendor_stock,
              _customer: orderDetailData.customer,
              _vendor: orderDetailData.vendor,
              _activity: orderDetailData.activity,
            })) ?? [],
          _order_item: item?.order_item,
          _vendor_stock: vendorStockData?.find(
            (vendorItem) =>
              vendorItem?.material?.id === item?.order_item?.material?.id
          ),
          _customer: orderDetailData.customer,
          _vendor: orderDetailData.vendor,
          _activity: orderDetailData.activity,
        })) ?? []

      setValue('order_items', orderItems)
    }
  }, [isLoading, orderDetailData])

  return (
    <OrderDetailBox
      title={mappedOrderItems ? `Item (${mappedOrderItems.length})` : 'Item'}
      enableShowHide
    >
      <FormProvider {...methods}>
        <div className="ui-space-y-6">
          <ReceiveOrderItemsTableHierarchy
            onRowClick={handleRowClick}
            orderItems={order_items}
            isLoading={isLoading}
            errors={errors}
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
              type="submit"
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
              onClick={handleSubmit(handleReceiveFormHierarchySubmit)}
            >
              {t('orderDetail:button.receive')}
            </Button>
          </div>

          <ReceiveOrderItemsDrawerFormHierarchy
            isOpen={isDrawerOpen}
            selectedRow={selectedRow}
            isLoading={isLoading}
            onClose={() => setSelectedRow(undefined)}
            onSubmit={handleOrderItemSubmit}
          />
          <ReceiveOrderItemsModalFormHierarchy
            parentMaterial={selectedRow?.original?._order_item?.material}
          />
        </div>
      </FormProvider>
    </OrderDetailBox>
  )
}
