import React, { Fragment, useMemo } from 'react'
import { XMarkIcon } from '@heroicons/react/24/solid'
import { ColumnDef } from '@tanstack/react-table'
import { Button } from '#components/button'
import { DataTable } from '#components/data-table'
import { FormErrorMessage } from '#components/form-control'
import { InputNumberV2 } from '#components/input-number-v2'
import { StockDetailStock } from '#types/stock'
import { parseDateTime } from '#utils/date'
import { numberFormatter } from '#utils/formatter'
import { Control, Controller, UseFormTrigger } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import {
  ChildrenMaterial,
  OrderDetailAllocateChildrenFormValuesOrderItemHierarchyAllocation,
  OrderDetailAllocateFormValueHierarchysOrderItem,
  OrderDetailChildren,
  OrderDetailItemStockCustomerVendor,
} from '../../order-detail.type'
import { OrderDetailAllocateModalFormValues } from './OrderDetailAllocateModalFormHierarchy'

export type ChildrenOrderStocks = {
  stock_id: number
  allocated_qty: number | undefined
  _stock_material: ChildrenMaterial
  _stock_detail: StockDetailStock
  _stock_customer: OrderDetailItemStockCustomerVendor
  _stock_vendor: OrderDetailItemStockCustomerVendor
}

export type ChildrenProps = {
  child_id: number
  allocated_qty: number | undefined
  order_stock_status_id: number | undefined
  order_stocks?: ChildrenOrderStocks[]
  _stock_vendor: OrderDetailItemStockCustomerVendor
  _stock_customer: OrderDetailItemStockCustomerVendor
  _child_detail: OrderDetailChildren
  _child_of_detail_stock?: {
    details?: {
      material?: {
        id: number
      }
      total_qty: number
      total_available_qty: number
    }[]
    material?: {
      id: number
    }
    total_qty: number
    total_available_qty: number
  }
}

export type Props = {
  data?: OrderDetailAllocateChildrenFormValuesOrderItemHierarchyAllocation[]
  childIndex: number
  control: Control<OrderDetailAllocateModalFormValues>
  onClose: () => void
  getValues: () => OrderDetailAllocateModalFormValues
  setValue: (name: string, value: any) => void
  trigger: UseFormTrigger<OrderDetailAllocateFormValueHierarchysOrderItem>
  supportData: any
}

export const OrderDetailAllocateModalFormHierarchyCustomRow: React.FC<
  Props
> = ({
  data,
  control,
  childIndex,
  onClose,
  getValues,
  setValue,
  trigger,
  supportData,
}) => {
  const {
    t,
    i18n: { language },
  } = useTranslation(['common', 'orderDetail'])

  const columnsBatchSchema: ColumnDef<{
    stock_id: number
    allocated_qty: number | undefined
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
              name={`children.${childIndex}.allocations.${row.index}.allocated_qty`}
              render={({
                field: { onChange, value },
                fieldState: { error },
              }) => {
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
                      }}
                      disabled={row?.original?._stock_detail?.qty === 0}
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
    []
  )

  const handleSave = () => {
    const totalSavedQty = getValues().children?.[
      childIndex
    ]?.allocations?.reduce((acc, cur) => acc + (cur.allocated_qty ?? 0), 0)
    setValue(`children.${childIndex}.allocated_qty`, totalSavedQty)
    trigger(`children`)
    onClose()
  }
  const isMaterialBatch = useMemo(() => {
    return (
      Boolean(
        supportData?._child_of_detail_stock?.material?.is_managed_in_batch
      ) || Boolean(supportData?._child_detail?.material?.is_managed_in_batch)
    )
  }, [supportData])

  return (
    <div className="!ui-bg-[#F6F6F7] !ui-w-full !ui-p-4">
      <div className="ui-flex ui-items ui-justify-between ui-mb-4">
        <div className="ui-flex ui-mb-4">
          <div className="ui-mr-1">
            {isMaterialBatch ? (
              <p>{t('orderDetail:table.trademark.column.batch_from')}</p>
            ) : (
              <p>{t('orderDetail:table.trademark.column.non_batch')}</p>
            )}
          </div>
          <div className="ui-font-bold">
            {t('orderDetail:table.trademark.column.activity_name', {
              activity_name: supportData?._activity?.name,
            })}
          </div>
        </div>
        <Button
          variant="subtle"
          className="!ui-bg-transparent"
          onClick={onClose}
          leftIcon={<XMarkIcon className="ui-h-4 ui-w-4" />}
        >
          {t('orderDetail:table.trademark.button.close')}
        </Button>
      </div>
      <div className="ui-flex ui-flex-col">
        <DataTable
          data={data}
          columns={columnsBatchSchema}
          isSticky
          className="ui-overflow-y-auto ui-max-h-[50vh] !ui-bg-white"
        />
        <Button
          variant="solid"
          className="ui-ml-auto ui-my-4"
          onClick={handleSave}
        >
          {t('orderDetail:table.trademark.button.save')}
        </Button>
      </div>
    </div>
  )
}
