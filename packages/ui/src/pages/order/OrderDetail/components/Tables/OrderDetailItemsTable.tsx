import { ColumnDef, Row } from '@tanstack/react-table'
import { Button } from '#components/button'
import { DataTable } from '#components/data-table'
import cx from '#lib/cx'
import { numberFormatter } from '#utils/formatter'
import { useTranslation } from 'react-i18next'

import { OrderStatusEnum } from '../../../order.constant'
import useOrderDetailStore from '../../order-detail.store'
import { OrderDetailItem, OrderDetailStock } from '../../order-detail.type'

const { Pending, Allocated, Shipped, Fulfilled } = OrderStatusEnum

export const OrderDetailItemsTable = () => {
  const { t, i18n } = useTranslation(['common', 'orderDetail'])

  const { data, setOpenItemForm, setOpenQuantityDetailModal } =
    useOrderDetailStore()

  const orderItemsData = data?.order_items ?? []

  const renderAllocatedQtyColumn = (
    row: Row<OrderDetailItem>,
    showViewDetailButton: boolean
  ) => {
    return (
      <div className="space-y-1">
        <div>
          {handleCalculateQty(row.original.order_stocks, 'allocated_qty')}
        </div>
        {showViewDetailButton && row.original.order_stocks.length > 0 && (
          <button
            className="ui-text-primary-500"
            onClick={() => setOpenQuantityDetailModal(true, row.original)}
          >
            {t('common:view_detail')}
          </button>
        )}
      </div>
    )
  }

  const renderAvailableStockColumn = (row: Row<OrderDetailItem>) => {
    const stockCustomer = row.original.stock_customer
    return (
      <div className="ui-space-y-1">
        <div>
          {numberFormatter(stockCustomer?.total_available_qty, i18n.language)}
        </div>
        <div className="ui-text-gray-600">
          (min: {numberFormatter(stockCustomer?.min, i18n.language)} | max:{' '}
          {numberFormatter(stockCustomer?.max, i18n.language)})
        </div>
      </div>
    )
  }

  const renderActionColumn = (row: Row<OrderDetailItem>) => {
    return (
      <Button
        variant="subtle"
        size="sm"
        onClick={() => setOpenItemForm(true, 'edit', row.original)}
      >
        {t('common:edit')}
      </Button>
    )
  }

  const handleCalculateQty = (
    OrderDetailStocks: OrderDetailStock[],
    property: 'allocated_qty' | 'received_qty'
  ): string => {
    const filteredStock = OrderDetailStocks.filter((stock) =>
      Number.isInteger(stock[property])
    )
    const quantity = filteredStock.reduce(
      (acc, stock) => acc + (stock?.[property] ?? 0),
      0
    )

    return filteredStock?.length === 0
      ? '-'
      : numberFormatter(quantity, i18n.language)
  }

  const columns: ColumnDef<OrderDetailItem>[] = [
    {
      accessorKey: 'material.name',
      header: t('orderDetail:table.column.material_name'),
    },
    {
      accessorKey: 'qty',
      header: t('orderDetail:table.column.ordered'),
      cell: ({ row }) =>
        numberFormatter(row.original.ordered_qty, i18n.language),
    },
    {
      accessorKey: 'confirmed_qty',
      header: t('orderDetail:table.column.confirmed'),
      cell: ({ row }) =>
        numberFormatter(row.original.confirmed_qty, i18n.language),
      meta: {
        hidden: data?.status === Pending,
      },
    },
    {
      header: t('orderDetail:table.column.allocated'),
      cell: ({ row }) =>
        renderAllocatedQtyColumn(row, data?.status === Allocated),
      meta: {
        hidden:
          data?.status !== Allocated &&
          data?.status !== Shipped &&
          data?.status !== Fulfilled,
      },
    },
    {
      header: t('orderDetail:table.column.shipped'),
      cell: ({ row }) =>
        renderAllocatedQtyColumn(row, data?.status === Shipped),
      meta: {
        hidden: data?.status !== Shipped && data?.status !== Fulfilled,
      },
    },
    {
      header: t('orderDetail:table.column.received'),
      cell: ({ row }) =>
        renderAllocatedQtyColumn(row, data?.status === Fulfilled),
      meta: {
        hidden: data?.status !== Fulfilled,
      },
    },
    {
      accessorKey: 'stock_customer.available_stock',
      header: t('orderDetail:table.column.available_stock'),
      cell: ({ row }) => renderAvailableStockColumn(row),
      meta: {
        headerSubComponent: (
          <div className="ui-font-normal ui-text-gray-500">
            {t('common:at')} {data?.customer?.name}
          </div>
        ),
        hidden: data?.status === Fulfilled,
      },
    },
    {
      header: t('common:action'),
      cell: ({ row }) => renderActionColumn(row),
      meta: {
        hidden: data?.status !== Pending,
      },
    },
  ]

  return (
    <DataTable
      data={orderItemsData}
      columns={columns}
      isLoading={!data}
      bodyClassName={cx({ 'ui-h-56': !data })}
    />
  )
}
