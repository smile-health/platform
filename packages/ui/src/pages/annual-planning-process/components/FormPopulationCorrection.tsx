import InformationPopulationTarget from "./InformationPopulationTarget"

import { FormPopulationCorrectionContext } from "../context/ContextProvider"
import { ENTITY_TYPE } from "#constants/entity"
import FormPopulationCorrectionDistrict from "./FormPopulationCorrectionDistrict"
import InformationAnnualPlanning from "./InformationAnnualPlanning"
import ReviewPopulationCorrectionDistrict from "./ReviewPopulationCorrectionDistrict"
import { useFormPopulationCorrection } from "../hooks/useFormPopulationCorrection"

const FormPopulationCorrection: React.FC = () => {
  const {
    contextValue,
    userTag,
  } = useFormPopulationCorrection()
  const shouldShowSectionKota = userTag === ENTITY_TYPE.KOTA
  const shouldReview = userTag === ENTITY_TYPE.PROVINSI || userTag === ENTITY_TYPE.PRIMARY_VENDOR

  return (
    <div className="ui-space-y-6">
      <FormPopulationCorrectionContext.Provider
        value={contextValue}
      >
        <div className="ui-space-y-3">
          <InformationAnnualPlanning />

          {shouldShowSectionKota && <InformationPopulationTarget />}
        </div>

        {shouldShowSectionKota && <FormPopulationCorrectionDistrict />}
        {shouldReview && <ReviewPopulationCorrectionDistrict />}
      </FormPopulationCorrectionContext.Provider>
    </div>
  )
}

export default FormPopulationCorrection