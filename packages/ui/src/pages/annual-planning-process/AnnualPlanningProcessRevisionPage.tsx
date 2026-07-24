import AppLayout from '#components/layouts/AppLayout/AppLayout'
import Meta from '#components/layouts/Meta'
import { useMemo } from 'react'

import AnnualPlanningProcessRevision from './components/AnnualPlanningProcessRevision'
import AnnualPlanningProcessStepper from './components/AnnualPlanningProcessStepper'
import FormCalculationResultInformation from './components/FormCalculationResultInformation'
import { AnnualPlanningProcessCreateContext } from './context/ContextProvider'
import { useAnnualPlanningProcessRevisionPage } from './hooks/useAnnualPlanningProcessRevisionPage'
import { useAnnualPlanningProcessPermission } from './hooks/useAnnualPlanningProcessPermission'
import { useAnnualPlanningEnabled } from '#hooks/useAnnualPlanningEnabled'
import { useModalCalculationInformation } from './store/modal-calculation-information.store'
import { formStepperName } from './annual-planning-process.constants'

const AnnualPlanningProcessRevisionPage: React.FC = () => {
  const {
    t,
    userTag,
    step,
    parentForm,
    updateForm,
    refetchUsageIndex,
    setStep,
  } = useAnnualPlanningProcessRevisionPage()
  useAnnualPlanningProcessPermission('revision', parentForm?.area_program_plan?.status)
  const { isDisabledAnnual } = useAnnualPlanningEnabled()

  const contextValue = useMemo(() => ({
    userTag,
    currentStep: step,
    parentForm,
    updateForm,
    isReview: false,
    isRevision: true,
    isDraft: false,
    refetchUsageIndex,
    setCurrentStep: setStep
  }), [userTag, parentForm, step, updateForm, setStep, refetchUsageIndex])
  const { setOpenCalculationInformation } = useModalCalculationInformation()

  if (isDisabledAnnual) return <AppLayout title=""><div /></AppLayout>

  return (
    <AppLayout
      title={t('revision.title')}
      showInformation={step === formStepperName.DISTRICT.RESULT}
      onClickInformation={() => setOpenCalculationInformation(true)}
    >
      <Meta title={t('revision.meta')} />
      <FormCalculationResultInformation />

      <AnnualPlanningProcessCreateContext.Provider
        value={contextValue}
      >
        {/* Stepper Component */}
        <AnnualPlanningProcessStepper />
        {/* Revision Component */}
        <AnnualPlanningProcessRevision />
      </AnnualPlanningProcessCreateContext.Provider>
    </AppLayout>
  )
}

export default AnnualPlanningProcessRevisionPage
