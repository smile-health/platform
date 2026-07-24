import React, { Fragment, useCallback, useMemo } from 'react'
import { yupResolver } from '@hookform/resolvers/yup'
import { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '#components/data-table'
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '#components/form-control'
import { InputNumberV2 } from '#components/input-number-v2'
import { ProgramEnum } from '#constants/program'
import { StockDetailStock } from '#types/stock'
import { parseDateTime } from '#utils/date'
import { numberFormatter } from '#utils/formatter'
import { getProgramStorage } from '#utils/storage/program'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { OrderDetailModal } from '../../components/OrderDetailModal'
import { orderDetailAllocateBatchModalHierarchyFormSchema } from '../../order-detail-hierarchy.schema'
import useOrderDetailStore from '../../order-detail.store'
import {
  OrderDetailAllocateChildrenFormValuesOrderItemHierarchyAllocation,
  OrderDetailItemStockCustomerVendor,
} from '../../order-detail.type'

export type AllocatedFormBatchModalValues =
  Array<OrderDetailAllocateChildrenFormValuesOrderItemHierarchyAllocation>
const OrderHierarchyAllocatedFormBatchModal = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation(['common', 'orderDetail'])
  type AllocatedFormBatchModalForm = {
    allocations?: AllocatedFormBatchModalValues
  }
  const program = getProgramStorage()
  const isImmunization = program?.key === ProgramEnum.Immunization
  const {
    isOpenAllocateBatchForm,
    allocateBatchFormSelectedRow,
    setOpenAllocateBatchForm,
    allocateBatchFormSelectedRowActivity,
    allocateBatchFormSelectedRowMaterial,
    allocateBatchFormSubmit,
    allocateBatchFormSelectedRowIndex,
  } = useOrderDetailStore()
  const {
    control,
    watch,
    handleSubmit,
    reset,
    trigger,
    formState: { errors },
  } = useForm<AllocatedFormBatchModalForm>({
    resolver: yupResolver(
      orderDetailAllocateBatchModalHierarchyFormSchema(
        t,
        language,
        isImmunization
      )
    ),
    mode: 'onChange',
    defaultValues: {
      allocations: allocateBatchFormSelectedRow,
    },
  })

  const allocationInputs = watch('allocations') ?? []

  const handleClose = () => {
    setOpenAllocateBatchForm(
      false,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined
    )
  }

  const handleSubmitForm = (values: AllocatedFormBatchModalForm) => {
    if (allocateBatchFormSubmit) {
      allocateBatchFormSubmit(
        values?.allocations,
        allocateBatchFormSelectedRowIndex
      )
      trigger('allocations')
    }
  }

  const handleDefaultValues = useCallback(() => {
    if (allocateBatchFormSelectedRow) {
      reset({
        allocations: allocateBatchFormSelectedRow,
      })
    }
    trigger('allocations')
  }, [allocateBatchFormSelectedRow, reset, trigger])

  useMemo(() => {
    handleDefaultValues()
  }, [allocateBatchFormSelectedRow])

  const columnsBatchSchema: ColumnDef<{
    stock_id: number
    allocated_qty: number | undefined
    confirmed_qty: number | undefined
    _stock_detail: StockDetailStock
    _stock_customer: OrderDetailItemStockCustomerVendor
    _stock_vendor: OrderDetailItemStockCustomerVendor
  }>[] = useMemo(
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
                {row?.original?._stock_detail?.batch?.code ?? '-'}
              </p>
              <p>
                {t('orderDetail:table.trademark.batch.production_date', {
                  date:
                    parseDateTime(
                      row?.original?._stock_detail?.batch?.production_date,
                      'YYYY-MM-DD'
                    ) ?? '-',
                })}
              </p>
              <p>
                {t('orderDetail:table.trademark.batch.manufacturer', {
                  name:
                    row?.original?._stock_detail?.batch?.manufacture?.name ??
                    '-',
                })}
              </p>
              <p>
                {t('orderDetail:table.trademark.batch.expired_date', {
                  date:
                    parseDateTime(
                      row?.original?._stock_detail?.batch?.expired_date,
                      'YYYY-MM-DD'
                    ) ?? '-',
                })}
              </p>
            </div>
          )
        },
      },
      {
        accessorKey: 'stock_on_hand',
        header: t('orderDetail:table.column.stock_on_hand'),
        size: 100,
        cell: ({ row }) => {
          const value = row?.original?._stock_detail?.qty ?? 0
          return numberFormatter(value, language)
        },
      },
      {
        accessorKey: 'available_stock',
        header: t('orderDetail:table.column.available_stock'),
        size: 100,
        cell: ({ row }) => {
          const value = row?.original?._stock_detail?.available_qty ?? 0
          return numberFormatter(value, language)
        },
      },
      {
        accessorKey: 'quantity',
        header: t('orderDetail:table.column.quantity'),
        cell: ({ row }) => {
          return (
            <Controller
              control={control}
              name={`allocations.${row.index}.allocated_qty`}
              render={({
                field: { onChange, value },
                fieldState: { error },
              }) => {
                const isDisabled = row?.original?._stock_detail?.qty === 0
                return (
                  <Fragment>
                    <InputNumberV2
                      key={`allocated-qty-${row.original.stock_id}`}
                      defaultValue={value || ''}
                      placeholder={t(
                        'orderDetail:table.trademark.column.allocated_qty.placeholder'
                      )}
                      onValueChange={(e) => {
                        onChange(e?.floatValue)
                        trigger(`allocations`)
                      }}
                      disabled={isDisabled}
                      error={!!error?.message && !isDisabled}
                      onPaste={(e) => {
                        onChange(
                          Number(
                            e.clipboardData.getData('text').replaceAll('.', '')
                          )
                        )
                        trigger(`allocations`)
                      }}
                    />
                    {error?.message && !isDisabled && (
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
    [errors, language, trigger, control, t]
  )

  return (
    <OrderDetailModal
      size="2xl"
      title={t('orderDetail:modal.input_qty')}
      open={isOpenAllocateBatchForm}
      onClose={handleClose}
      onSubmit={handleSubmit(handleSubmitForm)}
      submitButton={{
        label: t('common:save'),
      }}
    >
      <div className="ui-flex ui-flex-rows ui-space-x-5">
        <FormControl className="ui-space-y-1 ui-max-w-3/4">
          <FormLabel className="text-sm">Material</FormLabel>
          <div className="ui-text-dark-blue ui-font-bold">
            {allocateBatchFormSelectedRowMaterial}
          </div>
        </FormControl>
        <FormControl className="ui-space-y-1 ui-w-1/4">
          <FormLabel className="text-sm">
            {t('orderDetail:data.activity')}
          </FormLabel>
          <div className="ui-text-dark-blue ui-font-bold ui-flex ui-items-baseline ui-gap-1">
            {allocateBatchFormSelectedRowActivity}
          </div>
        </FormControl>
      </div>

      <DataTable
        data={allocationInputs}
        columns={columnsBatchSchema}
        isSticky
        className="ui-overflow-y-auto ui-max-h-[50vh] !ui-bg-white"
      />
    </OrderDetailModal>
  )
}

export default OrderHierarchyAllocatedFormBatchModal
