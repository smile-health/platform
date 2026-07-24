import { useCallback, useEffect, useMemo } from 'react'
import { PlusIcon } from '@heroicons/react/24/solid'
import { ColumnDef, Row } from '@tanstack/react-table'
import { Button } from '#components/button'
import { DataTable } from '#components/data-table'
import { FormErrorMessage } from '#components/form-control'
import { Stock } from '#types/stock'
import { numberFormatter } from '#utils/formatter'
import { FieldErrors, UseFormClearErrors } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import useOrderDetailStore from '../../order-detail.store'
import {
  OrderDetailAllocateHierarchyFormValues,
  OrderDetailItemStockCustomerVendor,
  OrderDetailMappedOrderItem,
} from '../../order-detail.type'
import { OrderDetailDrawer } from '../OrderDetailDrawer'

type OrderDetailAllocateDrawerFormHierarchyProps = {
  values: OrderDetailAllocateHierarchyFormValues['order_items']
  errors: FieldErrors<OrderDetailAllocateHierarchyFormValues>
  isLoading?: boolean
  onSubmit: () => void
  onReset?: () => void
  clearErrors: UseFormClearErrors<OrderDetailAllocateHierarchyFormValues>
}

export const OrderDetailAllocateDrawerFormHierarchy = ({
  values,
  errors,
  isLoading,
  onSubmit,
  onReset,
  clearErrors,
}: OrderDetailAllocateDrawerFormHierarchyProps) => {
  const { t, i18n } = useTranslation(['common', 'orderDetail'])
  const {
    data: orderDetailData,
    mappedOrderItem,
    isOpenAllocateDrawerForm,
    setOpenAllocateDrawerForm,
    setOpenAllocateModalForm,
  } = useOrderDetailStore()

  const renderCustomerVendorStockColumn = (
    stock?: Stock | OrderDetailItemStockCustomerVendor,
    type?: 'customer' | 'vendor'
  ) => {
    if (!stock) return '-'
    const stockData =
      type === 'vendor'
        ? (stock as Stock)?.aggregate
        : (stock as OrderDetailItemStockCustomerVendor)

    return (
      <div className="ui-space-y-1">
        <div>
          {numberFormatter(stockData?.total_available_qty, i18n.language)}
        </div>
        <div className="ui-text-gray-500">
          (min: {numberFormatter(stock?.min, i18n.language)} | max:{' '}
          {numberFormatter(stock?.max || 0, i18n.language)}),{' '}
          {t('orderDetail:table.column.stock_on_hand')}:{' '}
          {numberFormatter(stock?.total_qty, i18n.language)}
        </div>
      </div>
    )
  }

  const renderActionColumn = useCallback(
    (row: Row<OrderDetailMappedOrderItem>) => {
      const vendorStock = row.original.vendor_stock
      const value = values?.find(
        (value) => value?.id === row.original.order_item?.id
      )
      const filteredAllocations =
        value?.children?.filter((value) => Number(value?.allocated_qty) > 0) ??
        []
      const totalFilteredAllocations = filteredAllocations?.reduce(
        (prev, curr) => prev + (curr?.allocated_qty || 0),
        0
      )

      const isFilteredAllocationExist = filteredAllocations.length > 0
      const errorMessage = errors.order_items?.[row.index]?.children
        ?.message as any

      const handleClick = () => setOpenAllocateModalForm(true, row)

      return (
        <div className="space-y-2">
          {isFilteredAllocationExist && (
            <div className="space-y-2">
              {isFilteredAllocationExist && (
                <div className="ui-text-sm">
                  <div className="ui-font-semibold">
                    Qty:{' '}
                    {numberFormatter(totalFilteredAllocations, i18n.language)}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="ui-space-y-1">
            <Button
              size="sm"
              type="button"
              disabled={!vendorStock?.aggregate?.total_available_qty}
              leftIcon={
                !isFilteredAllocationExist && (
                  <PlusIcon className="ui-w-5 ui-text-dark-blue" />
                )
              }
              variant="outline"
              onClick={handleClick}
            >
              {t('orderDetail:drawer.hierarchy.allocate.button.add_trademark')}
            </Button>

            {errorMessage && (
              <FormErrorMessage>
                {typeof errorMessage === 'string'
                  ? errorMessage
                  : errorMessage?.button}
              </FormErrorMessage>
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
        cell: ({ row }) => {
          return (
            <div>
              {numberFormatter(
                row.original.order_item?.confirmed_qty,
                i18n.language
              )}
            </div>
          )
        },
      },
      {
        header: t('orderDetail:table.column.stock_on_hand'),
        cell: ({ row }) => {
          const customerStock = row.original.order_item?.stock_customer
          return renderCustomerVendorStockColumn(customerStock, 'customer')
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
          return renderCustomerVendorStockColumn(vendorStock, 'vendor')
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
    setOpenAllocateDrawerForm(false)
    clearErrors('order_items')
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
      disabled={isLoading}
      submitButton={{
        label: t('orderDetail:button.submit_allocation'),
      }}
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
