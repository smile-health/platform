import { useMemo } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useFilter, UseFilter } from '#components/filter'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import { listPatientBulk } from '#services/patient'
import { parseAsInteger, useQueryStates, Values } from 'nuqs'
import { useTranslation } from 'react-i18next'

import { createFilterSchema } from '../schema/PatientBulkSchemaList'

export default function useGetListImportPatient() {
  const { t } = useTranslation(['common', 'patient'])
  const [pagination, setPagination] = useQueryStates(
    {
      page: parseAsInteger.withDefault(1),
      paginate: parseAsInteger.withDefault(10),
    },
    {
      history: 'push',
    }
  )

  const filterSchema = useMemo<UseFilter>(() => createFilterSchema(t), [t])
  const filter = useFilter(filterSchema)

  const buildParams = (currentFilter: Values<Record<string, any>>) => {
    const { date_range } = currentFilter

    return {
      page: pagination.page,
      paginate: pagination.paginate,
      ...(date_range && {
        start_date: date_range.start,
        end_date: date_range.end,
      }),
    }
  }

  const { data: dataListImportPatient, isFetching } = useQuery({
    queryKey: ['patient-bulk', filter.query, pagination],
    queryFn: () => listPatientBulk(buildParams(filter.query)),
    placeholderData: keepPreviousData,
  })

  const handleChangePage = (page: number) => setPagination({ page })
  const handleChangePaginate = (paginate: number) =>
    setPagination({ paginate, page: 1 })

  useSetLoadingPopupStore(isFetching)

  return {
    dataListImportPatient,
    isFetchingListImportPatient: isFetching,
    filter,
    pagination,
    handleChangePage,
    handleChangePaginate,
  }
}
