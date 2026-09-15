'use client'

import { useQuery } from '@tanstack/react-query'
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '#components/form-control'
import { OptionType, ReactSelectAsync } from '#components/react-select'
import { getLocationLevels, loadLocations } from '#services/locations'
import { clearField } from '#utils/form'
import { getReactSelectValue } from '#utils/react-select'
import { useEffect, useRef } from 'react'
import {
  Control,
  Controller,
  FieldErrors,
  UseFormClearErrors,
  UseFormSetValue,
  UseFormWatch,
  useFormContext,
} from 'react-hook-form'

type LocationLevelLabels = Record<number, string>

export type LocationAncestor = { id: number; name: string; level: number }

type LocationPickerProps = {
  name: string
  // How many levels to render. Leave unset to use the hierarchy's actual
  // depth (fetched from GET /core/master/locations/levels, cached) — a
  // newly-added administrative level then shows up with no code change.
  // Pass an explicit value when a screen intentionally caps shallower than
  // the full hierarchy (e.g. a filter that only ever goes down to regency).
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
  // ("province"/"regency"/"village" vs. a different country's "state"/
  // "county"/"city") is resolved server-side (c.var.t, in the request's
  // language) via the same fetch that supplies maxLevel, not looked up
  // from a frontend locale file.
  levelLabels?: LocationLevelLabels
  levelPlaceholders?: LocationLevelLabels
  isClearable?: boolean
  required?: boolean
  // How the per-level dropdowns are arranged. 'row' (default) lays them out
  // side by side (wrapping if there isn't room); 'column' stacks them, one
  // per line. Purely presentational — doesn't affect cascade/clear behavior.
  layout?: 'row' | 'column'
  // The root->leaf ancestor chain for the CURRENT value (e.g. an entity
  // detail response's `locations` field), used to pre-fill each level's
  // dropdown with its label on mount -- without this, editing an existing
  // record shows the correct resolved `location_id` but every dropdown
  // renders empty/unlabeled until the user re-picks each level by hand.
  // Applied once per distinct leaf id (re-fetching the same record won't
  // re-clobber anything the user has since changed).
  defaultLocations?: LocationAncestor[]
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
  // Fires whenever the resolved number of rendered levels changes (once,
  // when maxLevel is an explicit prop; after the live-depth fetch settles,
  // when it isn't). For a caller that sizes its own wrapper around this
  // component (e.g. Filter.tsx spanning N grid columns) -- without this,
  // that sizing has no way to know the real count once it depends on a
  // fetch this component owns internally.
  onLevelCountChange?: (count: number) => void
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
 * adding a level later is a data change (a new `locations` row at that
 * level), not a code change -- both depth and per-level label/placeholder
 * come from GET /core/master/locations/levels (see #services/locations),
 * resolved server-side in the request's language.
 */
export function LocationPicker({
  name,
  maxLevel: maxLevelProp,
  onChange,
  disabled,
  label,
  levelLabels,
  levelPlaceholders,
  isClearable = true,
  required,
  isMulti,
  layout = 'row',
  defaultLocations,
  onLevelCountChange,
  control: controlProp,
  setValue: setValueProp,
  watch: watchProp,
  clearErrors: clearErrorsProp,
  errors: errorsProp,
}: LocationPickerProps) {
  // Depth + per-level label/placeholder, already resolved server-side in
  // the request's language -- fetched once, cached for the session (it
  // changes approximately never, only when an administrative level is
  // actually added). A call site that passes maxLevel explicitly never
  // needs this for depth, but still uses it for labels unless it also
  // passes its own levelLabels/levelPlaceholders override.
  const { data: fetchedLevels } = useQuery({
    queryKey: ['location-levels'],
    queryFn: getLocationLevels,
    staleTime: Infinity,
  })
  const maxLevel = maxLevelProp ?? Math.max((fetchedLevels?.length ?? 1) - 1, 0)

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

  useEffect(() => {
    onLevelCountChange?.(levels.length)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [levels.length])

  // Seed each level's dropdown label from the ancestor chain once per
  // distinct leaf id (e.g. once per entity loaded into an edit form) --
  // guards against re-seeding on every render, and against clobbering a
  // level the user has since changed by hand.
  const seededLeafIdRef = useRef<number | null>(null)
  useEffect(() => {
    if (!defaultLocations || defaultLocations.length === 0) return
    const leaf = defaultLocations.reduce((deepest, loc) =>
      loc.level > deepest.level ? loc : deepest
    )
    if (seededLeafIdRef.current === leaf.id) return
    seededLeafIdRef.current = leaf.id

    defaultLocations
      .filter((loc) => loc.level <= maxLevel)
      .forEach((loc) => {
        const option: OptionType = { label: loc.name, value: loc.id }
        setValue(levelFieldName(name, loc.level), isMulti ? [option] : option)
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultLocations])

  // Terminology per depth ("province"/"regency"/"village" vs. a different
  // deployment's "state"/"county"/"city") comes from the same fetch as
  // maxLevel -- already resolved server-side, no frontend locale lookup.
  // A level the fetch hasn't returned (still loading, or genuinely beyond
  // what the backend knows about) falls back to a plain "Level N" rather
  // than rendering blank.
  const resolveLevelLabel = (level: number) => {
    if (levelLabels?.[level]) return levelLabels[level]
    return fetchedLevels?.[level]?.label ?? `Level ${level}`
  }

  const resolveLevelPlaceholder = (level: number) => {
    if (levelPlaceholders?.[level]) return levelPlaceholders[level]
    return fetchedLevels?.[level]?.placeholder
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
