import { useInfiniteQuery } from '@tanstack/react-query'
import { Checkbox } from '#components/checkbox'
import { OptionType } from '#components/react-select'
import { listStockByEntities } from '#services/stock'
import { Stock } from '#types/stock'
import { numberFormatter } from '#utils/formatter'
import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { TOrderCreateReturnForm } from '../order-create-return.type'

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
  } = useTranslation(['orderCreateReturn'])

  const { watch } = useFormContext<TOrderCreateReturnForm>()

  const { order_items } = watch()

  const setDisabledTransactionStockZero = (total: number): boolean => {
    return total === 0
  }

  const checkStatusMaterial = (item: Stock) => {
    let isChecked = false
    const selectedMaterialId = order_items?.map((obj) => obj?.material_id)
    const materialId = item?.material?.id
    isChecked = Boolean(selectedMaterialId?.includes(materialId))
    return isChecked
  }

  const classRow = (item: Stock) => {
    if (setDisabledTransactionStockZero(item.total_qty)) {
      return 'ui-text-neutral-300 ui-cursor-not-allowed'
    }
    if (checkStatusMaterial(item)) {
      return 'ui-bg-[#E2F3FC]'
    }
    return ''
  }

  const generateSchema = [
    {
      header: t('orderCreateReturn:list.material.column.material_name'),
      accessorKey: 'material.name',
      size: 350,
      meta: {
        cellClassName: ({ original }: any) => classRow(original),
      },
    },
    {
      header: t('orderCreateReturn:list.material.column.stock_on_activity', {
        activity_name: activity?.label,
      }),
      accessorKey: 'avaliable_qty_activity',
      meta: {
        cellClassName: ({ original }: any) => classRow(original),
      },
      cell: ({ row: { original } }: any) => {
        return numberFormatter(original?.total_available_qty ?? 0, language)
      },
    },

    {
      header: t('orderCreateReturn:list.material.column.available_stock'),
      accessorKey: 'available_qty',
      meta: {
        cellClassName: ({ original }: any) => classRow(original),
      },
      cell: ({ row: { original } }: any) => {
        return numberFormatter(
          original?.aggregate?.total_available_qty ?? 0,
          language
        )
      },
    },
    {
      header: t('orderCreateReturn:list.material.column.selection'),
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
      listStockByEntities({
        keyword: search,
        page: pageParam.toString(),
        paginate: '10',
        activity_id: activity?.value,
        entity_id: customer?.value,
        only_have_qty: '1',
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
    totalItems: data?.pages?.[0]?.total_item,
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    checkStatusMaterial,
  }
}
