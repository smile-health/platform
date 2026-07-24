import { useContext, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { AnnualPlanningProcessCreateContext } from "../context/ContextProvider"
import { formStepper } from "../annual-planning-process.constants"
import cx from "#lib/cx"

type StepperProps = {
  steps: Array<{ key: string }>
  key: string
}
const AnnualPlanningProcessStepper: React.FC = () => {
  const { t } = useTranslation('annualPlanningProcess')
  const {
    currentStep,
    isReview,
    isRevision,
    setCurrentStep,
  } = useContext(AnnualPlanningProcessCreateContext)

  const stepper: StepperProps = useMemo(() => {
    let result = {
      steps: formStepper.STEP_4,
      key: 'create.stepper.step_4'
    }
    if (isReview || isRevision) {
      result = {
        steps: formStepper.STEP_3,
        key: 'create.stepper.step_3'
      }
    }

    return result
  }, [isReview, isRevision])

  return (
    <div className="ui-w-full">
      <div className="ui-flex ui-gap-2 ui-items-start">
        {stepper.steps.map((step, index) => (
          <button
            key={step.key}
            type="button"
            className={cx("ui-flex-1 ui-space-y-2 ui-cursor-default", {
              "!ui-cursor-pointer": index < currentStep,
            })}
            onClick={() => {
              if (index < currentStep) setCurrentStep(index)
            }}
          >
            <div
              className={cx("ui-w-full ui-h-2 ui-rounded-full ui-bg-primary-500", {
                "ui-bg-[#15803D]": index < currentStep,
                "ui-bg-[#F5F5F4]": index > currentStep,
              })}
            />
            <div
              className={cx("ui-text-primary-500", {
                "ui-text-primary-800": index < currentStep,
                "ui-text-neutral-500": index > currentStep,
              })}
            >
              <p className="ui-text-base ui-font-bold">
                {index + 1}{'. '}{(t(stepper.key as any, { returnObjects: true })[index])}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

export default AnnualPlanningProcessStepper