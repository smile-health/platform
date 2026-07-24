import { useContext } from "react"

import { AnnualPlanningProcessCreateContext } from "../context/ContextProvider"

import FormPopulationCorrection from "./FormPopulationCorrection"
import FormDefineDistrictIP from "./FormDefineDistrictIP"
import FormCalculationResult from "./FormCalculationResult"

const AnnualPlanningProcessRevision: React.FC = () => {
  const {
    currentStep,
  } = useContext(AnnualPlanningProcessCreateContext)

  return (
    <div className="ui-w-full ui-mt-6">
      {currentStep === 0 && <FormPopulationCorrection />}
      {currentStep === 1 && <FormDefineDistrictIP />}
      {currentStep === 2 && <FormCalculationResult />}
    </div>
  )
}

export default AnnualPlanningProcessRevision