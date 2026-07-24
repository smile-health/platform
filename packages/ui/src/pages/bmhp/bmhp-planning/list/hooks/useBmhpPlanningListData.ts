import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { listBmhpPlanningYears } from '../../services/bmhp-planning.services'
import { ListBmhpPlanningYearsParams } from '../libs/bmhp-planning-list.type'

type TParams = {
  filter: any
  pagination: {
    page: number
    paginate: number
  }
  querySorting: {
    sort_by: string
    sort_type: string
  }
}

export const useBmhpPlanningListData = ({
  filter,
  pagination,
  querySorting,
}: TParams) => {
  const {
    i18n: { language },
  } = useTranslation(['common', 'bmhpPlanning'])

  // Get filter value - handle both OptionType (from select) and direct number
  const yearFilter = filter.getValues('year')
  const yearValue = yearFilter?.value || yearFilter

  const params: ListBmhpPlanningYearsParams = {
    page: pagination.page,
    paginate: pagination.paginate,
    sort_by: querySorting?.sort_by,
    sort_type: querySorting?.sort_type,
    year: yearValue,
  }

  const {
    data: listYearData,
    isLoading: isLoadingListYear,
    isFetching: isFetchingListYear,
  } = useQuery({
    queryKey: ['bmhp-planning-years', language, params],
    queryFn: () => listBmhpPlanningYears(params),
    refetchOnWindowFocus: false,
  })

  return {
    listYearData,
    isLoadingListYear,
    isFetchingListYear,
  }
}
