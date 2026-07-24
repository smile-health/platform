import { createContext } from 'react'

import { TProgramPlanData } from './program-plan-list.type'

type Props = {
  setPagination?: (value: { page?: number; paginate?: number }) => void
  page?: number
  popUpDataRow?: TProgramPlanData | null
  setPopUpDataRow: (value: TProgramPlanData | null) => void
  openCreateModal?: boolean
  setOpenCreateModal?: (value: boolean) => void
}
const ProgramPlanListContext = createContext<Props>({
  setPagination: () => {},
  page: 1,
  popUpDataRow: null,
  setPopUpDataRow: () => {},
  openCreateModal: false,
  setOpenCreateModal: () => {},
})

export default ProgramPlanListContext
