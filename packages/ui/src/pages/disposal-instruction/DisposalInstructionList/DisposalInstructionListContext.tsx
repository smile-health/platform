import React, { createContext, useContext } from 'react'
import { useQuery } from '@tanstack/react-query'
import { usePermission } from '#hooks/usePermission'
import { AxiosResponseWithStatusCode } from '#utils/api'
import { removeEmptyObject } from '#utils/object'
import { useTranslation } from 'react-i18next'

import {
  getDisposalInstructionList,
  GetDisposalInstructionListResponse,
} from './disposal-instruction-list.service'
import useDisposalInstructionListTable from './use-cases/displayData/useDisposalInstructionListTable'
import useDisposalInstructionListFilter from './use-cases/filter/useDisposalInstructionListFilter'

type DisposalInstructionListContextValue = {
  isLoading: boolean
  isEmpty: boolean
  response?: AxiosResponseWithStatusCode<GetDisposalInstructionListResponse>
  filter: ReturnType<typeof useDisposalInstructionListFilter>
  table: ReturnType<typeof useDisposalInstructionListTable>
}

const DisposalInstructionListContext = createContext<
  DisposalInstructionListContextValue | undefined
>(undefined)

export const DisposalInstructionListProvider: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  usePermission('disposal-instruction-view')

  const { i18n } = useTranslation('disposalInstructionList')

  const filter = useDisposalInstructionListFilter()
  const table = useDisposalInstructionListTable()
  const filterValues = filter.query

  const {
    data: response,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: [
      i18n.language,
      'disposal-instruction',
      table.pagination,
      filterValues,
    ],
    queryFn: () =>
      getDisposalInstructionList(
        removeEmptyObject({
          page: table.pagination.page,
          paginate: table.pagination.paginate,
          bast_no: filterValues.bast_no,
          instruction_type: filterValues.instruction_type?.value,
          from_date: filterValues.created_date?.start,
          to_date: filterValues.created_date?.end,
          activity_id: filterValues.activity?.value,
          entity_tag_id: filterValues.entity_tag_id?.value,
          province_id: filterValues.province?.value,
          regency_id: filterValues.regency?.value,
          entity_id: filterValues.entity?.value,
        })
      ),
  })

  return (
    <DisposalInstructionListContext.Provider
      value={{
        isLoading: isLoading || isFetching,
        isEmpty: response?.total_item === 0,
        response,
        filter,
        table,
      }}
    >
      {children}
    </DisposalInstructionListContext.Provider>
  )
}

export const useDisposalInstructionList = () => {
  const context = useContext(DisposalInstructionListContext)
  if (!context) {
    throw new Error(
      'useDisposalInstructionListContext must be used within a DisposalInstructionListProvider'
    )
  }
  return context
}
