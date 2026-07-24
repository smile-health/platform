import { createContext } from 'react'

import { TProgramPlanData } from '../../list/libs/program-plan-list.type'

type Props = {
  activeProgramPlanData?: TProgramPlanData | null
  setActiveProgramPlanData?: (value: TProgramPlanData | null) => void
}
const ProgramPlanFormContext = createContext<Props>({
  activeProgramPlanData: null,
  setActiveProgramPlanData: () => {},
})

export default ProgramPlanFormContext
