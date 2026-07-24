import { useMemo } from "react"
import AppLayout from "#components/layouts/AppLayout/AppLayout"
import Meta from "#components/layouts/Meta"
import AnnualPlanningProcessStepper from "./components/AnnualPlanningProcessStepper"
import AnnualPlanningProcessReview from "./components/AnnualPlanningProcessReview"
import FormCalculationResultInformation from "./components/FormCalculationResultInformation"
import { useAnnualPlanningProcessReviewPage } from "./hooks/useAnnualPlanningProcessReviewPage"
import { AnnualPlanningProcessCreateContext } from "./context/ContextProvider"
import { useAnnualPlanningProcessPermission } from "./hooks/useAnnualPlanningProcessPermission"
import { useAnnualPlanningEnabled } from "#hooks/useAnnualPlanningEnabled"
import { useModalCalculationInformation } from "./store/modal-calculation-information.store"
import { formStepperName } from "./annual-planning-process.constants"

const AnnualPlanningProcessReviewPage: React.FC = () => {
  const {
    t,
    userTag,
    step,
    parentForm,
    updateForm,
    setStep,
    refetchUsageIndex,
  } = useAnnualPlanningProcessReviewPage()
  useAnnualPlanningProcessPermission('review', parentForm?.area_program_plan?.status)
  const { isDisabledAnnual } = useAnnualPlanningEnabled()

  const contextValue = useMemo(() => ({
    userTag,
    currentStep: step,
    parentForm,
    updateForm,
    isReview: true,
    isRevision: false,
    isDraft: false,
    setCurrentStep: setStep,
    refetchUsageIndex,
  }), [userTag, parentForm, step, updateForm, setStep, refetchUsageIndex])
  const { setOpenCalculationInformation } = useModalCalculationInformation()

  if (isDisabledAnnual) return <AppLayout title=""><div /></AppLayout>

  return (
    <AppLayout
      title={t('review.title')}
      showInformation={step === formStepperName.PROVINCE.RESULT}
      onClickInformation={() => setOpenCalculationInformation(true)}
    >
      <Meta title={t('review.meta')} />
      <FormCalculationResultInformation />

      <AnnualPlanningProcessCreateContext.Provider
        value={contextValue}
      >
        {/* Stepper Component */}
        <AnnualPlanningProcessStepper />
        {/* Review Component */}
        <AnnualPlanningProcessReview />
      </AnnualPlanningProcessCreateContext.Provider>
    </AppLayout>
  )
}

export default AnnualPlanningProcessReviewPage
