import React from 'react'
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '#components/form-control'
import { InputNumberV2 } from '#components/input-number-v2'
import { ReactSelectAsync } from '#components/react-select'
import { KfaLevelEnum } from '#constants/material'
import { useProgram } from '#hooks/program/useProgram'
import { Controller, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import {
  loadMaterial,
  loadMaterialSubtype,
} from '../../services/program-plan-material-ratio.services'

type ProgramPlanMaterialRatioFormInputProps = {
  title: string
  inputName: string
  opponentName: string
}

const ProgramPlanMaterialRatioFormInput = ({
  inputName,
  title,
  opponentName,
}: ProgramPlanMaterialRatioFormInputProps) => {
  const { t } = useTranslation(['common', 'programPlanMaterialRatio'])
  const { control, watch, setValue } = useFormContext()
  const { activeProgram } = useProgram()

  const subTypeName = `${inputName}.subtype`
  const materialName = `${inputName}.material`
  const amountName = `${inputName}.amount`
  const subTypeOpponent = `${opponentName}.subtype`
  const materialOpponent = `${opponentName}.material`

  return (
    <div className="ui-w-full ui-p-6 ui-border ui-border-neutral-300 ui-rounded-lg">
      <h5 className="ui-font-bold ui-text-base ui-text-dark-teal ui-mb-6">
        {title}
      </h5>
      <Controller
        name={subTypeName}
        control={control}
        render={({ field, fieldState: { error } }) => (
          <FormControl className="ui-w-full ui-mb-6">
            <FormLabel htmlFor={subTypeName} required>
              {t('programPlanMaterialRatio:subtype')}
            </FormLabel>
            <ReactSelectAsync
              {...field}
              key={`${subTypeName}__${field.value?.value}`}
              id={subTypeName}
              loadOptions={loadMaterialSubtype}
              placeholder={t('programPlanMaterialRatio:select_subtype')}
              additional={{
                page: 1,
                exclude_ids: watch(subTypeOpponent)?.value
                  ? [Number(watch(subTypeOpponent)?.value)]
                  : null,
              }}
              onChange={(selectedOption) => {
                field.onChange(selectedOption)
                setValue(materialName, null)
              }}
              error={!!error?.message}
              menuPosition="fixed"
            />
            {error?.message && (
              <FormErrorMessage>{error.message}</FormErrorMessage>
            )}
          </FormControl>
        )}
      />
      <Controller
        name={materialName}
        control={control}
        render={({ field, fieldState: { error } }) => (
          <FormControl className="ui-w-full ui-mb-6">
            <FormLabel htmlFor={materialName} required>
              {t('programPlanMaterialRatio:material')}
            </FormLabel>
            <ReactSelectAsync
              {...field}
              key={`${materialName}__${field.value?.value}_${watch(subTypeName)?.value}`}
              id={materialName}
              loadOptions={loadMaterial}
              placeholder={t('programPlanMaterialRatio:select_material')}
              additional={{
                page: 1,
                program_id: activeProgram?.id,
                with_kfa_code: true,
                material_level_id: KfaLevelEnum.KFA_92,
                material_subtype_ids: watch(subTypeName)?.value,
                exclude_ids: watch(materialOpponent)?.value
                  ? [Number(watch(materialOpponent)?.value)]
                  : null,
              }}
              onChange={(selectedOption) => {
                field.onChange(selectedOption)
              }}
              error={!!error?.message}
              menuPosition="fixed"
            />
            {error?.message && (
              <FormErrorMessage>{error.message}</FormErrorMessage>
            )}
          </FormControl>
        )}
      />
      <Controller
        control={control}
        name={amountName}
        render={({
          field: { value, onChange, ...field },
          fieldState: { error },
        }) => (
          <FormControl className="ui-w-full">
            <FormLabel htmlFor={amountName} required>
              {t('programPlanMaterialRatio:ratio_number')}
            </FormLabel>
            <InputNumberV2
              {...field}
              id={amountName}
              placeholder={t('programPlanMaterialRatio:example_1')}
              value={value as unknown as number}
              onValueChange={(e) => onChange(e.floatValue || null)}
              error={!!error?.message}
              maxLength={11}
            />
            {error?.message && (
              <FormErrorMessage>{error?.message}</FormErrorMessage>
            )}
          </FormControl>
        )}
      />
    </div>
  )
}

export default ProgramPlanMaterialRatioFormInput
