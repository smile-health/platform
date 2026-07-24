'use client'

import { useEffect } from 'react'
import { yupResolver } from '@hookform/resolvers/yup'
import { Button } from '#components/button'
import { EmptyState } from '#components/empty-state'
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '#components/form-control'
import { ReactSelectAsync } from '#components/react-select'
import { BOOLEAN } from '#constants/common'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import useSmileRouter from '#hooks/useSmileRouter'
import { FormProvider, useFieldArray, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { TAnnualPlanningSubstitutionData } from '../../list/libs/annual-planning-substitution-list.type'
import { loadPlannedMaterialOptions } from '../../services/annual-planning-substitution.services'
import { useSubmitAnnualPlanningSubstitution } from '../hooks/useSubmitAnnualPlanningSubstitution'
import { annualPlanningSubstitutionFormValidation } from '../libs/annual-planning-substitution-form.validation-schema'
import AnnualPlanningSubstitutionFormSubtituteMaterialInfo from './AnnualPlanningSubstitutionFormSubtituteMaterialInfo'
import AnnualPlanningSubstitutionFormSubtituteMaterialInput from './AnnualPlanningSubstitutionFormSubtituteMaterialInput'

type TAnnualPlanningSubstitutionFormProps = {
  readonly data?: TAnnualPlanningSubstitutionData
}

export default function AnnualPlanningSubstitutionForm({
  data,
}: TAnnualPlanningSubstitutionFormProps) {
  const { t } = useTranslation([
    'common',
    'annualPlanningSubstitution',
    'programPlan',
  ])
  const router = useSmileRouter()
  const { id: plan_id } = router.query

  const methods = useForm({
    mode: 'onChange',
    defaultValues: {
      material: null,
      substitution_materials: [],
    },
    resolver: yupResolver(annualPlanningSubstitutionFormValidation(t)),
  })

  const {
    handleSubmit,
    setError,
    control,
    setValue,
    watch,
    reset,
    formState: { errors },
    trigger,
  } = methods

  const { fields, remove, append } = useFieldArray({
    control,
    name: 'substitution_materials',
  })

  useEffect(() => {
    reset({
      material: data?.material
        ? { label: data.material.name, value: data.material.id }
        : null,

      substitution_materials:
        data?.substitution_materials?.map((item) => ({
          substitution_material_child: item
            ? { label: item.name, value: item.id }
            : null,
        })) ?? [],
    })
  }, [data, reset])

  const { mutate, isPending } = useSubmitAnnualPlanningSubstitution({
    setError,
  })

  useSetLoadingPopupStore(isPending)

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit((data) => mutate(data))}
        className="ui-mt-6 ui-w-1/2 ui-mx-auto ui-p-6 ui-border ui-border-neutral-300 ui-rounded-lg mx-auto"
      >
        <FormControl className="ui-mb-6">
          <FormLabel htmlFor="select_material" required>
            {t('annualPlanningSubstitution:table.planned_material')}
          </FormLabel>
          <ReactSelectAsync
            key={watch('material')?.value ?? 'select_material'}
            id="select_material"
            name="material"
            value={watch('material') ?? null}
            loadOptions={loadPlannedMaterialOptions}
            onChange={(option) => {
              setValue('material', option ?? null)
              setValue('substitution_materials', [])
              trigger('material')
            }}
            debounceTimeout={300}
            isClearable
            placeholder={t('annualPlanningSubstitution:select_material')}
            additional={{
              page: 1,
              plan_id: Number(plan_id),
              is_planned_only: BOOLEAN.TRUE,
            }}
            menuPosition="fixed"
          />
          {errors?.material && (
            <FormErrorMessage>{errors?.material?.message}</FormErrorMessage>
          )}
        </FormControl>
        <div className="ui-my-4 ui-space-y-6 ui-p-6 ui-border ui-border-neutral-300 ui-rounded-lg">
          <AnnualPlanningSubstitutionFormSubtituteMaterialInfo
            append={append}
          />
          <div className="ui-min-h-64 ui-overflow-auto ui-max-h-sm ui-w-full">
            {fields.length > 0 ? (
              fields?.map((field: { id: string }, index: number) => (
                <AnnualPlanningSubstitutionFormSubtituteMaterialInput
                  key={index?.toString()}
                  index={index}
                  remove={remove}
                  field={field}
                />
              ))
            ) : (
              <EmptyState
                withIcon
                title={t('common:message.empty.title')}
                description={t('common:message.empty.description')}
              />
            )}
          </div>
        </div>
        <div className="ui-grid ui-grid-cols-2 ui-gap-4">
          <Button
            id="btn_close_pop_up_form_annual_planning_substitution"
            variant="default"
            type="button"
            onClick={() =>
              router.push(`/v5/program-plan/${plan_id}/substitution`)
            }
          >
            {t('common:back')}
          </Button>
          <Button
            id="btn_submit_pop_up_form_for_annual_planning_substitution"
            type="submit"
          >
            {t('common:save')}
          </Button>
        </div>
      </form>
    </FormProvider>
  )
}
