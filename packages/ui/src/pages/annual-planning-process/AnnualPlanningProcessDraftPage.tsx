import AppLayout from '#components/layouts/AppLayout/AppLayout'
import Meta from '#components/layouts/Meta'
import { useMemo } from 'react'

import AnnualPlanningProcessForm from './components/AnnualPlanningProcessForm'
import AnnualPlanningProcessStepper from './components/AnnualPlanningProcessStepper'
import { AnnualPlanningProcessCreateContext } from './context/ContextProvider'
import { useAnnualPlanningProcessCreatePage } from './hooks/useAnnualPlanningProcessCreatePage'
import { useAnnualPlanningProcessPermission } from './hooks/useAnnualPlanningProcessPermission'
import { useAnnualPlanningEnabled } from '#hooks/useAnnualPlanningEnabled'
import { useModalCalculationInformation } from './store/modal-calculation-information.store'
import FormCalculationResultInformation from './components/FormCalculationResultInformation'
import { formStepperName } from './annual-planning-process.constants'

const AnnualPlanningProcessDraftPage: React.FC = () => {
  const {
    t,
    userTag,
    step,
    parentForm,
    updateForm,
    refetchUsageIndex,
    setStep,
  } = useAnnualPlanningProcessCreatePage({ isDraft: true })
  useAnnualPlanningProcessPermission('draft', parentForm?.area_program_plan?.status)
  const { isDisabledAnnual } = useAnnualPlanningEnabled()

  const contextValue = useMemo(() => ({
    userTag,
    currentStep: step,
    parentForm,
    updateForm,
    isReview: false,
    isRevision: false,
    isDraft: true,
    refetchUsageIndex,
    setCurrentStep: setStep,
  }), [userTag, parentForm, step, updateForm, setStep])
  const { setOpenCalculationInformation } = useModalCalculationInformation()

  if (isDisabledAnnual) return <AppLayout title=""><div /></AppLayout>

  return (
    <AppLayout
      title={t('create.title')}
      showInformation={step === formStepperName.DISTRICT.RESULT}
      onClickInformation={() => setOpenCalculationInformation(true)}
    >
      <Meta title={t('create.meta')} />
      <FormCalculationResultInformation />

      <AnnualPlanningProcessCreateContext.Provider
        value={contextValue}
      >
        {/* Stepper Component */}
        <AnnualPlanningProcessStepper />
        {/* Form Component */}
        <AnnualPlanningProcessForm />
      </AnnualPlanningProcessCreateContext.Provider>
    </AppLayout>
  )
}

export default AnnualPlanningProcessDraftPage
