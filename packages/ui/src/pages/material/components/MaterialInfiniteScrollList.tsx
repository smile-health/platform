import { useState } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { ColumnDef } from '@tanstack/react-table'
import { getMaterials, GetProgramMaterialsResponse } from '#services/material'
import { TMaterial } from '#types/material'
import { useTranslation } from 'react-i18next'

import { InfiniteScrollList } from '../../../components/infinite-scroll-list'

type MaterialInfiniteScrollListProps = {
  title?: string
  description?: string
  onClickItem?: (row: TMaterial) => void
  columns?: ('name' | 'current-stock' | 'available-stock')[]
  config?: {
    showSearchBar?: boolean
  }
}

export const MaterialInfiniteScrollList = ({
  title,
  description,
  onClickItem,
  columns,
  config: { showSearchBar = true } = {},
}: MaterialInfiniteScrollListProps) => {
  const [search, setSearch] = useState('')

  const { t } = useTranslation(['common', 'material'])

  const { data, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ['infinite-scroll-list', 'material', search],
      queryFn: ({ pageParam }) =>
        getMaterials({ page: pageParam, paginate: 10, keyword: search }),
      initialPageParam: 1,
      getNextPageParam: (lastPage) =>
        lastPage.page < lastPage.total_page ? lastPage.page + 1 : undefined,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      enabled: false,
    })

  const generateSchema = () => {
    if (columns) {
      const schema: ColumnDef<GetProgramMaterialsResponse, TMaterial>[] = []

      if (columns?.includes('name')) {
        schema.push({
          accessorKey: 'name',
          header: t('material:scroll_list.column.material_name'),
          size: 350,
        })
      }

      if (columns?.includes('current-stock')) {
        schema.push({
          accessorKey: 'stock',
          header: t('material:scroll_list.column.current_stock'),
        })
      }

      if (columns?.includes('available-stock')) {
        schema.push({
          accessorKey: 'availableStock',
          header: t('material:scroll_list.column.available_stock'),
        })
      }

      return schema
    }

    return [
      {
        accessorKey: 'name',
        header: t('material:scroll_list.column.material_name'),
        size: 350,
      },
      {
        accessorKey: 'stock',
        header: t('material:scroll_list.column.current_stock'),
      },
    ]
  }

  return (
    <InfiniteScrollList<GetProgramMaterialsResponse, TMaterial>
      id="material-infinite-scroll-list"
      title={title ?? t('material:scroll_list.title')}
      description={description ?? t('material:scroll_list.description')}
      data={data?.pages.map((page) => page.data).flat()}
      hasNextPage={hasNextPage}
      fetchNextPage={fetchNextPage}
      handleSearch={(keyword) => setSearch(keyword)}
      onClickRow={onClickItem}
      columns={generateSchema()}
      isLoading={isFetching && !isFetchingNextPage}
      config={{
        searchBar: {
          show: showSearchBar,
          placeholder: t('material:list.filter.search.placeholder'),
        },
      }}
    />
  )
}
