import React from 'react'
import { useQuery } from '@tanstack/react-query'
import EmptyFilter from '#components/icons/EmptyFilter'
import useSmileRouter from '#hooks/useSmileRouter'
import MasterListPage from '#pages/bmhp/master/list/MasterListPage'
import { useTranslation } from 'react-i18next'

import useMasterTable from './hooks/useMasterTable'
import { useTableFilter } from './hooks/useTableFilter'
import { GetBmhpPopulasiListParams, listBmhpPopulasi } from './master.service'

type BmhpPopulasiListPageProps = {
  withLayout?: boolean
}

const BmhpPopulasiListPage: React.FC<BmhpPopulasiListPageProps> = ({
  withLayout = true,
}) => {
  const { t } = useTranslation(['bmhpPlanning', 'common'])
  const router = useSmileRouter()
  const { year_id } = router.query

  const basePath = `/v5/bmhp-planning/${year_id}/populasi/`
  const { filter } = useTableFilter()
  const filterValues = filter.getValues()

  // Dummy empty array until data is loaded
  // Fetching data first or initializing table first?
  // Let's pass an empty array to useMasterTable initially since we construct columns inside it.

  // We need to fetch data, but we also want page/paginate from useMasterTable.
  // Custom hook order issue: useMasterTable requires populationColumns, but we don't have it until useQuery is done.
  // We can pass an empty array initially to useMasterTable, getting the sorting/pagination states.
  const [initialPopCols, setInitialPopCols] = React.useState<string[]>([])

  const table = useMasterTable({ basePath, populationColumns: initialPopCols })

  const params: GetBmhpPopulasiListParams = {
    province_id: filterValues.province_id?.value || undefined,
    program_plan_id: Number(year_id),
    page: table.pagination.page,
    paginate: table.pagination.paginate,
    sort_by: table.querySorting.querySorting.sort_by,
    sort_type: table.querySorting.querySorting.sort_type,
  }

  const isEmptyFilter = !filterValues.province_id?.value

  const { data, isLoading } = useQuery({
    queryKey: ['bmhp-populasi-list', params],
    queryFn: () => listBmhpPopulasi(params),
    enabled: !!year_id && !isEmptyFilter,
  })

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const populationsData = data?.data ?? []

  // Update dynamic columns when data is loaded
  React.useEffect(() => {
    if (populationsData.length > 0) {
      const cols = new Set<string>()
      populationsData.forEach((row) => {
        row.population.forEach((pop) => {
          cols.add(pop.name)
        })
      })

      const newCols = Array.from(cols)

      // Prevent infinite loops by checking equality
      if (JSON.stringify(newCols) !== JSON.stringify(initialPopCols)) {
        setInitialPopCols(newCols)
      }
    }
  }, [populationsData, initialPopCols])

  const emptyProps = isEmptyFilter
    ? {
        emptyTitle: t(
          'bmhpPlanning:list.empty_filter.title',
          'Tidak ada filter yang dipilih'
        ),
        emptyDescription: t(
          'bmhpPlanning:list.empty_filter.description',
          'Silakan pilih provinsi terlebih dahulu untuk menampilkan data.'
        ),
        emptyIcon: <EmptyFilter className="ui-size-6 ui-text-[#52525B]" />,
      }
    : {}

  return (
    <MasterListPage
      filter={filter}
      basePath={basePath}
      title={t('bmhpPlanning:tabs.populasi')}
      withLayout={withLayout}
      noAddButton
      data={{
        item: populationsData,
        total_item: data?.total_item || populationsData.length,
        total_page: data?.total_page || 1,
      }}
      isLoading={isLoading}
      {...emptyProps}
      masterTable={{
        columns: table.columns,
        pagination: {
          page: table.pagination.page,
          paginate: table.pagination.paginate,
          update: table.pagination.update,
        },
        querySorting: {
          querySorting: {
            sort_by: table.querySorting.querySorting.sort_by,
            sort_type: table.querySorting.querySorting.sort_type,
          },
          setQuerySorting: table.querySorting.setQuerySorting,
        },
        sorting: {
          sorting: table.sorting.sorting,
          setSorting: table.sorting.setSorting,
        },
      }}
    />
  )
}

export default BmhpPopulasiListPage
