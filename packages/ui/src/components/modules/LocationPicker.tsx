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
import {
  Control,
  Controller,
  FieldErrors,
  UseFormClearErrors,
  UseFormSetValue,
  UseFormWatch,
  useFormContext,
} from 'react-hook-form'
import { useTranslation } from 'react-i18next'

type LocationLevelLabels = Record<number, string>

type LocationPickerProps = {
  name: string
  maxLevel?: number
  onChange?: (
    locationId: number | number[] | null | undefined
  ) => void
  disabled?: boolean
  label?: string
  // When true, every level renders as a multi-select and the resolved
  // `name` value is the UNION (flattened) of every level's selected ids,
  // rather than only the deepest level's single value. Selecting a parent
  // level does NOT clear deeper levels in this mode (see resolveLocationId).
  isMulti?: boolean
  // Optional per-call override. Normally leave unset — level terminology
  // (province/regency/village vs. a different country's state/county/city)
  // is a deployment concern, driven by `common:form.location_levels` in the
  // active locale file, not something each form should hardcode.
  levelLabels?: LocationLevelLabels
  levelPlaceholders?: LocationLevelLabels
  isClearable?: boolean
  required?: boolean
  // How the per-level dropdowns are arranged. 'row' (default) lays them out
  // side by side (wrapping if there isn't room); 'column' stacks them, one
  // per line. Purely presentational — doesn't affect cascade/clear behavior.
  layout?: 'row' | 'column'
  // Optional react-hook-form bindings. Pass these when the surrounding page
  // doesn't wrap the form tree in <FormProvider> and instead injects RHF
  // methods as props directly (e.g. packages/ui's declarative Filter.tsx,
  // which never sets up form context) — otherwise this falls back to
  // useFormContext(), which is how the entity create/edit form (a real
  // <FormProvider>) already uses this component.
  control?: Control<any>
  setValue?: UseFormSetValue<any>
  watch?: UseFormWatch<any>
  clearErrors?: UseFormClearErrors<any>
  errors?: FieldErrors<any>
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
  isMulti,
  layout = 'row',
  control: controlProp,
  setValue: setValueProp,
  watch: watchProp,
  clearErrors: clearErrorsProp,
  errors: errorsProp,
}: LocationPickerProps) {
  const { t } = useTranslation('common')
  // useFormContext() returns null (rather than throwing) when there's no
  // ancestor <FormProvider> -- safe to call unconditionally even when the
  // caller supplies its own bindings via props (e.g. Filter.tsx, which
  // injects RHF methods directly instead of using context).
  const formContext = useFormContext()
  const control = (controlProp ?? formContext?.control) as Control<any>
  const setValue = (setValueProp ??
    formContext?.setValue) as UseFormSetValue<any>
  const watch = (watchProp ?? formContext?.watch) as UseFormWatch<any>
  const clearErrors = (clearErrorsProp ??
    formContext?.clearErrors) as UseFormClearErrors<any>
  const errors = errorsProp ?? formContext?.formState?.errors ?? {}

  if (!control || !setValue || !watch || !clearErrors) {
    throw new Error(
      'LocationPicker: no react-hook-form bindings available -- render it ' +
        'inside a <FormProvider>, or pass control/setValue/watch/clearErrors as props.'
    )
  }

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

  // Multi-select mode collapses every level's selection into one flat
  // `number[]` (union across levels), and reads back the just-changed
  // level's own new value directly (RHF hasn't committed `fieldOnChange`
  // to `watch` yet inside the same handler) rather than the `watch()` value.
  const resolveMultiValue = (level: number, options: OptionType[] | null) => {
    return levels.reduce<number[]>((acc, l) => {
      const levelValue =
        l === level ? options : watch(levelFieldName(name, l))
      const ids = Array.isArray(levelValue)
        ? levelValue.map((opt) => opt?.value).filter((v) => v != null)
        : []
      return acc.concat(ids)
    }, [])
  }

  const resolveLocationId = (
    level: number,
    option: OptionType | OptionType[] | null
  ) => {
    if (isMulti) {
      // Tradeoff: deeper levels are intentionally NOT cleared when a parent
      // level's selection changes (a broad province pick and a separately
      // chosen village pick can coexist per the spec). Consequence: if a
      // parent selection is removed, any deeper-level selections that were
      // scoped under it remain in the resolved union even though their
      // dropdown options are no longer reachable via the UI until a parent
      // is re-picked. This favors "never silently lose a user's picks" over
      // strict UI/state consistency.
      const locationIds = resolveMultiValue(level, option as OptionType[])
      setValue(name, locationIds)
      clearErrors(name)
      onChange?.(locationIds)
      return
    }

    // Clear all deeper levels generically (by index, not by hardcoded name).
    const deeperFieldNames = levels
      .filter((l) => l > level)
      .map((l) => levelFieldName(name, l))

    if (deeperFieldNames.length > 0) {
      clearField({ setValue, name: deeperFieldNames })
    }

    const locationId = (option as OptionType | null)?.value ?? null
    setValue(name, locationId)
    clearErrors(name)
    onChange?.(locationId)
  }

  return (
    <div
      className={
        layout === 'row'
          ? 'ui-grid ui-gap-x-6 ui-gap-y-6'
          : 'ui-grid ui-grid-cols-1 ui-gap-y-6'
      }
      style={
        layout === 'row'
          ? { gridTemplateColumns: `repeat(${levels.length}, minmax(0, 1fr))` }
          : undefined
      }
    >
      {levels.map((level) => {
        const parentFieldName =
          level > 0 ? levelFieldName(name, level - 1) : undefined
        const parentValue = parentFieldName ? watch(parentFieldName) : undefined
        const parentSelectValue = getReactSelectValue(parentValue)
        const isFirstLevel = level === 0
        const isDisabled = disabled || (!isFirstLevel && !parentSelectValue)

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
                  key={isFirstLevel ? 'first-level' : `level-${level}-${parentSelectValue}`}
                  isMulti={isMulti}
                  loadOptions={loadLocations}
                  debounceTimeout={300}
                  isClearable={isClearable}
                  disabled={isDisabled}
                  placeholder={resolveLevelPlaceholder(level)}
                  additional={{
                    page: 1,
                    level,
                    ...(parentSelectValue && { parent_id: parentSelectValue }),
                  }}
                  onChange={(option: OptionType | OptionType[]) => {
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
    </div>
  )
}

export default LocationPicker
