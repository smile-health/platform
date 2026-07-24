import { useContext, useEffect } from "react"
import { Controller, useForm } from "react-hook-form"
import { formSchemaArea } from "../annual-planning-process.schemas"
import { useTranslation } from "react-i18next"
import { yupResolver } from "@hookform/resolvers/yup"
import { FormControl, FormErrorMessage, FormLabel } from "#components/form-control"
import { CommonPlaceSelector } from "#components/modules/CommonPlaceSelector"
import { FormAreaProgramPlanForm } from "../annual-planning-process.types"
import { ReactSelectAsync } from "#components/react-select"
import { Button } from "#components/button"
import { AnnualPlanningProcessCreateContext } from "../context/ContextProvider"
import { loadProgramPlan } from "../annual-planning-process.services"

const FormAreaProgramPlan: React.FC = () => {
  const { t } = useTranslation(['annualPlanningProcess', 'common'])
  const {
    parentForm,
    updateForm,
    isDraft,
  } = useContext(AnnualPlanningProcessCreateContext)

  const { handleSubmit, control, watch, setValue } = useForm<FormAreaProgramPlanForm>({
    defaultValues: parentForm.area_program_plan || {},
    mode: 'onChange',
    resolver: yupResolver(formSchemaArea(t))
  })

  const onSubmit = (data: FormAreaProgramPlanForm) => {
    updateForm('area_program_plan', data)
  }

  const province = watch('province')

  useEffect(() => {
    if (parentForm.area_program_plan?.id) {
      setValue('id', parentForm.area_program_plan?.id)
      setValue('province', parentForm.area_program_plan?.province)
      setValue('regency', parentForm.area_program_plan?.regency)
      setValue('program_plan', parentForm.area_program_plan?.program_plan)
    }
  }, [parentForm.area_program_plan?.id])

  return (
    <div className="ui-justify-self-center ui-w-[480px] ui-border ui-p-6">
      <form
        className="ui-space-y-6"
        onSubmit={handleSubmit(onSubmit)}
        id="FormAreaProgramPlan"
      >
        <Controller
          name="province"
          control={control}
          render={({ field: { ...field }, fieldState: { error } }) => (
            <FormControl>
              <FormLabel>{t('common:form.province.label')}</FormLabel>
              <CommonPlaceSelector
                {...field}
                id="select-province"
                level="province"
                additional={{
                  page: 1,
                }}
                disabled
              />

              {error?.message && (
                <FormErrorMessage>{error?.message}</FormErrorMessage>
              )}
            </FormControl>
          )}
        />
        <Controller
          name="regency"
          control={control}
          render={({ field: { ...field }, fieldState: { error } }) => (
            <FormControl>
              <FormLabel>{t('common:form.city.label')}</FormLabel>
              <CommonPlaceSelector
                {...field}
                id="select-regency"
                level="regency"
                additional={{
                  page: 1,
                  ...province && {
                    parent_id: province?.value
                  }
                }}
                isClearable
                disabled
              />
              {error?.message && (
                <FormErrorMessage>{error?.message}</FormErrorMessage>
              )}
            </FormControl>
          )}
        />
        <Controller
          name="program_plan"
          control={control}
          render={({ field: { onChange, ...field }, fieldState: { error } }) => (
            <FormControl>
              <FormLabel>{t('annualPlanningProcess:create.form.area_program_plan.program_plan.label')}</FormLabel>
              <ReactSelectAsync
                {...field}
                id="select-program-plan"
                data-testid="select-program-plan"
                loadOptions={loadProgramPlan as any}
                debounceTimeout={300}
                isClearable
                placeholder={t('annualPlanningProcess:create.form.area_program_plan.program_plan.placeholder')}
                additional={{
                  page: 1,
                  key_value: 'id'
                }}
                onChange={(option) => {
                  onChange(option)
                }}
                disabled={!!isDraft}
              />
              {error?.message && (
                <FormErrorMessage>{error?.message}</FormErrorMessage>
              )}
            </FormControl>
          )}
        />

        <Button
          type="submit"
          className="ui-w-full"
          form="FormAreaProgramPlan"
        >
          {t('annualPlanningProcess:create.form.button.process')}
        </Button>
      </form>
    </div>
  )
}

export default FormAreaProgramPlan