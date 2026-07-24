import { useQuery } from '@tanstack/react-query'
import { ColumnDef } from '@tanstack/react-table'
import { Button } from '#components/button'
import { DataTable } from '#components/data-table'
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
} from '#components/drawer'
import { EmptyState } from '#components/empty-state'
import XMark from '#components/icons/XMark'
import { RenderDetailValue } from '#components/modules/RenderDetailValue'
import { Spinner } from '#components/spinner'
import { orderTypeList } from '#constants/order'
import { OrderDetailBox } from '#pages/order/OrderDetail/components/OrderDetailBox'
import OrderDetailStatusItem from '#pages/order/OrderDetail/components/OrderDetailStatusItem'
import { numberFormatter } from '#utils/formatter'
import { getFullName } from '#utils/strings'
import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'

import i18n from '../../../locales/i18n'
import { OrderStatusEnum } from '../../order/order.constant'
import { getOrderDetail } from '../../order/OrderDetail/order-detail.service'
import { OrderDetailItem } from '../../order/OrderDetail/order-detail.type'

type TicketingSystemOrderDetailDrawerProps = {
  orderId?: string
  open?: boolean
  onClose?: () => void
}

const TicketingSystemOrderDetailDrawer: React.FC<
  TicketingSystemOrderDetailDrawerProps
> = ({ orderId, open, onClose }) => {
  const { t } = useTranslation(['common', 'ticketingSystem', 'orderDetail'])

  const { data, isLoading } = useQuery({
    queryKey: ['order', 'detail', orderId],
    queryFn: async () => getOrderDetail(orderId!),
    enabled: Boolean(orderId),
  })

  const getOrderDetailDate = (status: OrderStatusEnum) => {
    return {
      [OrderStatusEnum.Draft]: data?.drafted_at,
      [OrderStatusEnum.Pending]: data?.created_at,
      [OrderStatusEnum.Confirmed]: data?.confirmed_at,
      [OrderStatusEnum.Allocated]: data?.allocated_at,
      [OrderStatusEnum.Shipped]: data?.shipped_at,
      [OrderStatusEnum.Fulfilled]: data?.fulfilled_at,
      [OrderStatusEnum.Cancelled]: data?.cancelled_at,
    }[status]
  }

  const getOrderDetailUser = (status: OrderStatusEnum) => {
    return {
      [OrderStatusEnum.Draft]: data?.user_drafted_by,
      [OrderStatusEnum.Pending]: data?.user_created_by,
      [OrderStatusEnum.Confirmed]: data?.user_confirmed_by,
      [OrderStatusEnum.Allocated]: data?.user_allocated_by,
      [OrderStatusEnum.Shipped]: data?.user_shipped_by,
      [OrderStatusEnum.Fulfilled]: data?.user_fulfilled_by,
      [OrderStatusEnum.Cancelled]: data?.user_cancelled_by,
    }[status]
  }

  const detailData = [
    {
      label: t('orderDetail:data.do_number'),
      value: data?.doc_no,
    },
    {
      label: t('orderDetail:data.request_number'),
      value: data?.id,
    },
    {
      label: t('orderDetail:data.service_type'),
      value: orderTypeList(t).find((type) => type.value === data?.type)?.label,
    },
    {
      label: t('orderDetail:data.created_at'),
      value: data?.created_at && (
        <div>
          <span className="ui-uppercase">
            {dayjs(data?.created_at).format('DD MMM YYYY')}
          </span>{' '}
          by{' '}
          {getFullName(
            data.user_created_by.firstname,
            data.user_created_by.lastname
          )}
        </div>
      ),
      valueClassName: 'ui-font-semibold',
    },
    {
      label: t('orderDetail:data.actual_shipment_date'),
      value:
        data?.actual_shipment_date &&
        dayjs(data.actual_shipment_date).format('DD MMM YYYY'),
      hidden: data?.status !== OrderStatusEnum.Shipped,
    },
    {
      label: t('orderDetail:data.actual_receipt_date'),
      value:
        data?.fulfilled_at && dayjs(data.fulfilled_at).format('DD MMM YYYY'),
      hidden: data?.status !== OrderStatusEnum.Fulfilled,
    },
  ]

  const itemTableColumns: ColumnDef<OrderDetailItem>[] = [
    {
      accessorKey: 'id',
      header: t('ticketingSystem:table.columns.no'),
      cell: ({ row }) => row.index + 1,
      size: 50,
    },
    {
      accessorKey: 'material',
      header: t('orderDetail:table.column.material_name'),
      cell: ({ row }) => row.original.material.name,
      minSize: 400,
    },
    {
      accessorKey: 'qty',
      header: t('orderDetail:table.column.total_quantity'),
      cell: ({ row }) => {
        const value = {
          [OrderStatusEnum.Draft]: row.original?.qty,
          [OrderStatusEnum.Pending]: row.original?.qty,
          [OrderStatusEnum.Confirmed]: row.original?.confirmed_qty,
          [OrderStatusEnum.Allocated]: row.original?.allocated_qty,
          [OrderStatusEnum.Shipped]: row.original?.shipped_qty,
          [OrderStatusEnum.Fulfilled]: row.original?.fulfilled_qty,
          [OrderStatusEnum.Cancelled]: row.original?.qty,
        }

        return numberFormatter(
          data?.status ? value[data.status] : row.original.qty,
          i18n.language
        )
      },
      size: 300,
    },
    {
      accessorKey: 'order_stocks',
      header: t('orderDetail:table.column.batch_detail'),
      cell: ({ row }) => (
        <div className="ui-flex ui-flex-col ui-gap-4">
          {row.original.order_stocks?.length > 0
            ? row.original.order_stocks.map((stock) => (
                <div key={stock.id}>
                  <div className="ui-text-sm ui-font-semibold">
                    {stock.batch?.code ?? '-'}
                  </div>
                  <div className="ui-text-sm">
                    {t('orderDetail:data.expired_date')}:{' '}
                    {stock.batch?.expired_date
                      ? dayjs(stock.batch.expired_date)
                          .format('DD MMM YYYY')
                          .toUpperCase()
                      : '-'}
                  </div>
                  <div className="ui-text-sm">
                    {t('orderDetail:data.quantity')}:{' '}
                    {numberFormatter(stock.allocated_qty, i18n.language)}
                  </div>
                </div>
              ))
            : '-'}
        </div>
      ),
      size: 500,
    },
  ]

  const mappedData = data?.order_items
    .map((item) => {
      const hasChildren = item.children && item.children.length > 0

      return hasChildren
        ? item.children
        : {
            ...item,
          }
    })
    .flat()

  return (
    <Drawer
      open={open}
      placement="bottom"
      sizeHeight="lg"
      size="full"
      closeOnOverlayClick
      onOpenChange={onClose}
    >
      <DrawerHeader
        title={`${t('ticketingSystem:title.order_detail.drawer')} (${orderId})`}
        className="ui-text-center ui-py-6 border-b relative"
      >
        <Button
          variant="subtle"
          type="button"
          color="neutral"
          onClick={onClose}
          className="ui-right-4 ui-top-4 absolute"
        >
          <XMark />
        </Button>
      </DrawerHeader>

      <DrawerContent className="ui-p-6 ui-space-y-6">
        {isLoading && (
          <div className="ui-p-4 ui-flex ui-justify-center">
            <Spinner className="ui-w-8 ui-text-primary-500" />
          </div>
        )}

        {!isLoading && !data && (
          <EmptyState
            title={t('message.empty.title')}
            description={t('message.empty.description')}
            withIcon
          />
        )}

        {!isLoading && data && (
          <>
            <OrderDetailBox title="Detail">
              <div className="flex gap-8">
                <OrderDetailStatusItem
                  status={data.status}
                  date={getOrderDetailDate(data.status)}
                  user={getOrderDetailUser(data.status)}
                />
                <RenderDetailValue
                  showColon={true}
                  className="ui-grid-cols-[150px_4px_1fr] ui-gap-2 ui-text-sm"
                  valuesClassName="ui-font-semibold"
                  data={detailData}
                />
              </div>
            </OrderDetailBox>

            <div className="ui-font-semibold">
              {t('orderDetail:table.title.item')}
            </div>

            <DataTable data={mappedData} columns={itemTableColumns} />
          </>
        )}
      </DrawerContent>

      <DrawerFooter className="ui-border-t">
        <Button variant="outline" className="ui-w-48" onClick={onClose}>
          {t('close')}
        </Button>
      </DrawerFooter>
    </Drawer>
  )
}

export default TicketingSystemOrderDetailDrawer
