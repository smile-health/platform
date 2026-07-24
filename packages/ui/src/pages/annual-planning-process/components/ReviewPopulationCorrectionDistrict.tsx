import { Button } from "#components/button"
import { useTranslation } from "react-i18next"
import { FormProvider, useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import { formSchemaReviewPopulationCorrection } from "../annual-planning-process.schemas"
import { FormPopulationCorrectionDataForm } from "../annual-planning-process.types"
import { useContext, useEffect } from "react"
import { AnnualPlanningProcessCreateContext } from "../context/ContextProvider"
import TablePopulationCorrection from "./TablePopulationCorrection"
import Eraser from "#components/icons/Eraser"
import FileCheck from "#components/icons/FileCheck"
import { ProcessStatus } from "../annual-planning-process.constants"

const ReviewPopulationCorrectionDistrict: React.FC = () => {
  const { t } = useTranslation(['annualPlanningProcess', 'common'])
  const {
    parentForm,
    updateForm,
  } = useContext(AnnualPlanningProcessCreateContext)

  const methods = useForm<FormPopulationCorrectionDataForm>({
    resolver: yupResolver(formSchemaReviewPopulationCorrection),
    mode: 'onChange',
    defaultValues: {
      data: parentForm?.population_correction ?? []
    },
  })

  const {
    watch,
    formState: { isValid },
    setValue
  } = methods

  const values = watch('data')

  const handleSetStatusAll = (status: ProcessStatus) => {
    const newValue = values.map(x => ({ ...x, data: x.data?.map(y => ({ ...y, status })) }))
    methods.setValue('data', newValue, { shouldValidate: true })
  }

  const handleNextStep = () => {
    updateForm('population_correction', values)
  }

  useEffect(() => {
    if (values.length === 0) {
      setValue('data', parentForm?.population_correction ?? [])
    }
  }, [parentForm?.population_correction])

  return (
    <div className="ui-border ui-border-neutral-300 ui-p-6 ui-space-y-6">
      <div className="ui-flex ui-justify-between ui-items-center">
        <p className="ui-text-base ui-font-bold">
          {t('annualPlanningProcess:create.form.drawer_correction_data.health_care_list')}
        </p>
        <div className="ui-flex ui-gap-6 ui-items-center">
          <Button
            type="button"
            variant="subtle"
            color="danger"
            leftIcon={<Eraser />}
            onClick={() => handleSetStatusAll(ProcessStatus.REJECT)}
            size="sm"
            className="ui-p-1"
          >
            {t('annualPlanningProcess:create.form.district_ip.drawer.revise_all')}
          </Button>
          <Button
            type="button"
            variant="subtle"
            leftIcon={<FileCheck />}
            onClick={() => handleSetStatusAll(ProcessStatus.APPROVED)}
            size="sm"
            className="ui-p-1"
          >
            {t('annualPlanningProcess:create.form.district_ip.drawer.approve_all')}
          </Button>
          <span
            className="ui-h-6 ui-w-px ui-bg-neutral-300"
          />
          <Button
            type="button"
            disabled={!isValid}
            onClick={handleNextStep}
          >
            {t('annualPlanningProcess:create.form.drawer_correction_data.button.save_and_next')}
          </Button>
        </div>
      </div>
      <FormProvider {...methods}>
        <TablePopulationCorrection />
      </FormProvider>
    </div>
  )
}

export default ReviewPopulationCorrectionDistrict