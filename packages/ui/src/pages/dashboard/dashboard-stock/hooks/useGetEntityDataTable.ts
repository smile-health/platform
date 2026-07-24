import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { numberFormatter } from '#utils/formatter'
import { Values } from 'nuqs'
import { useTranslation } from 'react-i18next'

import { handleFilter } from '../../dashboard.helper'
import { getEntity } from '../../dashboard.service'
import {
  InformationType,
  StockChartType,
  tableEntityColumns,
  tableMaterialEntityColumns,
  tableStockEntityColumns,
} from '../dashboard-stock.constant'
import { getMaterialEntity, getStockEntity } from '../dashboard-stock.service'

export default function useGetEntityDataTable<T extends StockChartType>(
  filter: Values<Record<string, any>>,
  tab: T,
  sort?: 'asc' | 'desc'
) {
  const {
    t,
    i18n: { language },
  } = useTranslation('dashboardStock')

  const [pagination, setPagination] = useState({
    page: 1,
    paginate: 10,
  })

  const { page, paginate } = pagination

  const finalFilter = handleFilter({ sort, ...filter })
  const params = { ...finalFilter, page, paginate }
  const enabled = Object.values(finalFilter)?.length > 0

  const isInTransitStock =
    filter?.informationType === InformationType.In_Transit_Stock

  const {
    data: entityData,
    isLoading: isEntityLoading,
    isFetching: isEntityFetching,
  } = useQuery({
    queryKey: ['stock-by-entity', params, tab],
    queryFn: () => getEntity(params, 'stock'),
    enabled: enabled && tab === 'entity',
  })

  const {
    data: materialEntityData,
    isLoading: isMaterialEntityLoading,
    isFetching: isMaterialEntityFetching,
  } = useQuery({
    queryKey: ['stock-by-material-entity', params, tab],
    queryFn: () => getMaterialEntity(params),
    enabled: enabled && tab === 'material-entity',
  })

  const {
    data: stockEntityData,
    isLoading: isStockEntityLoading,
    isFetching: isStockEntityFetching,
  } = useQuery({
    queryKey: ['stock-by-stock-entity', params, tab],
    queryFn: () => getStockEntity(params),
    enabled: enabled && tab === 'stock-entity',
  })

  const handleChangePage = (page: number) => {
    setPagination((prev) => ({ ...prev, page }))
  }

  const handleChangePaginate = (paginate: number) => {
    setPagination((prev) => ({ ...prev, paginate }))
    handleChangePage(1)
  }

  const formatNumber = (value?: number) => {
    return numberFormatter(value ?? 0, language)
  }

  const getStockData = () => {
    switch (tab) {
      case StockChartType.Entity:
        return entityData

      case StockChartType.Material_Entity:
        return materialEntityData

      case StockChartType.Stock_Entity:
        return stockEntityData
      default:
        break
    }
  }

  const getStockColumns = () => {
    switch (tab) {
      case StockChartType.Entity:
        return tableEntityColumns(
          t,
          page,
          paginate,
          formatNumber,
          isInTransitStock
        )

      case StockChartType.Material_Entity:
        return tableMaterialEntityColumns(
          t,
          page,
          paginate,
          formatNumber,
          isInTransitStock
        )

      case StockChartType.Stock_Entity:
        return tableStockEntityColumns(
          t,
          page,
          paginate,
          formatNumber,
          isInTransitStock
        )
      default:
        return []
    }
  }

  return {
    dataSource: getStockData(),
    columns: getStockColumns(),
    isLoading:
      isEntityLoading ||
      isEntityFetching ||
      isMaterialEntityLoading ||
      isMaterialEntityFetching ||
      isStockEntityLoading ||
      isStockEntityFetching,
    page,
    paginate,
    handleChangePage,
    handleChangePaginate,
  }
}
