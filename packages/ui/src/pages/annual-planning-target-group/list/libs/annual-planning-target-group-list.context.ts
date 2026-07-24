import { createContext } from 'react'

import { TAnnualPlanningTargetGroupData } from './annual-planning-target-group-list.type'

type Props = {
  setPagination: (value: { page?: number; paginate?: number }) => void
  page: number
  openCreateModal: boolean
  setOpenCreateModal: (value: boolean) => void
  openCreateProgramModal: boolean
  setOpenCreateProgramModal: (value: boolean) => void
  openedRow: TAnnualPlanningTargetGroupData | null
  setOpenedRow: (value: TAnnualPlanningTargetGroupData | null) => void
  isGlobal: boolean
}
const AnnualPlanningTargetGroupListContext = createContext<Props>({
  setPagination: () => {},
  page: 1,
  openCreateModal: false,
  setOpenCreateModal: () => {},
  openCreateProgramModal: false,
  setOpenCreateProgramModal: () => {},
  openedRow: null,
  setOpenedRow: () => {},
  isGlobal: false,
})

export default AnnualPlanningTargetGroupListContext
