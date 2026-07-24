import { Button } from "#components/button"
import { DataTable } from "#components/data-table"
import { columnsPopulationTargetHealthCare } from "../annual-planning-process.table-form-population"
import { FormProvider } from "react-hook-form"
import PreviewPopulationCorrection from "./PreviewPopulationCorrection"
import FormPopulationCorrectionDistrictInput from "./FormPopulationCorrectionDistrictInput"
import { useFormPopulationCorrectionDistrict } from "../hooks/useFormPopulationCorrectionDistrict"
import { FormPopulationCorrectionContext } from "../context/ContextProvider"
import { useContext } from "react"

const FormPopulationCorrectionDistrict: React.FC = () => {
  const {
    calculateData,
  } = useContext(FormPopulationCorrectionContext)
  const {
    t,
    language,
    refPreview,
    isRevision,
    dataSelected,
    setValue,
    data,
    methods,
    isValid,
    onClickRow,
    handleClose,
    handleNextStep,
  } = useFormPopulationCorrectionDistrict()

  return (
    <div className="ui-border ui-border-neutral-300 ui-p-6 ui-space-y-6">
      <FormProvider {...methods}>
        <PreviewPopulationCorrection ref={refPreview} />

        {!!dataSelected.data && (
          <FormPopulationCorrectionDistrictInput
            dataPopulation={dataSelected.data}
            index={dataSelected.index}
            onClose={handleClose}
            handleUpdateForm={async values => {
              if (typeof dataSelected.index === 'number') {
                setValue(`data.${dataSelected.index}.data`, values.data, { shouldValidate: true })
                calculateData(data)
                handleClose()
              }
            }}
          />
        )}
      </FormProvider>

      <div className="ui-flex ui-justify-between ui-items-center">
        <p className="ui-text-base ui-font-bold">
          {t('annualPlanningProcess:create.form.drawer_correction_data.health_care_list')}
        </p>
        <div className="ui-flex ui-gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => refPreview.current?.open()}
          >
            {t('annualPlanningProcess:create.form.drawer_correction_data.button.preview')}
          </Button>
          <Button
            type="button"
            disabled={!isValid}
            onClick={handleNextStep}
          >
            {t('annualPlanningProcess:create.form.drawer_correction_data.button.save_and_next')}
          </Button>
        </div>
      </div>
      <DataTable
        columns={columnsPopulationTargetHealthCare({ t, language, onClickRow, isRevision })}
        data={data || []}
        isSticky
        className="ui-max-h-[660px]"
      />
    </div>
  )
}

export default FormPopulationCorrectionDistrict