import { Fragment } from 'react'
import { ColumnDef, Row } from '@tanstack/react-table'
import { Button } from '#components/button'
import { DataTable } from '#components/data-table'
import cx from '#lib/cx'
import { numberFormatter } from '#utils/formatter'
import { useTranslation } from 'react-i18next'

import { OrderStatusEnum } from '../../../order.constant'
import useOrderDetailStore from '../../order-detail.store'
import { OrderDetailItem } from '../../order-detail.type'

const { Pending, Allocated, Shipped, Fulfilled, Confirmed, Draft } =
  OrderStatusEnum

export const OrderDetailHierarchyItemsTable = () => {
  const { t, i18n } = useTranslation(['common', 'orderDetail'])

  const {
    data,
    isVendor,
    setIndexHierarchyRow,
    setOpenItemForm,
    setOpenQuantityDetailModal,
    isOrderDetailHierarchy,
    isThirdPartyOrder,
  } = useOrderDetailStore()

  const orderItemsData = data?.order_items

  const renderAllocatedQtyColumn = (
    row: Row<OrderDetailItem>,
    showViewDetailButton: boolean,
    type:
      | 'qty'
      | 'ordered_qty'
      | 'confirmed_qty'
      | 'allocated_qty'
      | 'shipped_qty'
      | 'fulfilled_qty'
      | 'validated_qty'
  ) => {
    const hasChildren = !!row?.original?.children?.length
    const showButton = isOrderDetailHierarchy
      ? showViewDetailButton && hasChildren
      : showViewDetailButton
    return (
      <div className="space-y-1">
        <div>{numberFormatter(row.original[type], i18n.language)}</div>
        {showButton && (
          <button
            className="ui-text-primary-500 !ui-outline-none"
            onClick={() => setOpenQuantityDetailModal(true, row.original)}
          >
            {type !== 'shipped_qty'
              ? t('orderDetail:table.view_product_variant')
              : t('common:view_detail')}
          </button>
        )}
      </div>
    )
  }

  const renderAvailableStockColumn = (row: Row<OrderDetailItem>) => {
    const stockCustomer = row.original.stock_customer
    const stockVendor = row.original.stock_vendor
    return (
      <div className="ui-space-y-1">
        <div>
          {numberFormatter(
            (isVendor ? stockVendor : stockCustomer)?.total_available_qty,
            i18n.language
          )}
        </div>
        <div className="ui-text-gray-500">
          (min:{' '}
          {numberFormatter(
            (isVendor ? stockVendor : stockCustomer)?.min,
            i18n.language
          )}{' '}
          | max:{' '}
          {numberFormatter(
            (isVendor ? stockVendor : stockCustomer)?.max,
            i18n.language
          )}
          )
        </div>
      </div>
    )
  }

  const renderActionColumn = (row: Row<OrderDetailItem>) => {
    return (
      <Button
        variant="subtle"
        size="sm"
        onClick={() => {
          setOpenItemForm(true, 'edit', row.original)
          setIndexHierarchyRow(row.index)
        }}
      >
        {t('common:edit')}
      </Button>
    )
  }

  const columns: ColumnDef<OrderDetailItem>[] = [
    {
      accessorKey: 'material.name',
      header: t('orderDetail:table.column.material_name'),
    },
    {
      accessorKey: 'qty',
      header: t('orderDetail:table.column.ordered'),
      cell: ({ row }) => {
        return renderAllocatedQtyColumn(
          row,
          data?.status === Pending,
          'ordered_qty'
        )
      },
    },
    {
      accessorKey: 'reason.name',
      header: t('orderDetail:table.column.reason'),
      size: 280,
      minSize: 280,
      cell: ({ row }) => {
        return (
          <Fragment>
            <div
              className={cx({
                'ui-text-gray-500': row?.original?.reason?.id === 9,
              })}
            >
              {data?.metadata?.client_key
                ? '-'
                : (row?.original?.reason?.name ?? '-')}
            </div>
            {/* {row?.original?.other_reason && ( */}
            <div>
              {data?.metadata?.client_key
                ? '-'
                : row?.original?.other_reason
                  ? row?.original?.other_reason
                  : ''}
            </div>
            {/* )} */}
          </Fragment>
        )
      },
    },
    {
      accessorKey: 'validated_qty',
      header: t('orderDetail:table.column.validated'),
      cell: ({ row }) => {
        return renderAllocatedQtyColumn(
          row,
          data?.status === Pending,
          'validated_qty'
        )
      },
      meta: {
        hidden: !data?.metadata?.client_key || data?.status === Draft,
      },
    },
    {
      accessorKey: 'confirmed_qty',
      header: t('orderDetail:table.column.confirmed'),
      cell: ({ row }) => {
        return renderAllocatedQtyColumn(
          row,
          data?.status === Confirmed,
          'confirmed_qty'
        )
      },
      meta: {
        hidden: data?.status === Pending || data?.status === Draft,
      },
    },
    {
      header: t('orderDetail:table.column.allocated'),
      cell: ({ row }) =>
        renderAllocatedQtyColumn(
          row,
          data?.status === Allocated,
          'allocated_qty'
        ),
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
        renderAllocatedQtyColumn(row, data?.status === Shipped, 'shipped_qty'),
      meta: {
        hidden: data?.status !== Shipped && data?.status !== Fulfilled,
      },
    },
    {
      header: t('orderDetail:table.column.received'),
      cell: ({ row }) =>
        renderAllocatedQtyColumn(
          row,
          data?.status === Fulfilled,
          'fulfilled_qty'
        ),
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
            {t('common:at')}{' '}
            {isVendor ? data?.vendor?.name : data?.customer?.name}
          </div>
        ),
        hidden: data?.status === Fulfilled,
      },
    },
    ...(!isVendor
      ? ([
          {
            header: t('common:action'),
            cell: ({ row }) => renderActionColumn(row),
            meta: {
              hidden: data?.status !== Pending || isThirdPartyOrder,
            },
          },
        ] as ColumnDef<OrderDetailItem>[])
      : []),
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
