import React from 'react'
import { Button } from '#components/button'
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '#components/form-control'
import XMark from '#components/icons/XMark'
import { ReactSelectAsync } from '#components/react-select'
import { BOOLEAN } from '#constants/common'
import useSmileRouter from '#hooks/useSmileRouter'
import { Controller, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { loadPlannedMaterialOptions } from '../../services/annual-planning-substitution.services'
import { AnnualPlanningSubstitutionFormData } from '../libs/annual-planning-substitution-form.type'

type AnnualPlanningSubstitutionFormSubtituteMaterialInputProps = {
  remove: (index: number) => void
  field: {
    id: string
  }
  index: number
}

const AnnualPlanningSubstitutionFormSubtituteMaterialInput = ({
  index,
  remove,
  field,
}: AnnualPlanningSubstitutionFormSubtituteMaterialInputProps) => {
  const { t } = useTranslation(['common', 'annualPlanningSubstitution'])
  const {
    watch,
    control,
    formState: { errors },
  } = useFormContext<AnnualPlanningSubstitutionFormData>()

  const router = useSmileRouter()
  const { id: plan_id } = router.query
  const targetGroupChildErrorMessage =
    errors.substitution_materials?.[index]?.substitution_material_child?.message

  const selectedSubstitutionArray = watch('substitution_materials')
    ?.map((item) => item.substitution_material_child?.value)
    ?.filter((item) => !!item)

  const excludeIdsForOptions = watch('material')?.value
    ? [...(selectedSubstitutionArray || []), watch('material')?.value]
    : selectedSubstitutionArray

  return (
    <div
      className="ui-flex ui-justify-start ui-items-start ui-gap-4 ui-mb-6"
      key={field.id}
    >
      <FormControl className="ui-w-full">
        <FormLabel
          htmlFor={`substitution_materials.${index}.substitution_material_child_id`}
          required
        >
          {t('annualPlanningSubstitution:actual_distribution_material')}
        </FormLabel>
        <Controller
          name={`substitution_materials.${index}.substitution_material_child`}
          control={control}
          render={({ field, fieldState: { error } }) => (
            <ReactSelectAsync
              {...field}
              key={`substitution_materials__${watch('material')?.value}__${index}`}
              id={`substitution_materials.${index}.substitution_material_child_id`}
              disabled={false}
              loadOptions={loadPlannedMaterialOptions}
              placeholder={t(
                'annualPlanningSubstitution:select_actual_distribution_material'
              )}
              additional={{
                page: 1,
                plan_id: Number(plan_id),
                exclude_ids: excludeIdsForOptions?.join(',') ?? null,
                is_planned_only: BOOLEAN.FALSE,
              }}
              error={!!error?.message}
              menuPosition="fixed"
            />
          )}
        />
        {targetGroupChildErrorMessage && (
          <FormErrorMessage>{targetGroupChildErrorMessage}</FormErrorMessage>
        )}
      </FormControl>
      <Button
        type="button"
        className="ui-mt-5"
        variant="subtle"
        color="danger"
        rightIcon={<XMark />}
        onClick={() => remove(index)}
      >
        {t('common:remove')}
      </Button>
    </div>
  )
}

export default AnnualPlanningSubstitutionFormSubtituteMaterialInput
