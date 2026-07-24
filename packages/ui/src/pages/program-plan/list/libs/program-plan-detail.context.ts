import { createContext } from 'react'

import { TProgramPlanData } from './program-plan-list.type'

type Props = {
  detailProgramPlanData: TProgramPlanData | null
}

const ProgramPlanDetailContext = createContext<Props>({
  detailProgramPlanData: null,
})

export default ProgramPlanDetailContext
