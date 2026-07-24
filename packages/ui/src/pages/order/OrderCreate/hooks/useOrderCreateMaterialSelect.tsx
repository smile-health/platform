import { useInfiniteQuery } from '@tanstack/react-query'
import { Checkbox } from '#components/checkbox'
import { useProgram } from '#hooks/program/useProgram'
import { listStockByEntities } from '#services/stock'
import { Stock } from '#types/stock'
import { numberFormatter } from '#utils/formatter'
import { UseFormWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { TOrderCreateForm } from '../order-create.type'

export const useOrderCreateMaterialSelect = ({
  search,
  customer_id,
  watch,
}: {
  search: string
  watch: UseFormWatch<TOrderCreateForm>
  customer_id?: number
}) => {
  const {
    t,
    i18n: { language },
  } = useTranslation(['orderCreate'])
  const { activeProgram } = useProgram()

  const { order_items, activity_id: activity } = watch()

  const checkStatusMaterial = (item: Stock) => {
    let isChecked = false
    const selectedMaterialId = order_items?.map(
      (obj) => obj?.value?.material_id
    )
    const materialId = item?.material?.id
    isChecked = selectedMaterialId?.includes(materialId)
    return isChecked
  }

  const classRow = (item: Stock) => {
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
      accessorKey: 'avaliable_qty_activity',
      meta: {
        cellClassName: ({ original }: any) => classRow(original),
      },
      cell: ({ row: { original } }: any) => {
        return numberFormatter(original?.total_available_qty || 0, language)
      },
    },

    {
      header: t('orderCreate:list.material.column.available_stock'),
      accessorKey: 'available_qty',
      meta: {
        cellClassName: ({ original }: any) => classRow(original),
      },
      cell: ({ row: { original } }: any) => {
        return numberFormatter(
          original?.aggregate?.total_available_qty || 0,
          language
        )
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
            className="!ui-cursor-pointer"
            value={statusChecked ? 1 : 0}
          />
        )
      },
    },
  ]

  const isReady: boolean = Boolean(customer_id && activity)
  const { data, fetchNextPage, hasNextPage, isFetching } = useInfiniteQuery({
    queryKey: [
      'infinite-scroll-list',
      'list-stock',
      { search, entity_id: customer_id, activity_id: activity?.value },
    ],
    queryFn: ({ pageParam }) =>
      listStockByEntities({
        keyword: search,
        page: pageParam.toString(),
        paginate: '10',
        activity_id: activity?.value,
        entity_id: customer_id,
        with_details: 1,
        ...(activeProgram?.config?.material?.is_hierarchy_enabled && {
          material_level_id: '2',
        }),
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      return lastPage.page < lastPage.total_page ? lastPage.page + 1 : undefined
    },
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
    enabled: isReady,
  })

  return {
    generateSchema,
    stocks: data?.pages.map((page) => page?.data).flat(),
    totalItem: data?.pages.map((page) => page?.total_item)?.[0],
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    checkStatusMaterial,
  }
}
