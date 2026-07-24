import { useRouter } from 'next/router'
import { useQuery } from '@tanstack/react-query'
import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '#components/badge'
import MobileV2 from '#components/icons/MobileV2'
import WebV2 from '#components/icons/WebV2'
import { ButtonActionTable } from '#components/modules/ButtonActionTable'
import OrderInteroperabilityBadge from '#pages/order/components/OrderInteroperabilityBadge'
import { parseDateTime } from '#utils/date'
import { getFullName } from '#utils/strings'
import { parseAsInteger, parseAsString, useQueryStates, Values } from 'nuqs'
import { useTranslation } from 'react-i18next'

import { useOrder } from '../../hooks/useOrder'
import { getOrderType } from '../../order.helper'
import { handleFilterParams } from '../order-list.helper'
import { listOrders, totalOrdersCursor } from '../order-list.service'
import { TOrder } from '../order-list.type'

type UseOrderListTableParams = {
  filter: Values<Record<string, any>>
  queryKey: string
  isCursor?: boolean
}

export default function useOrderListTable(params: UseOrderListTableParams) {
  const { orderStatus } = useOrder()
  const { filter, queryKey, isCursor = false } = params
  const {
    t,
    i18n: { language },
  } = useTranslation(['common', 'orderList'])

  const [{ page, paginate, cursor }, setPagination] = useQueryStates(
    isCursor
      ? {
          paginate: parseAsInteger.withDefault(10),
          cursor: parseAsString.withDefault(''),
        }
      : {
          page: parseAsInteger.withDefault(1),
          paginate: parseAsInteger.withDefault(10),
        },
    {
      history: 'push',
    }
  )

  const filterParams = handleFilterParams(
    { page, paginate, ...filter },
    isCursor
  )

  const router = useRouter()

  const {
    data: dataSource,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: [queryKey, { ...filterParams, ...cursor }, isCursor],
    queryFn: () => listOrders(filterParams, cursor),
    enabled: router.isReady && Object.values(filter).some((item) => !!item),
  })

  const { data: totalCursor } = useQuery({
    queryKey: ['total-order-cursor', filterParams, isCursor],
    queryFn: () => totalOrdersCursor(filterParams),
    enabled:
      isCursor &&
      router.isReady &&
      Object.values(filter).some((item) => !!item),
  })

  const tableColumns: Array<ColumnDef<TOrder>> = [
    {
      header: 'No.',
      accessorKey: 'no',
      size: 20,
      maxSize: 100,
      cell: ({ row }) =>
        page ? (page - 1) * paginate + (row?.index + 1) : row?.index + 1,
    },
    {
      header: t('orderList:column.order_number'),
      accessorKey: 'id',
      size: 100,
      minSize: 100,
      cell: ({ row }) => {
        const item = row?.original
        return (
          <div className="ui-flex ui-items-center">
            <div className="ui-space-y-1">
              <div className="flex items-center gap-3">
                <p>{item?.id}</p>
                {item?.metadata?.client_key && (
                  <OrderInteroperabilityBadge
                    client={item.metadata.client_key}
                  />
                )}
              </div>
              <p className="ui-text-neutral-500">
                ({getOrderType(item?.type, t)})
              </p>
            </div>
          </div>
        )
      },
    },
    {
      header: 'Item',
      accessorKey: 'total_order_item',
      size: 50,
      minSize: 50,
    },
    {
      header: t('orderList:column.activity'),
      accessorKey: 'activity.name',
      size: 70,
      minSize: 70,
    },
    {
      header: 'Status',
      accessorKey: 'status',
      size: 80,
      minSize: 80,
      cell: ({ row }) => (
        <Badge
          size="md"
          rounded="full"
          variant="light"
          color={orderStatus[row?.original?.status]?.color}
        >
          {orderStatus[row?.original?.status]?.label}
        </Badge>
      ),
    },
    {
      header: t('orderList:column.vendor'),
      accessorKey: 'vendor.name',
      size: 150,
      minSize: 150,
    },
    {
      header: t('orderList:column.created'),
      accessorKey: 'user_created_by',
      size: 130,
      minSize: 130,
      cell: ({ row }) => {
        const item = row?.original
        const user = item?.user_created_by
        const fullname = getFullName(user?.firstname, user?.lastname)
        const date = parseDateTime(
          row?.original?.created_at,
          'DD MMM YYYY HH:mm',
          language
        ).toUpperCase()

        return (
          <div className="ui-space-y-1">
            <p>{fullname}</p>
            <p className="ui-text-neutral-500">{date}</p>
          </div>
        )
      },
    },
    {
      header: t('orderList:column.customer'),
      accessorKey: 'customer.name',
      size: 150,
      minSize: 150,
    },
    {
      header: t('orderList:column.device'),
      accessorKey: 'device_type',
      size: 70,
      minSize: 70,
      cell: ({ row }) => {
        const device = row?.original?.device_type
        if (device === 1) {
          return <WebV2 className="ui-text-primary-surface" />
        }

        return <MobileV2 className="ui-text-primary-surface" />
      },
    },
    {
      header: t('orderList:column.action'),
      accessorKey: 'action',
      size: 30,
      minSize: 30,
      cell: ({ row }) => {
        const item = row?.original

        return (
          <ButtonActionTable
            id={item?.id}
            path="order"
            hidden={['edit', 'activation']}
          />
        )
      },
    },
  ]

  const handleChangePage = (page: number) => {
    setPagination((prev) => ({ ...prev, page }))
  }

  const handleChangePaginate = (paginate: number) => {
    setPagination((prev) => ({ ...prev, paginate }))
    handleChangePage(1)
  }

  return {
    page,
    paginate,
    dataSource,
    isLoading: isLoading || isFetching,
    tableColumns,
    handleChangePage,
    handleChangePaginate,
    setPagination,
    totalCursor: totalCursor?.total ?? 0,
  }
}
