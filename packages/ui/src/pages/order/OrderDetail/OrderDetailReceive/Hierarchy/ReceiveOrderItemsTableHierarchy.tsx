import { useCallback } from 'react'
import { PlusIcon } from '@heroicons/react/24/solid'
import { ColumnDef, Row } from '@tanstack/react-table'
import { Button } from '#components/button'
import { DataTable } from '#components/data-table'
import { FormErrorMessage } from '#components/form-control'
import cx from '#lib/cx'
import { numberFormatter } from '#utils/formatter'
import { FieldErrors } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { ReceiveFormHierarchyValues } from './ReceiveFormHierarchy'
import { ReceiveOrderItemsDrawerFormHierarchyValues } from './ReceiveOrderItemsDrawerFormHierarchy'

export type ReceiveOrderItemsTableHierarchyData =
  ReceiveOrderItemsDrawerFormHierarchyValues

type ReceiveOrderItemsTableHierarchyProps = {
  onRowClick: (row: Row<ReceiveOrderItemsTableHierarchyData>) => void
  orderItems?: ReceiveOrderItemsDrawerFormHierarchyValues[]
  isLoading: boolean
  errors: FieldErrors<ReceiveFormHierarchyValues>
}

export const ReceiveOrderItemsTableHierarchy = ({
  onRowClick,
  isLoading,
  orderItems,
  errors,
}: ReceiveOrderItemsTableHierarchyProps) => {
  const { t, i18n } = useTranslation(['common', 'orderDetail'])

  const renderActionColumn = useCallback(
    (row: Row<ReceiveOrderItemsTableHierarchyData>) => {
      const orderItem = row.original
      const receiveChild = orderItem.children

      const filledReceiveChild = receiveChild
        ?.flatMap((item) => item?.receives)
        ?.some((child) => child?.received_qty)

      const totalReceivedQty = receiveChild
        ?.flatMap((item) => item?.receives)
        ?.reduce((acc, cur) => acc + (cur?.received_qty ?? 0), 0)

      const handleClick = () => {
        onRowClick(row)
      }

      const error =
        errors?.order_items?.[row?.index]?.children?.[0]?.receives?.[0]
          ?.received_qty

      return (
        <div className="space-y-2">
          {filledReceiveChild && (
            <div className="space-y-2">
              <div key={row?.original?.id} className="ui-text-sm">
                <div className="ui-font-semibold">
                  Qty: {numberFormatter(totalReceivedQty, i18n.language)}
                </div>
              </div>
            </div>
          )}

          <div className="ui-space-y-1">
            <Button
              size="sm"
              type="button"
              leftIcon={<PlusIcon className="ui-w-5 ui-text-dark-blue" />}
              variant="outline"
              onClick={handleClick}
            >
              {filledReceiveChild
                ? t('orderDetail:button.update_product_variant')
                : t('orderDetail:table.product_variant')}
            </Button>
            {error && <FormErrorMessage>{error?.message}</FormErrorMessage>}
          </div>
        </div>
      )
    },
    [orderItems, errors]
  )

  const columns: ColumnDef<ReceiveOrderItemsTableHierarchyData>[] = [
    {
      accessorKey: '_order_item.material.name',
      header: t('orderDetail:table.column.material_name'),
      size: 400,
      minSize: 400,
    },
    {
      accessorKey: 'ordered',
      header: t('orderDetail:table.column.ordered'),
      size: 100,
      cell: ({ row }) =>
        numberFormatter(
          row.original?._order_item?.ordered_qty,
          i18n.language
        ) ?? '-',
    },
    {
      header: t('orderDetail:table.column.shipped'),
      cell: ({ row }) =>
        numberFormatter(row.original?._order_item?.shipped_qty, i18n.language),
      size: 100,
    },
    {
      header: t('orderDetail:table.column.received'),
      cell: ({ row }) => renderActionColumn(row),
      size: 250,
    },
  ]

  return (
    <DataTable
      data={orderItems}
      columns={columns}
      isLoading={!orderItems || isLoading}
      bodyClassName={cx({ 'ui-h-56': !orderItems })}
    />
  )
}
