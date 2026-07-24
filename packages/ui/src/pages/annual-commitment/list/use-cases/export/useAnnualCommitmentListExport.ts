import { useQuery } from '@tanstack/react-query'
import { getReactSelectValue } from '#utils/react-select'

import {
  exportListAnnualCommitments,
  GetListAnnualCommitmentParams,
} from '../../annual-commitment-list.service'
import useAnnualCommitmentListTable from '../displayData/useAnnualCommitmentListTable'
import useAnnualCommitmentListFilter from '../filter/useAnnualCommitmentListFilter'

export const useAnnualCommitmentListExport = () => {
  const annualCommitmentListFilter = useAnnualCommitmentListFilter()
  const annualCommitmentListTable = useAnnualCommitmentListTable()

  const params: GetListAnnualCommitmentParams = {
    page: annualCommitmentListTable.pagination.page,
    item_per_page: annualCommitmentListTable.pagination.paginate,
    total_item: annualCommitmentListFilter?.query?.total_item,
    total_page: annualCommitmentListFilter?.query?.total_page,
    list_pagination: annualCommitmentListFilter?.query?.list_pagination,
    contract_number_id: getReactSelectValue(
      annualCommitmentListFilter?.query.contract_number
    ),
    material_id: getReactSelectValue(
      annualCommitmentListFilter?.query?.material
    ),
    province_id: getReactSelectValue(
      annualCommitmentListFilter?.query?.province
    ),
    supplier_id: getReactSelectValue(
      annualCommitmentListFilter?.query?.supplier
    ),
    year: getReactSelectValue(annualCommitmentListFilter?.query?.year),
  }

  const exportData = useQuery({
    queryKey: ['export-annual-commitment', params],
    queryFn: () => exportListAnnualCommitments(params),
    enabled: false,
  })

  return {
    exportData,
  }
}
