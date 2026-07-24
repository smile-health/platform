import { useContext } from "react"
import { AnnualPlanningProcessCreateContext } from "../context/ContextProvider"
import { useTranslation } from "react-i18next"

const InformationAnnualPlanning: React.FC = () => {
  const { t } = useTranslation(['annualPlanningProcess', 'common'])
  const {
    parentForm,
  } = useContext(AnnualPlanningProcessCreateContext)

  const { province, regency, program_plan } = parentForm.area_program_plan || {}

  return (
    <div className="ui-border ui-border-neutral-300 ui-bg-neutral-100 ui-p-4">
      <p className="ui-text-gray-700 ui-font-medium">
        <span className="ui-font-bold">{t('common:form.province.label')}:</span>
        {' '}{province?.label || '-'}
        <span className="ui-mx-1">|</span>
        <span className="ui-font-bold">{t('common:form.city.label')}:</span>
        {' '}{regency?.label || '-'}
        <span className="ui-mx-1">|</span>
        <span className="ui-font-bold">{t('annualPlanningProcess:create.form.area_program_plan.program_plan.label')}:</span>
        {' '}{program_plan?.label || '-'}
      </p>
    </div>
  )
}

export default InformationAnnualPlanning