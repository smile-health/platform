import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useLoadingPopupStore } from '#store/loading.store'
import { Pagination } from '#types/common'
import { removeEmptyObject } from '#utils/object'
import { useTranslation } from 'react-i18next'

import { exportDisposalInstructionList } from '../../disposal-instruction-list.service'
import { DisposalInstructionListFilterValues } from '../../disposal-instruction-list.type'

type UseDisposalInstructionListExport = {
  pagination: Pagination
  filter: DisposalInstructionListFilterValues
}

const useDisposalInstructionListExport = ({
  pagination,
  filter,
}: UseDisposalInstructionListExport) => {
  const { i18n } = useTranslation()
  const { setLoadingPopup } = useLoadingPopupStore()

  const { refetch, isLoading, isFetching } = useQuery({
    queryKey: [i18n.language, 'ticketing-system-export', pagination, filter],
    queryFn: () =>
      exportDisposalInstructionList(
        removeEmptyObject({
          page: pagination.page,
          paginate: pagination.paginate,
          bast_no: filter.bast_no,
          instruction_type: filter.instruction_type?.value,
          from_date: filter.created_date?.start,
          to_date: filter.created_date?.end,
          activity_id: filter.activity?.value,
          entity_tag_id: filter.entity_tag_id?.value,
          province_id: filter.province?.value,
          regency_id: filter.regency?.value,
          entity_id: filter.entity?.value,
        })
      ),
    enabled: false,
  })

  useEffect(() => {
    setLoadingPopup(isLoading || isFetching)
  }, [isLoading, isFetching])

  return {
    fetch: refetch,
    isLoading: isLoading || isFetching,
  }
}

export default useDisposalInstructionListExport
