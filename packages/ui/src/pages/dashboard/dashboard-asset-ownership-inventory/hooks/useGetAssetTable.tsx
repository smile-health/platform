import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ColumnDef } from '@tanstack/react-table'
import { Values } from 'nuqs'
import { useTranslation } from 'react-i18next'

import { handleFilter } from '../dashboard-asset-ownership-inventory.helper'
import {
  exportAsset,
  getAssetTable,
} from '../dashboard-asset-ownership-inventory.service'
import { AssetInventoryTableData } from '../dashboard-asset-ownership-inventory.type'

export default function useGetAssetTable(
  filter: Values<Record<string, any>>,
  isLoadingAssetTypes: boolean
) {
  const { t } = useTranslation(['dashboardAssetOwnershipInventory'])
  const params = handleFilter(filter)
  const enabled = Object.values(params)?.length > 0 && !isLoadingAssetTypes
  const [pagination, setPagination] = useState({
    page: 1,
    paginate: 10,
  })

  const handleChangePage = (page: number) => {
    setPagination((prev) => ({ ...prev, page }))
  }

  const handleChangePaginate = (paginate: number) => {
    setPagination((prev) => ({ ...prev, paginate }))
    handleChangePage(1)
  }

  const { page, paginate } = pagination

  const { data, isLoading, isFetching } = useQuery({
    queryKey: [
      'asset-ownership-inventory-table',
      { ...params, page, paginate },
    ],
    queryFn: () => getAssetTable({ ...params, page, paginate }),
    enabled,
  })

  const assetInventoryColumns = useMemo(() => {
    const items = Array.isArray(data?.data) ? data.data : []
    const baseTitles = Array.isArray(items?.[0]?.details)
      ? items[0].details.map((d: any) => d?.title).filter(Boolean)
      : []
    const fallbackTitles = Array.from(
      new Set(
        items.flatMap((it: any) =>
          Array.isArray(it?.details)
            ? it.details.map((d: any) => d?.title).filter(Boolean)
            : []
        )
      )
    )
    const titles = baseTitles.length ? baseTitles : fallbackTitles
    return titles.map((title) => ({
      id: String(title),
      header: String(title),
      minSize: 150,
      size: 150,
      cell: ({ row }) => {
        const details = Array.isArray(row.original?.details)
          ? row.original.details
          : []
        const found = details.find((d: any) => d?.title === title)
        return typeof found?.total === 'number' ? found.total : 0
      },
    })) as ColumnDef<AssetInventoryTableData>[]
  }, [data, isLoading, isLoadingAssetTypes])

  const columns: ColumnDef<AssetInventoryTableData>[] = useMemo(
    () => [
      {
        accessorKey: 'No',
        header: 'No',
        minSize: 100,
        size: 100,
        cell: ({ row }) => {
          const number =
            ((data?.page ?? 1) - 1) * (data?.item_per_page ?? 0) +
            (row.index + 1)
          return number
        },
      },
      {
        accessorKey: 'title',
        header: t('dashboardAssetOwnershipInventory:column.entity.name'),
        minSize: 300,
        size: 300,
        cell: ({ row }) => {
          const title = row.getValue('title')
          return title
        },
      },
      ...assetInventoryColumns,
      {
        accessorKey: 'total',
        header: 'Total',
        minSize: 120,
        size: 120,
      },
    ],
    [data, isLoading, isLoadingAssetTypes]
  )

  const exportQuery = useQuery({
    queryKey: ['asset-export', params],
    queryFn: () => exportAsset(params),
    enabled: false,
  })

  return {
    data,
    columns,
    page,
    paginate,
    isLoading: isLoading || isFetching,
    exportQuery,
    handleChangePage,
    handleChangePaginate,
  }
}
