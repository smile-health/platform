import { createContext } from 'react'

import { TAnnualPlanningSubstitutionData } from './annual-planning-substitution-list.type'

type Props = {
  setPagination: (value: { page?: number; paginate?: number }) => void
  page: number
  openedRow: TAnnualPlanningSubstitutionData | null
  setOpenedRow: (value: TAnnualPlanningSubstitutionData | null) => void
}
const AnnualPlanningSubstitutionListContext = createContext<Props>({
  setPagination: () => {},
  page: 1,
  openedRow: null,
  setOpenedRow: () => {},
})

export default AnnualPlanningSubstitutionListContext
