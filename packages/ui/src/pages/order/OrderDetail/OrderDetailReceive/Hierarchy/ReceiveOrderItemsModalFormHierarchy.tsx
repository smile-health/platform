import React, { Fragment, useCallback, useEffect, useMemo } from 'react'
import { yupResolver } from '@hookform/resolvers/yup'
import { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '#components/data-table'
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '#components/form-control'
import { InputNumberV2 } from '#components/input-number-v2'
import { Stock } from '#types/stock'
import { parseDateTime } from '#utils/date'
import { numberFormatter } from '#utils/formatter'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { OrderDetailModal } from '../../components/OrderDetailModal'
import { receiveModalChildSchema } from '../../order-detail-hierarchy.schema'
import useOrderDetailStore from '../../order-detail.store'
import {
  OrderDetailChildren,
  OrderDetailItemMaterial,
  OrderDetailResponse,
  OrderDetailStock,
} from '../../order-detail.type'
import { ReceiveOrderItemStocks } from './ReceiveOrderItemsDrawerFormHierarchy'

export type ReceiveOrderItemsModalFormHierarchyValues = {
  id: number | undefined
  receives?: Array<ReceiveOrderItemStocks>
}

export type ReceiveOrderItemsModalFormHierarchyProps = {
  data: Array<ReceiveOrderItemStocks>
  stockIndex?: number
  isOpenModal: boolean
  material?: string
  activity?: string
  stock_on_hand?: number
  available_stock?: number
  onSubmit: (
    values: ReceiveOrderItemsModalFormHierarchyValues,
    rowIndex?: number
  ) => void
}

export type ColumnType = ColumnDef<{
  stock_id: number
  received_qty: number | null
  fulfill_stock_status_id: number | null
  _order_stock: OrderDetailStock
  _vendor_stock: Stock
  _customer: OrderDetailResponse['customer']
  _vendor: OrderDetailResponse['vendor']
  _activity: OrderDetailResponse['activity']
  _order_item_children?: OrderDetailChildren
}>

const ReceiveOrderItemsModalFormHierarchy = ({
  parentMaterial,
}: {
  parentMaterial?: OrderDetailItemMaterial
}) => {
  const { t, i18n } = useTranslation(['common', 'orderDetail'])
  const {
    setIsReceiveOrderItemsModalForm,
    isReceiveOrderItemsModalForm,
    receiveOrderItemsModalForm,
  } = useOrderDetailStore()

  const data = receiveOrderItemsModalForm?.data
  const stockIndex = receiveOrderItemsModalForm?.stockIndex
  const {
    control,
    watch,
    reset,
    trigger,
    handleSubmit,
    formState: { errors },
  } = useForm<ReceiveOrderItemsModalFormHierarchyValues>({
    resolver: yupResolver(
      receiveModalChildSchema(t, i18n?.language, parentMaterial)
    ),
    mode: 'onChange',
    defaultValues: {
      id: stockIndex,
      receives: data,
    },
  })

  const handleClose = () => {
    setIsReceiveOrderItemsModalForm(false, undefined)
  }

  const handleSubmitForm = async (
    values: ReceiveOrderItemsModalFormHierarchyValues
  ) => {
    const isValid = await trigger()
    if (!isValid) return

    receiveOrderItemsModalForm?.onSubmit(values, stockIndex)
    handleClose()
  }

  const columnsBatchSchema: ColumnType[] = useMemo(
    () => [
      {
        accessorKey: 'no',
        header: 'No',
        size: 50,
        cell: ({ row }) => row?.index + 1,
      },
      {
        accessorKey: 'batch_info',
        header: t('orderDetail:table.column.batch_info'),
        size: 250,

        cell: ({ row }) => {
          return (
            <div className="ui-flex ui-flex-col ui-justify-center">
              <p className="ui-font-bold">
                {row?.original?._order_stock?.batch?.code ?? '-'}
              </p>
              <p>
                {t('orderDetail:table.trademark.batch.production_date', {
                  date:
                    parseDateTime(
                      row?.original?._order_stock?.batch?.production_date,
                      'YYYY-MM-DD'
                    ) ?? '-',
                })}
              </p>
              <p>
                {t('orderDetail:table.trademark.batch.manufacturer', {
                  name:
                    row?.original?._order_stock?.batch?.manufacture_name ?? '-',
                })}
              </p>
              <p>
                {t('orderDetail:table.trademark.batch.expired_date', {
                  date:
                    parseDateTime(
                      row?.original?._order_stock?.batch?.expired_date,
                      'YYYY-MM-DD'
                    ) ?? '-',
                })}
              </p>
            </div>
          )
        },
      },
      {
        accessorKey: 'shipped',
        header: t('orderDetail:table.column.shipped'),
        size: 100,
        cell: ({ row }) =>
          numberFormatter(
            row.original?._order_stock?.shipped_qty,
            i18n.language
          ) ?? '-',
      },
      {
        accessorKey: 'quantity',
        header: t('orderDetail:table.column.quantity'),
        size: 500,
        cell: ({ row }) => {
          return (
            <Controller
              control={control}
              name={`receives.${row?.index}.received_qty`}
              render={({
                field: { onChange, value },
                fieldState: { error },
              }) => {
                return (
                  <Fragment>
                    <InputNumberV2
                      key={`received-qty-${row.original.stock_id}`}
                      defaultValue={value || ''}
                      placeholder={t(
                        'orderDetail:table.trademark.column.received_qty.placeholder'
                      )}
                      onValueChange={(e) => {
                        onChange(e?.floatValue)
                      }}
                      error={!!error?.message}
                      onPaste={(e) => {
                        onChange(
                          Number(
                            e.clipboardData.getData('text').replaceAll('.', '')
                          )
                        )
                      }}
                    />
                    {error?.message && (
                      <FormErrorMessage className="ui-mt-2">
                        {error?.message}
                      </FormErrorMessage>
                    )}
                  </Fragment>
                )
              }}
            />
          )
        },
      },
    ],
    [errors, receiveOrderItemsModalForm]
  )

  const handleDefaultValues = useCallback(() => {
    if (data) {
      reset({
        id: stockIndex,
        receives: data,
      })
    }
  }, [data, reset])

  useEffect(() => {
    handleDefaultValues()
  }, [data])

  return (
    <OrderDetailModal
      size="2xl"
      title={t('orderDetail:modal.input_qty')}
      open={isReceiveOrderItemsModalForm}
      onClose={handleClose}
      onSubmit={handleSubmit(handleSubmitForm)}
      error={errors?.receives?.root?.message ?? errors?.receives?.message}
      submitButton={{
        label: t('common:save'),
        disabled: Boolean(errors.receives),
      }}
    >
      <div className="ui-flex ui-flex-rows ui-space-x-5">
        <FormControl className="ui-space-y-1 ui-max-w-3/4">
          <FormLabel className="text-sm">Material</FormLabel>
          <div className="ui-text-dark-blue ui-font-bold">
            {receiveOrderItemsModalForm?.material}
          </div>
        </FormControl>
        <FormControl className="ui-space-y-1 ui-w-1/4">
          <FormLabel className="text-sm">
            {t('orderDetail:data.activity')}
          </FormLabel>
          <div className="ui-text-dark-blue ui-font-bold ui-flex ui-items-baseline ui-gap-1">
            {receiveOrderItemsModalForm?.activity}
          </div>
        </FormControl>
      </div>
      <DataTable
        data={watch('receives')}
        columns={columnsBatchSchema}
        isSticky
        className="ui-overflow-y-auto ui-max-h-[50vh] !ui-bg-white"
      />
    </OrderDetailModal>
  )
}

export default ReceiveOrderItemsModalFormHierarchy
