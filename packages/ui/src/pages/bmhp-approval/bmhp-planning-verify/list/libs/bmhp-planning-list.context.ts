import { createContext } from 'react'

import { TBmhpPlanningYear } from './bmhp-planning-list.type'

export type BmhpPlanningDetailContextType = {
  yearData: TBmhpPlanningYear | null
  refetchYearData?: () => Promise<any>
}

const BmhpPlanningDetailContext = createContext<BmhpPlanningDetailContextType>({
  yearData: null,
})

export default BmhpPlanningDetailContext

// List Context
export type BmhpPlanningListContextType = {
  page: number
  setPagination?: (params: { page?: number; paginate?: number }) => void
  openCreateModal: boolean
  setOpenCreateModal?: (open: boolean) => void
  refreshData: () => void
}

export const BmhpPlanningListContext = createContext<BmhpPlanningListContextType>({
  page: 1,
  setPagination: () => { },
  openCreateModal: false,
  setOpenCreateModal: () => { },
  refreshData: () => { },
})
