import { useMemo, useState } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import { listStockByEntities } from '#services/stock'
import { numberFormatter } from '#utils/formatter'
import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { tableMaterialColumns } from '../order-create-distribution.constant'
import { TOrderFormValues } from '../order-create-distribution.type'

export default function useMaterialStockList() {
  const {
    t,
    i18n: { language },
  } = useTranslation('orderDistribution')
  const [keyword, setKeyword] = useState('')

  const { watch } = useFormContext<TOrderFormValues>()

  const { vendor, activity, customer, order_items } = watch()
  const selectedMaterial = order_items?.map((item) =>
    Number(item?.material?.id)
  )

  function formatNumber(value?: number) {
    return numberFormatter(value ?? 0, language)
  }

  const tableSchema = tableMaterialColumns({
    t,
    activity,
    formatNumber,
    selectedMaterial,
  })

  const params = {
    keyword,
    activity_id: activity?.value,
    entity_id: vendor?.value,
  }

  const { data, fetchNextPage, hasNextPage, isFetching } = useInfiniteQuery({
    queryKey: ['infinite-scroll-list-stocks', params],
    queryFn: ({ pageParam }) =>
      listStockByEntities({
        ...params,
        page: pageParam,
        paginate: 10,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      return lastPage.page !== lastPage.total_page
        ? lastPage.page + 1
        : undefined
    },
    enabled: Boolean(vendor?.value && activity?.value && customer?.value),
  })

  const stocks = useMemo(() => {
    const materials = data?.pages?.flatMap((item) => item?.data)

    return { data: materials, totalItems: data?.pages?.[0]?.total_item }
  }, [data])

  useSetLoadingPopupStore(isFetching)

  return {
    tableSchema,
    stocks: stocks?.data,
    totalItems: stocks?.totalItems,
    fetchNextPage,
    hasNextPage,
    setKeyword,
    isFetching,
  }
}
