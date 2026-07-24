'use client'

import { useEffect } from 'react'
import { yupResolver } from '@hookform/resolvers/yup'
import { Spinner } from '@repo/ui/components/spinner'
import { Button } from '#components/button'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import useSmileRouter from '#hooks/useSmileRouter'
import { FormProvider, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { useProgramPlanDetailData } from '../../../program-plan/list/hooks/useProgramPlanDetailData'
import { TProgramPlanRatioData } from '../../list/libs/program-plan-ratio.list.type'
import { useSubmitProgramPlanMaterialRatio } from '../hooks/useSubmitProgramPlanMaterialRatio'
import { programPlanMaterialRatioFormValidation } from '../libs/program-plan-material-ratio-form.validation-schema'
import ProgramPlanMaterialRatioFormInput from './ProgramPlanMaterialRatioFormInput'

type TProgramPlanMaterialRatioFormProps = {
  readonly data?: TProgramPlanRatioData
}

export default function ProgramPlanMaterialRatioForm({
  data,
}: TProgramPlanMaterialRatioFormProps) {
  const { t } = useTranslation([
    'common',
    'programPlanMaterialRatio',
    'programPlan',
  ])
  const router = useSmileRouter()
  const { id: plan_id } = router.query
  const { isFetchingDetailProgramPlan, isLoadingDetailProgramPlan } =
    useProgramPlanDetailData()

  const methods = useForm({
    mode: 'onChange',
    resolver: yupResolver(programPlanMaterialRatioFormValidation(t)),
  })

  useEffect(() => {
    methods.reset({
      from_material: {
        subtype: data?.from_subtype
          ? {
              label: data.from_subtype.name,
              value: data.from_subtype.id,
            }
          : null,
        material: data?.from_material
          ? {
              label: data.from_material.name,
              value: data.from_material.id,
            }
          : null,
        amount: data?.from_material_qty ?? '',
      },
      to_material: {
        subtype: data?.to_subtype
          ? {
              label: data.to_subtype.name,
              value: data.to_subtype.id,
            }
          : null,
        material: data?.to_material
          ? {
              label: data.to_material.name,
              value: data.to_material.id,
            }
          : null,
        amount: data?.to_material_qty ?? '',
      },
    })
  }, [data])

  const { handleSubmit, setError } = methods

  const { mutate, isPending } = useSubmitProgramPlanMaterialRatio({
    setError,
  })

  useSetLoadingPopupStore(isPending)

  if (isLoadingDetailProgramPlan || isFetchingDetailProgramPlan) {
    return (
      <div className="ui-flex ui-justify-center">
        <Spinner className="ui-w-10 ui-h-10" />
      </div>
    )
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit((data) => mutate(data))}>
        <div className="ui-flex ui-justify-center ui-items-start ui-gap-6 ui-mb-6">
          <ProgramPlanMaterialRatioFormInput
            title={`${t('programPlanMaterialRatio:material_a')} (${t('programPlanMaterialRatio:source_material')})`}
            inputName="from_material"
            opponentName="to_material"
          />
          <ProgramPlanMaterialRatioFormInput
            title={`${t('programPlanMaterialRatio:material_b')} (${t('programPlanMaterialRatio:affected_material')})`}
            inputName="to_material"
            opponentName="from_material"
          />
        </div>
        <div className="ui-flex ui-justify-end ui-items-center ui-gap-4">
          <Button
            id="btn_close_pop_up_form_program_plan_material_ratio"
            variant="default"
            type="button"
            onClick={() =>
              router.push(`/v5/program-plan/${plan_id}/substitution`)
            }
          >
            {t('common:back')}
          </Button>
          <Button
            id="btn_submit_pop_up_form_for_program_plan_material_ratio"
            type="submit"
            disabled={!methods.formState.isValid}
          >
            {t('common:save')}
          </Button>
        </div>
      </form>
    </FormProvider>
  )
}
