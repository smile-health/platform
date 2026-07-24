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
  refreshTrigger?: number // Add trigger to force refresh
}

export const useBmhpPlanningListData = ({
  filter,
  pagination,
  querySorting,
  refreshTrigger = 0,
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
    queryKey: ['bmhp-planning-years', language, params, refreshTrigger],
    queryFn: () => listBmhpPlanningYears(params),
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  })

  return {
    listYearData,
    isLoadingListYear,
    isFetchingListYear,
  }
}
