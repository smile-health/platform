import { useMemo } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useFilter, UseFilter } from '#components/filter'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import { getListYearPopulation } from '#services/population'
import { parseAsInteger, useQueryStates, Values } from 'nuqs'
import { useTranslation } from 'react-i18next'

import { generateFilterListPopulationSchema } from '../schema/populationSchema'

export default function useGetListPopulation() {
  const { t } = useTranslation(['common', 'population'])
  const [pagination, setPagination] = useQueryStates(
    {
      page: parseAsInteger.withDefault(1),
      paginate: parseAsInteger.withDefault(10),
    },
    {
      history: 'push',
    }
  )

  const filterSchema = useMemo<UseFilter>(
    () => generateFilterListPopulationSchema(t),
    [t]
  )
  const filter = useFilter(filterSchema)

  const buildParams = (currentFilter: Values<Record<string, any>>) => {
    const { keyword } = currentFilter

    return {
      page: pagination.page,
      paginate: pagination.paginate,
      ...(keyword && {
        keyword,
      }),
    }
  }

  const { data: dataListPopulation, isFetching } = useQuery({
    queryKey: ['list-population', filter.query, pagination],
    queryFn: () => getListYearPopulation(buildParams(filter.query)),
    placeholderData: keepPreviousData,
  })

  const handleChangePage = (page: number) => setPagination({ page })
  const handleChangePaginate = (paginate: number) =>
    setPagination({ paginate, page: 1 })

  useSetLoadingPopupStore(isFetching)

  const yearsActive = useMemo(() => {
    return (
      dataListPopulation?.data
        .filter((item) => item.status === 1)
        .map((item) => item.year) || []
    )
  }, [dataListPopulation])

  return {
    yearsActive,
    dataListPopulation,
    isFetchingListPopulation: isFetching,
    filter,
    pagination,
    handleChangePage,
    handleChangePaginate,
  }
}
