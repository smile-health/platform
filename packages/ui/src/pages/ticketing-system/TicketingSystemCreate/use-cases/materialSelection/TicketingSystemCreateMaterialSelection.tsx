import { useState } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '#components/checkbox'
import { InfiniteScrollList } from '#components/infinite-scroll-list'
import cx from '#lib/cx'
import { listStockByEntities } from '#services/stock'
import { useTranslation } from 'react-i18next'

import { TicketingSystemCreateSelectedMaterial } from '../../ticketing-system-create.type'
import { useTicketingSystemCreateContext } from '../../TicketingSystemCreateProvider'

const TicketingSystemCreateMaterialSelection = () => {
  const { t } = useTranslation('ticketingSystemCreate')

  const { form, materialSelection } = useTicketingSystemCreateContext()

  const [search, setSearch] = useState('')

  const query = useInfiniteQuery({
    queryKey: [
      'infinite-scroll-list',
      'list-stock',
      { search, entity_id: form.getValues('entity.value') },
    ],
    queryFn: ({ pageParam }) =>
      listStockByEntities({
        keyword: search,
        page: pageParam.toString(),
        paginate: '10',
        entity_id: form.getValues('entity.value'),
        with_details: 1,
      }),
    initialPageParam: 1,
    getNextPageParam: ({ page, total_page }) => {
      return total_page !== 0 && page !== total_page ? page + 1 : undefined
    },
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
    enabled: Boolean(form.getValues('entity')),
  })

  const flattenedData = query.data?.pages.map((page) => page?.data).flat() || []
  const data: TicketingSystemCreateSelectedMaterial[] = flattenedData?.map(
    (item) => ({
      material: item.material?.id
        ? {
            id: item.material?.id,
            name: item.material?.name,
            is_batch: Boolean(item.material?.is_managed_in_batch),
          }
        : null,
      custom_material: null,
      items: [],
    })
  )
  const totalItems = query.data?.pages.map((page) => page?.total_item)?.[0] || 0

  let columns: ColumnDef<TicketingSystemCreateSelectedMaterial>[] = [
    {
      accessorKey: 'material.name',
      header: 'Material',
      size: 350,
    },
    {
      accessorKey: 'selection',
      header: 'Selection',
      cell: ({ row }) => {
        const isSelected = materialSelection.selectedMaterials.some(
          (selectedMaterial) =>
            selectedMaterial.material?.id === row.original?.material?.id
        )

        return (
          <Checkbox
            checked={isSelected}
            className="!ui-cursor-pointer"
            size="sm"
            value={false ? 1 : 0}
            onChange={() => {}}
          />
        )
      },
      size: 50,
      meta: {
        headerClassName: 'ui-text-center',
        cellClassName: 'ui-text-center',
      },
    },
  ]

  columns = columns.map((column) => ({
    ...column,
    meta: {
      ...column.meta,
      cellClassName: (row) => {
        const isSelected = materialSelection.selectedMaterials.some(
          (selectedMaterial) =>
            selectedMaterial.material?.id === row.original.material?.id
        )
        return cx(column.meta?.cellClassName, {
          'ui-bg-primary-100/40': isSelected,
        })
      },
    },
  }))

  return (
    <InfiniteScrollList
      id="material-list-selection"
      title={
        form.getValues('entity.label')
          ? `${t('ticketingSystemCreate:section.select_material.title_in_entity', { entity: form.getValues('entity.label') })}`
          : t('ticketingSystemCreate:section.select_material.title')
      }
      description={t('section.select_material.description')}
      data={data}
      hasNextPage={query.hasNextPage}
      fetchNextPage={query.fetchNextPage}
      handleSearch={(keyword) => {
        setSearch(keyword)
        query.fetchNextPage({ cancelRefetch: true })
      }}
      totalItems={totalItems}
      onClickRow={(row) => {
        materialSelection.selectMaterial(row)
      }}
      columns={columns}
      isLoading={query.isFetching}
      config={{
        searchBar: {
          show: true,
          placeholder: t('field.search_material.placeholder'),
        },
        totalItems: {
          show: false,
        },
      }}
    />
  )
}

export default TicketingSystemCreateMaterialSelection
