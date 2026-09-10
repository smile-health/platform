'use client'

import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '#components/form-control'
import { OptionType, ReactSelectAsync } from '#components/react-select'
import { loadLocations } from '#services/locations'
import { clearField } from '#utils/form'
import { getReactSelectValue } from '#utils/react-select'
import { Controller, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

type LocationLevelLabels = Record<number, string>

type LocationPickerProps = {
  name: string
  maxLevel?: number
  onChange?: (locationId: number | null | undefined) => void
  disabled?: boolean
  label?: string
  // Optional per-call override. Normally leave unset — level terminology
  // (province/regency/village vs. a different country's state/county/city)
  // is a deployment concern, driven by `common:form.location_levels` in the
  // active locale file, not something each form should hardcode.
  levelLabels?: LocationLevelLabels
  levelPlaceholders?: LocationLevelLabels
  isClearable?: boolean
  required?: boolean
}

// Field name used internally in the react-hook-form state for each cascade
// level (not part of the submitted payload — only `name` carries the final
// resolved location_id leaf value).
const levelFieldName = (name: string, level: number) =>
  `${name}__level_${level}`

/**
 * Generic replacement for the 4 hardcoded province/regency/sub_district/
 * village Controllers (see EntityFormLocation.tsx). Renders one cascading
 * ReactSelectAsync per level from 0..maxLevel by mapping over an array, so
 * adding a level later is a prop change, not a code change.
 *
 * ASSUMPTION: backend now exposes a single `location_id` referencing the
 * generic `locations` table (id, parent_id, name, level). This component
 * calls `loadLocations({ parent_id, level })` from
 * `#services/locations` — see that file for the assumed `/core/master/locations`
 * contract, which may need adjusting once the parallel backend migration lands.
 */
export function LocationPicker({
  name,
  maxLevel = 3,
  onChange,
  disabled,
  label,
  levelLabels,
  levelPlaceholders,
  isClearable = true,
  required,
}: LocationPickerProps) {
  const { t } = useTranslation('common')
  const {
    control,
    setValue,
    watch,
    clearErrors,
    formState: { errors },
  } = useFormContext()

  const levels = Array.from({ length: maxLevel + 1 }, (_, index) => index)

  // Terminology per depth ("province"/"regency"/"village" vs. a different
  // deployment's "state"/"county"/"city") is deployment config, not code:
  // it lives in the active locale's `form.location_levels` array, an
  // ordered list of existing `form.<key>.label`/`.placeholder` keys, one
  // per level. A level beyond what the locale defines falls back to a
  // plain "Level N" rather than crashing.
  const localeLevelKeys = t('form.location_levels', {
    returnObjects: true,
    defaultValue: [],
  }) as string[]

  const resolveLevelLabel = (level: number) => {
    if (levelLabels?.[level]) return levelLabels[level]
    const key = localeLevelKeys[level]
    return key ? t(`form.${key}.label`) : `Level ${level}`
  }

  const resolveLevelPlaceholder = (level: number) => {
    if (levelPlaceholders?.[level]) return levelPlaceholders[level]
    const key = localeLevelKeys[level]
    return key ? t(`form.${key}.placeholder`) : undefined
  }

  const resolveLocationId = (level: number, option: OptionType | null) => {
    // Clear all deeper levels generically (by index, not by hardcoded name).
    const deeperFieldNames = levels
      .filter((l) => l > level)
      .map((l) => levelFieldName(name, l))

    if (deeperFieldNames.length > 0) {
      clearField({ setValue, name: deeperFieldNames })
    }

    const locationId = option?.value ?? null
    setValue(name, locationId)
    clearErrors(name)
    onChange?.(locationId)
  }

  return (
    <>
      {levels.map((level) => {
        const parentFieldName =
          level > 0 ? levelFieldName(name, level - 1) : undefined
        const parentValue = parentFieldName ? watch(parentFieldName) : undefined
        const isFirstLevel = level === 0
        const isDisabled =
          disabled || (!isFirstLevel && !getReactSelectValue(parentValue))

        return (
          <Controller
            key={level}
            name={levelFieldName(name, level)}
            control={control}
            render={({ field: { onChange: fieldOnChange, ...field } }) => (
              <FormControl>
                <FormLabel required={isFirstLevel ? required : undefined}>
                  {label && isFirstLevel ? label : resolveLevelLabel(level)}
                </FormLabel>
                <ReactSelectAsync
                  {...field}
                  id={`select-${name}-level-${level}`}
                  key={
                    isFirstLevel ? 'first-level' : `level-${level}-${parentValue?.value}`
                  }
                  loadOptions={loadLocations}
                  debounceTimeout={300}
                  isClearable={isClearable}
                  disabled={isDisabled}
                  placeholder={resolveLevelPlaceholder(level)}
                  additional={{
                    page: 1,
                    level,
                    ...(parentValue?.value && { parent_id: parentValue.value }),
                  }}
                  onChange={(option: OptionType) => {
                    fieldOnChange(option)
                    resolveLocationId(level, option)
                  }}
                />
                {level === 0 && errors[name]?.message && (
                  <FormErrorMessage>
                    {errors[name]?.message as string}
                  </FormErrorMessage>
                )}
              </FormControl>
            )}
          />
        )
      })}
    </>
  )
}

export default LocationPicker
