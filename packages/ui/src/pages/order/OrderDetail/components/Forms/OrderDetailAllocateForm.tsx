import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '#components/toast'
import { useLoadingPopupStore } from '#store/loading.store'
import { ErrorResponse } from '#types/common'
import { AxiosError } from 'axios'
import { useFieldArray, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import OrderCreateReturnModalNeedRelation from '../../../OrderCreateReturn/components/OrderCreateReturnModalNeedRelation'
import { updateOrderStatusToAllocated } from '../../order-detail.service'
import useOrderDetailStore from '../../order-detail.store'
import {
  OrderDetailAllocateFormValues,
  UpdateOrderStatusToAllocatedPayload,
  UpdateOrderStatusToFulfilledResponseError,
} from '../../order-detail.type'
import { OrderDetailAllocateDrawerForm } from './OrderDetailAllocateDrawerForm'
import { OrderDetailAllocateModalForm } from './OrderDetailAllocateModalForm'

export const OrderDetailAllocateForm = () => {
  const params = useParams()
  const queryClient = useQueryClient()
  const { t, i18n } = useTranslation(['common', 'orderDetail'])

  const [showModalNeedRelation, setShowModalNeedRelation] = useState(false)
  const [needRelationData, setNeedRelationData] = useState({
    header: '',
    message: '',
    list: [] as string[],
  })

  const {
    data: orderDetailData,
    setOpenAllocateDrawerForm,
    setOpenAllocateModalForm,
  } = useOrderDetailStore()
  const { setLoadingPopup } = useLoadingPopupStore()

  const orderId = params.id as string
  const defaultValues: OrderDetailAllocateFormValues = {
    order_items: [],
  }

  const {
    control,
    handleSubmit,
    getValues,
    setValue,
    reset,
    trigger,
    formState,
  } = useForm<OrderDetailAllocateFormValues>({
    defaultValues,
  })

  const { mutate } = useMutation<
    unknown,
    AxiosError<ErrorResponse<UpdateOrderStatusToFulfilledResponseError>>,
    OrderDetailAllocateFormValues
  >({
    mutationKey: ['order', 'detail', 'allocate'],
    mutationFn: (values) => {
      const payload: UpdateOrderStatusToAllocatedPayload = {
        order_items: values.order_items.map((item) => {
          const allocations = item.allocations ?? []
          return {
            id: item.id as number,
            allocations: allocations
              .filter(
                (allocation) =>
                  allocation.allocated_qty !== null &&
                  allocation.allocated_qty !== undefined
              )
              .map((allocation) => ({
                stock_id: allocation.stock_id as number,
                allocated_qty: allocation.allocated_qty as number,
                order_stock_status_id: allocation.order_stock_status_id
                  ?.value as number,
              })),
          }
        }),
      }

      return updateOrderStatusToAllocated(orderId, payload)
    },
    onSuccess: async () => {
      setLoadingPopup(true)
      setOpenAllocateDrawerForm(false)
      setOpenAllocateModalForm(false)
      toast.success({
        description: t('orderDetail:message.allocate_order_success'),
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
      const errors = responseData?.errors as unknown as Record<string, unknown>

      if (errors?.need_relation === true) {
        toast.danger({ description: responseData?.message })
        setNeedRelationData({
          header: errors.header as string,
          message: errors.message as string,
          list: errors.list as string[],
        })
        setShowModalNeedRelation(true)
        return
      }

      const message =
        responseData?.message ?? t('orderDetail:message.allocate_order_failed')
      toast.danger({ description: message })
    },
  })

  const { update } = useFieldArray({ control, name: 'order_items' })

  const handleSubmitForm = (values: OrderDetailAllocateFormValues) => {
    mutate(values)
  }

  const handleSubmitModalForm = (
    values: OrderDetailAllocateFormValues['order_items'][number],
    rowIndex: number
  ) => {
    update(rowIndex, values)
    trigger()
  }

  useEffect(() => {
    if (orderDetailData?.order_items) {
      const orderItems = orderDetailData?.order_items.map((orderItem) => ({
        id: orderItem.id,
        allocations: undefined,
      }))
      setValue('order_items', orderItems)
    }
  }, [orderDetailData])

  return (
    <>
      <OrderDetailAllocateDrawerForm
        errors={formState.errors}
        values={getValues('order_items')}
        isLoading={false}
        onSubmit={handleSubmit(handleSubmitForm)}
        onReset={() => reset(defaultValues)}
      />
      <OrderDetailAllocateModalForm
        values={getValues('order_items')}
        onSubmit={handleSubmitModalForm}
        isLoading={false}
      />
      <OrderCreateReturnModalNeedRelation
        open={showModalNeedRelation}
        setOpen={setShowModalNeedRelation}
        header={needRelationData.header}
        message={needRelationData.message}
        list={needRelationData.list}
      />
    </>
  )
}
