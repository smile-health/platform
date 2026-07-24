import { useContext, useEffect, useMemo, useState } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { listStock } from '../services'
import { StockOpnameCreateForm } from '../types'
import { Stock } from '#types/stock'
import { StockOpnameMaterialContext } from '../context/StockOpnameContext'
type Props = {
  isHierarchical: boolean
}
export const useStockOpnameSelectMaterial = ({ isHierarchical }: Props) => {
  const {
    t,
    i18n: { language },
  } = useTranslation('stockOpnameCreate')
  const { watch } = useFormContext<StockOpnameCreateForm>()
  const { selected_material_id, handleSelectMaterial } = useContext(StockOpnameMaterialContext)
  const { entity, periode, new_opname_items } = watch()
  const isSelectedEntityAndPeriode = Boolean(entity?.value && periode?.value)
  const [search, setSearch] = useState('')

  const { data, fetchNextPage, hasNextPage, isFetching } = useInfiniteQuery({
    queryKey: [
      'infinite-scroll-list',
      {
        search,
        entity: entity?.value,
        periode: periode?.value,
      },
    ],
    queryFn: ({ pageParam }) =>
      listStock({
        page: pageParam,
        paginate: 10,
        keyword: search,
        entity_id: entity?.value,
        period_id: periode?.value,
        with_details: 1,
        material_level_id: isHierarchical ? '2' : '3',
      }),
    initialPageParam: 1,
    getNextPageParam: ({ page }) => Number(page) + 1,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: 0,
    enabled: isSelectedEntityAndPeriode,
  })

  const checkStatusMaterial = (item: Stock) => {
    return selected_material_id?.some(id => id === item.material?.id)
  }

  const classRow = (item: Stock) => {
    if (checkStatusMaterial(item)) {
      return 'ui-bg-[#E2F3FC]'
    }
    return ''
  }

  const stocks = useMemo<Stock[] | undefined>(() => {
    return data?.pages
      .map((page) => page.data)
      .flat()
  }, [data, new_opname_items])

  const description = t('form.material.table.description', { returnObjects: true })[isSelectedEntityAndPeriode ? 1 : 0]

  return {
    t,
    language,
    handleChooseMaterial: handleSelectMaterial,
    stocks,
    fetchNextPage,
    hasNextPage,
    isFetching,
    search,
    setSearch,
    classRow,
    checkStatusMaterial,
    description,
  }
}
