import { useMemo, useState } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import { listStockByEntities } from '#services/stock'
import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { tableMaterialColumns } from '../order-create-central-distribution.constant'
import { listEntityMaterials } from '../order-create-central-distribution.service'
import { TOrderFormValues } from '../order-create-central-distribution.type'

export default function useEntityMaterialsList() {
  const { t } = useTranslation('orderCentralDistribution')
  const [keyword, setKeyword] = useState('')

  const { watch } = useFormContext<TOrderFormValues>()

  const { vendor, activity, customer, order_items } = watch()
  const selectedMaterial = order_items?.map((item) => Number(item?.id))

  const tableSchema = tableMaterialColumns({
    t,
    selectedMaterial,
  })

  const params = {
    keyword,
    activity_id: activity?.value,
    entity_id: vendor?.value,
    customer_id: customer?.value,
  }
  const { data, fetchNextPage, hasNextPage, isFetching } = useInfiniteQuery({
    queryKey: ['infinite-scroll-list-materials-entities', params],
    queryFn: ({ pageParam }) =>
      listStockByEntities({
        ...params,
        page: pageParam.toString(),
        paginate: '10',
        with_details: 1,
        material_level_id: '3',
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      return lastPage.page < lastPage.total_page
        ? lastPage.page + 1
        : undefined
    },
    enabled: Boolean(vendor?.value && activity?.value && customer?.value),
  })

  // const { data, fetchNextPage, hasNextPage, isFetching } = useInfiniteQuery({
  //   queryKey: ['infinite-scroll-list-materials-entities', params],
  //   queryFn: ({ pageParam }) =>
  //     listEntityMaterials(vendor?.value, {
  //       ...params,
  //       page: pageParam,
  //       paginate: 10,
  //     }),
  //   initialPageParam: 1,
  //   getNextPageParam: (lastPage) => {
  //     return lastPage.page !== lastPage.total_page
  //       ? lastPage.page + 1
  //       : undefined
  //   },
  //   enabled: Boolean(vendor?.value && activity?.value && customer?.value),
  // })

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
