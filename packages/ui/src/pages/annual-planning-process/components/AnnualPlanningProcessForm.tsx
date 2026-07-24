import { useContext } from "react"

import { AnnualPlanningProcessCreateContext } from "../context/ContextProvider"

import FormAreaProgramPlan from "./FormAreaProgramPlan"
import FormPopulationCorrection from "./FormPopulationCorrection"
import FormDefineDistrictIP from "./FormDefineDistrictIP"
import FormCalculationResult from "./FormCalculationResult"

const AnnualPlanningProcessForm: React.FC = () => {
  const {
    currentStep,
  } = useContext(AnnualPlanningProcessCreateContext)

  return (
    <div className="ui-w-full ui-mt-6">
      {currentStep === 0 && <FormAreaProgramPlan />}
      {currentStep === 1 && <FormPopulationCorrection />}
      {currentStep === 2 && <FormDefineDistrictIP />}
      {currentStep === 3 && <FormCalculationResult />}
    </div>
  )
}

export default AnnualPlanningProcessForm