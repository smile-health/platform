import { useInfiniteQuery } from '@tanstack/react-query'
import { Checkbox } from '#components/checkbox'
import { OptionType } from '#components/react-select'
import { listStock } from '#services/stock'
import { Stock } from '#types/stock'
import { numberFormatter } from '#utils/formatter'
import { useFieldArray, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { OrderItem } from '../OrderCreateReturn/order-create-return.type'

export const useOrderCreateMaterialTable = <T extends { order_items?: any[] }>({
  search,
  customer,
  activity,
}: {
  search: string
  customer: OptionType | null
  activity: OptionType | null
}) => {
  const {
    t,
    i18n: { language },
  } = useTranslation(['orderCreate'])

  const { watch, control } = useFormContext<T>()

  const { append, remove } = useFieldArray({
    control,
    name: 'order_items' as any,
  })

  const { order_items } = watch()

  const { append: appendBatch, remove: removeBatch } = useFieldArray({
    control,
    name: `order_items?.[${order_items?.length}].details` as any,
  })

  const setDisabledTransactionStockZero = (total: number): boolean => {
    return total === 0
  }

  const checkStatusMaterial = (item: Stock) => {
    let isChecked = false
    const selectedMaterialId = (order_items as OrderItem[])?.map(
      (obj) => obj?.material_id
    )
    const materialId = item?.material?.id
    isChecked = Boolean(selectedMaterialId?.includes(materialId))
    return isChecked
  }

  const classRow = (item: Stock) => {
    if (setDisabledTransactionStockZero(item.total_qty)) {
      return 'ui-bg-neutral-300 ui-cursor-not-allowed'
    }
    if (checkStatusMaterial(item)) {
      return 'ui-bg-[#E2F3FC]'
    }
    return ''
  }

  const generateSchema = [
    {
      header: t('orderCreate:list.material.column.material_name'),
      accessorKey: 'material.name',
      size: 350,
      meta: {
        cellClassName: ({ original }: any) => classRow(original),
      },
    },
    {
      header: t('orderCreate:list.material.column.stock_on_activity', {
        activity_name: activity?.label,
      }),
      accessorKey: 'total_avaliable_qty',
      meta: {
        cellClassName: ({ original }: any) => classRow(original),
      },
      cell: ({ row: { original } }: any) => {
        const detail = original?.details.find(
          (i: any) => Number(i.activity.id) === activity?.value
        )
        return numberFormatter(detail?.total_qty || 0, language)
      },
    },

    {
      header: t('orderCreate:list.material.column.available_stock'),
      accessorKey: 'total_qty',
      meta: {
        cellClassName: ({ original }: any) => classRow(original),
      },
      cell: ({ row: { original } }: any) => {
        return numberFormatter(original?.total_qty || 0, language)
      },
    },
    {
      header: t('orderCreate:list.material.column.selection'),
      accessorKey: 'selection',
      meta: {
        cellClassName: ({ original }: any) => classRow(original),
      },
      cell: ({ row }: any) => {
        const statusChecked = checkStatusMaterial(row.original)
        return (
          <Checkbox
            checked={statusChecked}
            disabled={setDisabledTransactionStockZero(row.original.total_qty)}
            value={statusChecked ? 1 : 0}
          />
        )
      },
    },
  ]

  const isReady: boolean = Boolean(customer && activity)
  const { data, fetchNextPage, hasNextPage, isFetching } = useInfiniteQuery({
    queryKey: [
      'infinite-scroll-list',
      'list-stock',
      { search, entity_id: customer?.value, activity_id: activity?.value },
    ],
    queryFn: ({ pageParam }) =>
      listStock({
        keyword: search,
        page: pageParam.toString(),
        paginate: '10',
        activity_id: activity?.value,
        entity_id: customer?.value,
        with_details: 1,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      return lastPage.page !== lastPage.total_page
        ? lastPage.page + 1
        : undefined
    },
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
    enabled: isReady,
  })

  return {
    generateSchema,
    stocks: data?.pages.map((page) => page.data).flat(),
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    checkStatusMaterial,
  }
}
