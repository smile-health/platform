import { useCallback, useEffect, useMemo } from 'react'
import { PlusIcon } from '@heroicons/react/24/solid'
import { ColumnDef, Row } from '@tanstack/react-table'
import { Button } from '#components/button'
import { DataTable } from '#components/data-table'
import { FormErrorMessage } from '#components/form-control'
import { Stock } from '#types/stock'
import { numberFormatter } from '#utils/formatter'
import dayjs from 'dayjs'
import { FieldErrors } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import useOrderDetailStore from '../../order-detail.store'
import {
  OrderDetailAllocateFormValues,
  OrderDetailItemStockCustomerVendor,
  OrderDetailMappedOrderItem,
} from '../../order-detail.type'
import { OrderDetailDrawer } from '../OrderDetailDrawer'

type OrderDetailAllocateDrawerFormProps = {
  values: OrderDetailAllocateFormValues['order_items']
  errors: FieldErrors<OrderDetailAllocateFormValues>
  isLoading?: boolean
  onSubmit: () => void
  onReset?: () => void
}

export const OrderDetailAllocateDrawerForm = ({
  values,
  errors,
  isLoading,
  onSubmit,
  onReset,
}: OrderDetailAllocateDrawerFormProps) => {
  const { t, i18n } = useTranslation(['common', 'orderDetail'])

  const {
    data: orderDetailData,
    mappedOrderItem,
    isOpenAllocateDrawerForm,
    setOpenAllocateDrawerForm,
    setOpenAllocateModalForm,
  } = useOrderDetailStore()

  const renderCustomerVendorStockColumn = (
    stock?: Stock | OrderDetailItemStockCustomerVendor
  ) => {
    if (!stock) return '-'
    return (
      <div className="ui-space-y-1">
        <div>{numberFormatter(stock?.total_available_qty, i18n.language)}</div>
        <div className="ui-text-gray-500">
          (min: {numberFormatter(stock?.min, i18n.language)} | max:{' '}
          {numberFormatter(stock?.max, i18n.language)}),{' '}
          {t('orderDetail:table.column.stock_on_hand').toLowerCase()}:{' '}
          {numberFormatter(stock?.total_qty, i18n.language)}
        </div>
      </div>
    )
  }

  const renderActionColumn = useCallback(
    (row: Row<OrderDetailMappedOrderItem>) => {
      const vendorStock = row.original.vendor_stock
      const value = values.find(
        (value) => value.id === row.original.order_item?.id
      )
      const filledAllocations =
        value?.allocations?.filter(
          (value) =>
            value?.allocated_qty !== null && value?.allocated_qty !== undefined
        ) ?? []
      const isFilteredAllocationExist = filledAllocations.length > 0
      const isBatch = Boolean(vendorStock?.material?.is_managed_in_batch)
      const errorMessage =
        errors.order_items?.message ??
        errors.order_items?.[row.index]?.allocations?.message

      const handleClick = () => setOpenAllocateModalForm(true, row)

      return (
        <div className="space-y-2">
          {isFilteredAllocationExist && (
            <div className="space-y-2">
              {filledAllocations?.map((value) => (
                <div key={value.stock_id} className="ui-text-sm">
                  {isBatch && (
                    <>
                      <div>
                        {t('orderDetail:data.batch_code')}:{' '}
                        {value._stock_of_detail_stock?.batch?.code}
                      </div>
                      <div>
                        {t('orderDetail:data.expired_date')}:{' '}
                        {dayjs(
                          value._stock_of_detail_stock?.batch?.expired_date
                        )
                          .format('DD MMM YYYY')
                          .toUpperCase()}
                      </div>
                    </>
                  )}
                  <div>
                    {t('orderDetail:data.stock_from_activity')}:{' '}
                    {value._stock_of_detail_stock?.activity?.name}
                  </div>
                  <div className="ui-font-semibold">
                    Qty: {numberFormatter(value.allocated_qty, i18n.language)}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="ui-space-y-1">
            <Button
              size="sm"
              type="button"
              leftIcon={
                !isFilteredAllocationExist && (
                  <PlusIcon className="ui-w-5 ui-text-dark-blue" />
                )
              }
              variant="outline"
              onClick={handleClick}
            >
              {!isFilteredAllocationExist &&
                (isBatch
                  ? t('orderDetail:button.batch_quantity')
                  : t('orderDetail:button.quantity'))}
              {isFilteredAllocationExist &&
                (isBatch
                  ? t('orderDetail:button.update_batch_quantity')
                  : t('orderDetail:button.update_quantity'))}
            </Button>

            {errorMessage && (
              <FormErrorMessage>{errorMessage}</FormErrorMessage>
            )}
          </div>
        </div>
      )
    },
    [values, errors]
  )

  const columns: ColumnDef<OrderDetailMappedOrderItem>[] = useMemo(
    () => [
      {
        accessorKey: 'order_item.material.name',
        header: t('orderDetail:table.column.material_name'),
        cell: ({ row }) => row.original.order_item?.material.name,
      },
      {
        accessorKey: 'order_item.qty',
        header: t('orderDetail:table.column.ordered'),
        cell: ({ row }) =>
          numberFormatter(row.original.order_item?.ordered_qty, i18n.language),
      },
      {
        accessorKey: 'order_item.confirmed_qty',
        header: t('orderDetail:table.column.confirmed'),
        cell: ({ row }) =>
          numberFormatter(
            row.original.order_item?.confirmed_qty,
            i18n.language
          ),
      },
      {
        header: t('orderDetail:table.column.stock_on_hand'),
        cell: ({ row }) => {
          const customerStock = row.original.order_item?.stock_customer
          return renderCustomerVendorStockColumn(customerStock)
        },
        meta: {
          headerSubComponent: (
            <div className="ui-font-normal ui-text-gray-500">
              {t('common:at')} {orderDetailData?.customer?.name}
            </div>
          ),
        },
      },
      {
        header: t('orderDetail:table.column.available_stock'),
        cell: ({ row }) => {
          const vendorStock = row.original.vendor_stock
          return renderCustomerVendorStockColumn(vendorStock)
        },
        meta: {
          headerSubComponent: (
            <div className="ui-font-normal ui-text-gray-500">
              {t('common:at')} {orderDetailData?.vendor?.name}
            </div>
          ),
        },
      },
      {
        accessorKey: 'action',
        header: t('orderDetail:table.column.allocation'),
        minSize: 180,
        cell: ({ row }) => renderActionColumn(row),
      },
    ],
    [values, errors, orderDetailData, i18n.language]
  )

  const handleClose = () => {
    onReset?.()
    setOpenAllocateDrawerForm(false)
  }

  useEffect(() => () => handleClose(), [])

  return (
    <OrderDetailDrawer
      id="allocate-drawer-form"
      open={isOpenAllocateDrawerForm}
      onClose={handleClose}
      title={t('orderDetail:drawer.allocate.title')}
      onReset={() => onReset?.()}
      onSubmit={onSubmit}
      isLoading={isLoading}
      submitButton={{
        label: t('orderDetail:button.submit_allocation'),
      }}
      disabled={Boolean(errors.order_items)}
    >
      <DataTable
        className="ui-overflow-y-auto ui-max-h-[50vh]"
        columns={columns}
        data={mappedOrderItem}
        isSticky
      />
    </OrderDetailDrawer>
  )
}
