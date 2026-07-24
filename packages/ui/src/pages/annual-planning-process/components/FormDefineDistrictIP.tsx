import { Button } from "#components/button"
import { DataTable } from "#components/data-table"
import { useTranslation } from "react-i18next"
import InformationAnnualPlanning from "./InformationAnnualPlanning"
import { columnsMaterialList } from "../annual-planning-process.table-form-district-ip"
import { FormDefineDistrictIPDataForm } from "../annual-planning-process.types"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import { formSchemaDefineDistrictIP } from "../annual-planning-process.schemas"
import { useContext, useEffect, useState } from "react"
import { AnnualPlanningProcessCreateContext } from "../context/ContextProvider"
import FormDefineDistrictIPInput from "./FormDefineDistrictIPInput"

const FormDefineDistrictIP: React.FC = () => {
  const { t, i18n: { language } } = useTranslation('annualPlanningProcess')
  const {
    parentForm,
    updateForm,
    isReview,
    isRevision,
  } = useContext(AnnualPlanningProcessCreateContext)
  const [dataSelected, setDataSelected] = useState<{
    open: boolean
    data: FormDefineDistrictIPDataForm | null
  }>({ open: false, data: null })

  const methods = useForm<FormDefineDistrictIPDataForm>({
    resolver: yupResolver(formSchemaDefineDistrictIP(t, true)),
    mode: 'onChange',
    defaultValues: {
      data: parentForm?.usage_index ?? []
    },
  })

  const {
    watch,
    formState: { isValid },
    setValue,
  } = methods

  useEffect(() => {
    setValue(
      'data', parentForm?.usage_index ?? [], { shouldValidate: true }
    )
  }, [parentForm?.usage_index])

  const handleChangeIP = () => {
    const currentData = watch()
    if (currentData.data) setDataSelected({ open: true, data: currentData })
  }

  const handleClose = () => setDataSelected({ open: false, data: null })

  const handleNextStep = () => {
    const values = watch('data')

    updateForm('usage_index', values)
  }

  return (
    <div className="ui-space-y-6">
      {dataSelected.open && (
        <FormDefineDistrictIPInput
          dataIP={dataSelected.data}
          onClose={handleClose}
          handleUpdateForm={async values => {
            setValue('data', values.data, { shouldValidate: true })
            handleClose()
          }}
        />
      )}
      <div className="ui-space-y-3">
        <InformationAnnualPlanning />

        <div className="ui-border ui-border-neutral-300 ui-p-6 ui-space-y-6">
          <div className="ui-flex ui-justify-between ui-items-center">
            <p className="ui-text-base ui-font-bold">
              {t('table_title.material_list')}
            </p>
            <div className="ui-flex ui-gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleChangeIP}
              >
                {t('create.form.district_ip.drawer.title')}
              </Button>
              <Button
                type="button"
                disabled={!isValid}
                onClick={handleNextStep}
              >
                {t('create.form.district_ip.drawer.see_calculation_result')}
              </Button>
            </div>
          </div>

          <DataTable
            columns={columnsMaterialList({ t, language, isReview, isRevision })}
            data={watch('data') || []}
          />
        </div>
      </div>
    </div>
  )
}

export default FormDefineDistrictIP