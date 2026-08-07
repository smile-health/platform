import React, {
  Fragment,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import { useRouter } from 'next/router'
import { parseDate } from '@internationalized/date'
import { useQueryClient } from '@tanstack/react-query'
import { DatePicker, DateRangePicker } from '#components/date-picker'
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '#components/form-control'
import { Input } from '#components/input'
import { InputNumberV2 } from '#components/input-number-v2'
import { MonthYearPicker } from '#components/month-year-picker'
import { Radio } from '#components/radio'
import {
  OptionType,
  ReactSelectAsyncHash,
  ReactSelectWithQuery,
} from '#components/react-select'
import { Switch } from '#components/switch'
import { BOOLEAN } from '#constants/common'
import cx from '#lib/cx'
import { getReactSelectValue } from '#utils/react-select'
import dayjs from 'dayjs'
import {
  createParser,
  parseAsString,
  ParserBuilder,
  useQueryStates,
} from 'nuqs'
import { DateValue } from 'react-aria'
import {
  Control,
  Controller,
  useForm,
  UseFormSetValue,
  UseFormWatch,
} from 'react-hook-form'
import { useTranslation } from 'react-i18next'

const parseISOString = (dateString: string): DateValue | null => {
  if (!dateString) return null
  try {
    return parseDate(dateString.split('T')[0])
  } catch (e) {
    console.error('Invalid date string:', e, dateString)
    return null
  }
}

// Helper to convert calendar date to ISO string
const toISOString = (date: DateValue | string) => {
  if (!date) return ''
  if (typeof date === 'string') return date
  return date.toString()
}

type GetValue = (
  fieldName: string
) => string | number | null | undefined | OptionType | OptionType[] | DateValue
type GetReactSelectValue = (
  fieldName: string
) => string | number | null | undefined
type Disabled =
  | boolean
  | ((params: {
      getValue: GetValue
      getReactSelectValue: GetReactSelectValue
    }) => boolean)

type MaxMinDate = string | ((params: { getValue: GetValue }) => string)
type MaxRangeDate = number | ((params: { getValue: GetValue }) => number)

type InputTextSchema = {
  id?: string
  type: 'text'
  name: string
  label: string
  placeholder?: string
  required?: boolean
  disabled?: Disabled
  hidden?: Disabled
  className?: string
  defaultValue: string
  maxLength?: number
}

type InputNumberSchema = {
  id?: string
  type: 'number'
  name: string
  label: string
  placeholder?: string
  required?: boolean
  disabled?: Disabled
  hidden?: Disabled
  className?: string
  defaultValue: string
}

type SelectSchema = {
  id?: string
  type: 'select'
  name: string
  label: string
  placeholder?: string
  isMulti?: boolean
  disabled?: Disabled
  hidden?: Disabled
  required?: boolean | string
  className?: string
  clearOnChangeFields?: Array<string>
  defaultValue: null | OptionType | Array<OptionType>
  loadOptions?: () => Promise<Array<OptionType>>
  options?: Array<OptionType>
  isClearable?: boolean
  isUsingReactQuery?: boolean
}

type SelectAsyncSchema = {
  id?: string
  type: 'select-async-paginate'
  name: string
  label: string
  placeholder?: string
  isMulti?: boolean
  disabled?: Disabled
  hidden?: Disabled
  required?: boolean | string
  loadOptions: any
  onChange?: (v: unknown) => unknown
  className?: string
  options?: Array<OptionType>
  isSearchable?: boolean
  multiSelectOptionStyle?: 'normal' | 'checkbox'
  multiSelectCounterStyle?: 'normal' | 'counter' | 'card'
  showIndicator?: boolean
  additional:
    | Record<string, any>
    | ((params: {
        getValue: GetValue
        getReactSelectValue: GetReactSelectValue
      }) => boolean)
  clearOnChangeFields?: Array<string>
  defaultValue: null | OptionType | Array<OptionType>
}

type RadioSchema = {
  type: 'radio'
  name: string
  label: string
  disabled?: Disabled
  hidden?: Disabled
  required?: boolean
  options: Array<{ label: string; value: string; id?: string }>
  className?: string
  defaultValue: null | string
  callBack?: (params: {
    setValue: UseFormSetValue<any>
    value?: number | string
  }) => void
  clearOnChangeFields?: Array<string>
}

type DateRangePickerSchema = {
  id?: string
  type: 'date-range-picker'
  multicalendar?: boolean
  withPreset?: boolean
  name: string
  label: string
  clearable?: boolean
  disabled?: Disabled
  required?: boolean
  hidden?: Disabled
  minValue?: string
  maxValue?: string
  maxRange?: MaxRangeDate
  className?: string
  defaultValue: null | { start: string; end: string }
}

type DatePickerSchema = {
  id?: string
  type: 'date-picker'
  name: string
  label: string
  clearable?: boolean
  disabled?: Disabled
  required?: boolean
  minValue?: MaxMinDate
  maxValue?: MaxMinDate
  hidden?: Disabled
  className?: string
  defaultValue: null | string
}

type SwitchSchema = {
  id?: string
  type: 'switch'
  name: string
  label: string
  disabled?: Disabled
  required?: boolean
  hidden?: Disabled
  className?: string
  yesLabel?: string
  noLabel?: string
  labelInside?: {
    on: string
    off: string
  } | null
  size?: 'sm' | 'md' | 'lg' | 'xl'
  callBack?: (params: {
    setValue: UseFormSetValue<any>
    value?: number
  }) => void
}

type MonthYearPickerSchema = {
  id?: string
  type: 'month-year-picker'
  name: string
  label: string
  disabled?: Disabled
  hidden?: Disabled
  minValue?: string
  maxValue?: string
  placeholder?: string
  required?: boolean
  clearable?: boolean
  className?: string
  renderAs?: 'date-range' | 'label'
  mode?: 'single' | 'range'
  defaultValue: null | { start: string; end: string }
}

type Component = {
  id?: string
  name: string
  type: 'component'
  required?: boolean
  component: React.ReactNode
  hidden?: Disabled
  defaultValue: null
}

export type FilterFormSchema =
  | InputTextSchema
  | InputNumberSchema
  | SelectSchema
  | DateRangePickerSchema
  | DatePickerSchema
  | RadioSchema
  | Component
  | SelectAsyncSchema
  | SwitchSchema
  | MonthYearPickerSchema

export type UseFilter = FilterFormSchema[]

type RenderActiveFilterParams = {
  filteredTime?: {
    label?: string
    value?: string
  }
  activeFilterLabel?: string
  rangeDateLabel?: string
}

type AnyObject = Record<string, any>

// merge object priority property from obj a only when property has truty valus
function mergeObject(a: any, b: any): any {
  const result = { ...b }
  for (const key in a) {
    if (!(key in b) || a[key]) {
      result[key] = a[key]
    }
  }
  return result
}

export const clearField = ({
  setValue,
  name,
}: {
  setValue: UseFormSetValue<any>
  name: string[]
}): void => {
  if (Array.isArray(name)) {
    name.forEach((item) => {
      setValue(item, null)
    })
  }
}

const parseAsJson = createParser({
  parse(value) {
    if (!value) {
      return null
    }
    return JSON.parse(decodeURIComponent(value))
  },
  serialize(value) {
    return encodeURIComponent(JSON.stringify(value))
  },
})

const parseAsDate = createParser({
  parse(value) {
    if (!value) {
      return null
    }

    return parseISOString(value)
  },
  serialize(value) {
    if (!value) {
      return ''
    }
    return toISOString(value)
  },
})

const parseAsDateRange = createParser({
  parse(queryValue) {
    const json = JSON.parse(decodeURIComponent(queryValue))
    if (!json) return null
    return { start: parseISOString(json.start), end: parseISOString(json.end) }
  },
  serialize(value) {
    if (!value.start) {
      return ''
    }

    if (!value.end) {
      return ''
    }
    return encodeURIComponent(
      JSON.stringify({
        start: toISOString(value.start),
        end: toISOString(value.end),
      })
    )
  },
})

type SelectAsyncPaginateFieldProps = {
  field: SelectAsyncSchema
  control: Control<any>
  watch: UseFormWatch<any>
  setValue: UseFormSetValue<any>
  language: string
}

const SelectAsyncPaginateField = ({
  field,
  control,
  watch,
  setValue,
  language,
}: SelectAsyncPaginateFieldProps) => {
  const [inputValue, setInputValue] = useState('')

  return (
    <FormControl key={field.name} className={field.className}>
      <FormLabel required={Boolean(field?.required)} htmlFor={field?.id}>
        {field.label}
      </FormLabel>
      <Controller
        name={field.name}
        control={control}
        rules={{
          required: field?.required,
        }}
        render={({
          field: { onChange, value, ref },
          fieldState: { error },
        }) => (
          <>
            <ReactSelectAsyncHash
              id={field.id}
              key={language}
              data-testid={field.id}
              isClearable
              options={field?.options}
              isMulti={field.isMulti}
              multiSelectCounterStyle={field.multiSelectCounterStyle}
              multiSelectOptionStyle={field.multiSelectOptionStyle}
              showIndicator={field.showIndicator}
              placeholder={field.placeholder}
              isSearchable={field.isSearchable}
              selectRef={ref}
              inputValue={inputValue}
              onInputChange={(value, meta) => {
                if (meta.action === 'input-change') {
                  setInputValue(value)
                }
                return value
              }}
              onMenuClose={() => setInputValue('')}
              disabled={
                typeof field.disabled === 'function'
                  ? field.disabled({
                      getValue: watch,
                      getReactSelectValue: (name: string) =>
                        getReactSelectValue(watch(name)),
                    })
                  : field.disabled
              }
              onChange={(v: unknown) => {
                if (field?.onChange) {
                  onChange(field?.onChange(v))
                } else {
                  onChange(v)
                }
                clearField({
                  setValue,
                  name: field.clearOnChangeFields ?? [],
                })
              }}
              value={value}
              loadOptions={field.loadOptions}
              additional={
                typeof field.additional === 'function'
                  ? field.additional({
                      getValue: watch,
                      getReactSelectValue: (name: string) =>
                        getReactSelectValue(watch(name)),
                    })
                  : field.additional
              }
              // {...(field.refetchWhenLanguageChange && { key: language })}
            />
            {error && <FormErrorMessage>{error?.message}</FormErrorMessage>}
          </>
        )}
      />
    </FormControl>
  )
}

export function useFilter(schema: UseFilter) {
  const {
    t,
    i18n: { language },
  } = useTranslation(['common'])
  const router = useRouter()
  const queryClient = useQueryClient()
  const activeFilterContainerRef = useRef<HTMLDivElement>(null)
  const [expandedActiveFilter, setExpandedActiveFilter] = useState(false)
  const [filterKey, setFilterKey] = useState(0)

  const { defaultValues, queryConfig, schemaObj } = schema.reduce(
    (acc, field) => {
      const key = field.name

      if (field.type === 'component') {
        return acc
      }

      // Handle defaultValues
      acc.defaultValues[key] =
        'defaultValue' in field ? field.defaultValue || null : null

      if (field.type === 'date-picker' && field.defaultValue) {
        acc.defaultValues[key] = parseISOString(field.defaultValue)
      }

      if (field.type === 'date-range-picker' && field.defaultValue?.start) {
        acc.defaultValues[key] = {
          start: parseISOString(field.defaultValue?.start),
          end: parseISOString(field.defaultValue?.end),
        }
      }

      // Handle queryConfig
      const queryConfigMap: Record<string, ParserBuilder<any>> = {
        'select': parseAsJson.withDefault(null),
        'select-async-paginate': parseAsJson.withDefault(null),
        'date-picker': parseAsDate,
        'date-range-picker': parseAsDateRange,
        'month-year-picker': parseAsJson.withDefault(null),
      }

      if (queryConfigMap?.[field.type]) {
        acc.queryConfig[key] = queryConfigMap?.[field.type]
      } else {
        acc.queryConfig[key] = parseAsString.withDefault('')
      }

      acc.schemaObj[key] = field

      return acc
    },
    {
      defaultValues: {} as Record<string, any>,
      queryConfig: {} as Record<string, any>,
      schemaObj: {} as Record<string, any>,
    }
  )

  const {
    control,
    handleSubmit,
    reset: resetForm,
    watch,
    register,
    setValue,
    getValues,
    formState,
    trigger,
  } = useForm({
    defaultValues,
  })

  const [query, setQuery] = useQueryStates(queryConfig)

  const applyDisabledDefaults = (
    schemaObject: AnyObject,
    queryObject: AnyObject,
    defaultValue: AnyObject
  ) => {
    return Object.entries(schemaObject).reduce((acc, [key, schema]) => {
      if (schema?.disabled === true) {
        acc[key] = defaultValue[key]
      } else if (typeof schema?.disabled === 'function') {
        const isDisabled = schema.disabled({
          getValue: (name: string) => {
            return queryObject[name] ?? watch(name)
          },
          getReactSelectValue: (name: string) =>
            getReactSelectValue(queryObject[name] ?? watch(name)),
        })
        acc[key] = isDisabled ? defaultValue[key] : queryObject[key]
      } else {
        acc[key] = queryObject[key]
      }

      return acc
    }, {} as AnyObject)
  }

  useEffect(() => {
    //sync current qs to form
    const finalQuery = applyDisabledDefaults(schemaObj, query, defaultValues)

    const values = mergeObject(finalQuery, defaultValues)

    // Validate regency belongs to selected province
    if (
      values.regency?.provinceId &&
      values.province?.value !== values.regency?.provinceId
    ) {
      values.regency = null
    }

    resetForm(values)

    setQuery(values)
  }, [router.isReady])

  const reset = () => {
    resetForm(defaultValues)
    setQuery(defaultValues, {
      scroll: false,
      shallow: true,
    })
    setFilterKey((prev) => prev + 1)
    queryClient.invalidateQueries()
  }

  // Dynamic form submission handler
  const handleFormSubmit = useCallback(
    (data: Record<string, any>) => {
      const updates = Object.entries(data).reduce(
        (acc, [key, value]) => {
          const fieldSchema = schema.find((field) => field.name === key)
          const type = fieldSchema?.type
          if (type === 'select' || type === 'select-async-paginate') {
            acc[key] = !value || value?.length === 0 ? null : value
          } else if (type === 'date-picker') {
            acc[key] = value ? toISOString(value) : null
          } else if (type === 'date-range-picker') {
            acc[key] = value
              ? {
                  //@ts-ignore
                  start: toISOString(value?.start),
                  //@ts-ignore
                  end: toISOString(value?.end),
                }
              : null
          } else if (type === 'month-year-picker') {
            acc[key] = value ?? null
          } else {
            acc[key] = value ?? ''
          }
          return acc
        },
        {} as Record<string, any>
      )

      setQuery(updates, {
        scroll: false,
        shallow: true,
      })
      setFilterKey((prev) => prev + 1)
      queryClient.invalidateQueries()
    },
    [setQuery, schema, queryClient]
  )

  // Render dynamic form fields based on schema
  const renderField = (field: FilterFormSchema) => {
    switch (field.type) {
      case 'text':
        return (
          <FormControl key={field.name} className={field.className}>
            <FormLabel required={field?.required ?? false}>
              {field.label}
            </FormLabel>
            <Controller
              name={field.name}
              control={control}
              render={({ field: { onChange, value, ref } }) => (
                <Input
                  id={field.id}
                  data-testid={field.id}
                  onChange={onChange}
                  disabled={
                    typeof field.disabled === 'function'
                      ? field.disabled({
                          getValue: watch,
                          getReactSelectValue: (name: string) =>
                            getReactSelectValue(watch(name)),
                        })
                      : field.disabled
                  }
                  value={value ?? ''}
                  ref={ref}
                  placeholder={field.placeholder}
                  maxLength={field.maxLength}
                />
              )}
            />
          </FormControl>
        )

      case 'number':
        return (
          <FormControl key={field.name} className={field.className}>
            <FormLabel required={field?.required ?? false}>
              {field.label}
            </FormLabel>
            <Controller
              name={field.name}
              control={control}
              render={({ field: { onChange, value, ref } }) => (
                <InputNumberV2
                  id={field.id}
                  data-testid={field.id}
                  currencyDisplay="symbol"
                  isPlainFormat
                  onChange={onChange}
                  disabled={
                    typeof field.disabled === 'function'
                      ? field.disabled({
                          getValue: watch,
                          getReactSelectValue: (name: string) =>
                            getReactSelectValue(watch(name)),
                        })
                      : field.disabled
                  }
                  value={value ?? ''}
                  ref={ref}
                  placeholder={field.placeholder}
                />
              )}
            />
          </FormControl>
        )

      case 'select':
        return (
          <FormControl key={field.name} className={field.className}>
            <FormLabel required={Boolean(field?.required)} htmlFor={field?.id}>
              {field.label}
            </FormLabel>
            <Controller
              name={field.name}
              control={control}
              rules={{
                required: field?.required,
              }}
              render={({
                field: { onChange, value, ref },
                fieldState: { error },
              }) => (
                <>
                  <ReactSelectWithQuery
                    id={field.id}
                    data-testid={field.id}
                    name={field.name}
                    isClearable={field?.isClearable ?? true}
                    ref={ref}
                    key={language}
                    isMulti={field.isMulti}
                    placeholder={field.placeholder}
                    menuPortalTarget={document.body}
                    disabled={
                      typeof field.disabled === 'function'
                        ? field.disabled({
                            getValue: watch,
                            getReactSelectValue: (name: string) =>
                              getReactSelectValue(watch(name)),
                          })
                        : field.disabled
                    }
                    onChange={(v: unknown) => {
                      onChange(v)
                      clearField({
                        setValue,
                        name: field.clearOnChangeFields ?? [],
                      })
                    }}
                    value={value}
                    loadOptions={field.loadOptions}
                    options={field.options}
                    isUsingReactQuery={field.isUsingReactQuery}
                  />
                  {error && (
                    <FormErrorMessage>{error?.message}</FormErrorMessage>
                  )}
                </>
              )}
            />
          </FormControl>
        )
      case 'select-async-paginate':
        return (
          <SelectAsyncPaginateField
            key={field.name}
            field={field}
            control={control}
            watch={watch}
            setValue={setValue}
            language={language}
          />
        )
      case 'date-range-picker':
        return (
          <FormControl key={field.name} className={field.className}>
            <FormLabel
              required={field?.required ?? false}
              htmlFor={field.id}
              id={field.id + '-label'}
            >
              {field.label}
            </FormLabel>
            <Controller
              name={field.name}
              control={control}
              render={({ field: { onChange, value, ref: _ref } }) => (
                <DateRangePicker
                  id={field.id}
                  data-testid={field.id}
                  aria-labelledby={field.id + '-label'}
                  clearable={field.clearable ?? true}
                  multiCalendar={field.multicalendar}
                  withPreset={field.withPreset}
                  maxRange={
                    typeof field?.maxRange === 'function'
                      ? field?.maxRange({ getValue: watch })
                      : field?.maxRange
                  }
                  minValue={
                    field?.minValue
                      ? parseDate(field?.minValue)
                      : parseDate('2020-01-01')
                  }
                  maxValue={
                    field?.maxValue ? parseDate(field?.maxValue) : undefined
                  }
                  isDisabled={
                    typeof field.disabled === 'function'
                      ? field.disabled({
                          getValue: watch,
                          getReactSelectValue: (name: string) =>
                            getReactSelectValue(watch(name)),
                        })
                      : field.disabled
                  }
                  value={value}
                  onChange={onChange}
                  hideTimeZone
                ></DateRangePicker>
              )}
            />
          </FormControl>
        )
      case 'date-picker':
        return (
          <FormControl key={field.name} className={field.className}>
            <FormLabel required={field?.required ?? false}>
              {field.label}
            </FormLabel>
            <Controller
              name={field.name}
              control={control}
              render={({ field: { onChange, value, ref: _ref } }) => {
                const resolvedMinValue = field?.minValue
                  ? typeof field.minValue === 'function'
                    ? parseDate(field.minValue({ getValue: watch }))
                    : parseDate(field.minValue)
                  : parseDate('2020-01-01')

                const resolvedMaxValue = field?.maxValue
                  ? typeof field.maxValue === 'function'
                    ? parseDate(field.maxValue({ getValue: watch }))
                    : parseDate(field.maxValue)
                  : undefined

                return (
                  <DatePicker
                    id={field.id}
                    data-testid={field.id}
                    clearable={field.clearable ?? true}
                    minValue={resolvedMinValue}
                    maxValue={resolvedMaxValue}
                    isDisabled={
                      typeof field.disabled === 'function'
                        ? field.disabled({
                            getValue: watch,
                            getReactSelectValue: (name: string) =>
                              getReactSelectValue(watch(name)),
                          })
                        : field.disabled
                    }
                    value={value}
                    onChange={onChange}
                    hideTimeZone
                  ></DatePicker>
                )
              }}
            />
          </FormControl>
        )

      case 'radio':
        return (
          <FormControl key={field.name} className={field.className}>
            <FormLabel required={field?.required ?? false}>
              {field.label}
            </FormLabel>
            <div className="ui-w-full ui-flex ui-items-center ui-gap-4 ui-h-10">
              {field.options.map((item) => {
                return (
                  <Radio
                    id={item?.id}
                    data-testid={item?.id}
                    key={item.value}
                    disabled={
                      typeof field.disabled === 'function'
                        ? field.disabled({
                            getValue: watch,
                            getReactSelectValue: (name: string) =>
                              getReactSelectValue(watch(name)),
                          })
                        : field.disabled
                    }
                    {...register(field.name)}
                    label={item.label}
                    value={item.value}
                    onChange={() => {
                      if (typeof field?.callBack === 'function') {
                        field.callBack({
                          setValue,
                          value: item.value,
                        })
                      }
                      clearField({
                        setValue,
                        name: field.clearOnChangeFields ?? [],
                      })
                    }}
                  />
                )
              })}
            </div>
          </FormControl>
        )
      case 'switch':
        return (
          <FormControl key={field.name} className={field.className}>
            <FormLabel required={field?.required ?? false}>
              {field.label}
            </FormLabel>
            <Controller
              name={field.name}
              control={control}
              render={({ field: fieldProps }) => {
                const yesLabel = field.yesLabel ?? t('common:yes')
                const noLabel = field.noLabel ?? t('common:no')
                const isChecked = Boolean(Number(fieldProps?.value)) || false
                return (
                  <Switch
                    id={field.id}
                    data-testid={field.id}
                    checked={isChecked}
                    defaultValue={isChecked ? BOOLEAN.TRUE : BOOLEAN.FALSE}
                    value={isChecked ? BOOLEAN.TRUE : BOOLEAN.FALSE}
                    size={field.size ?? 'md'}
                    labelInside={field.labelInside ?? null}
                    onCheckedChange={() => {
                      if (typeof field?.callBack === 'function') {
                        field.callBack({
                          setValue,
                          value: isChecked ? BOOLEAN.TRUE : BOOLEAN.FALSE,
                        })
                      }
                    }}
                    label={isChecked ? yesLabel : noLabel}
                  />
                )
              }}
            />
          </FormControl>
        )
      case 'month-year-picker': {
        return (
          <FormControl key={field.name} className={field.className}>
            <FormLabel required={field?.required ?? false}>
              {field.label}
            </FormLabel>
            <Controller
              name={field.name}
              control={control}
              render={({ field: { onChange, value, ref: _ref } }) => (
                <MonthYearPicker
                  id={field.id}
                  minValue={field.minValue}
                  maxValue={field.maxValue}
                  placeholder={field.placeholder}
                  value={value}
                  onChange={onChange}
                  isClearable={field.clearable}
                  mode={field.mode}
                  isDisabled={
                    typeof field.disabled === 'function'
                      ? field.disabled({
                          getValue: watch,
                          getReactSelectValue: (name: string) =>
                            getReactSelectValue(watch(name)),
                        })
                      : field.disabled
                  }
                />
              )}
            />
          </FormControl>
        )
      }
      case 'component':
        return field.component
      default:
        return null
    }
  }

  const getDisplayValue = (
    key: string,
    value: any,
    rangeDateLabel?: string
  ): string => {
    const type = schemaObj[key].type
    const renderAs = schemaObj[key].renderAs
    const isMulti = schemaObj[key].isMulti
    const rangeLabel = rangeDateLabel ?? t('up_to_abbr')

    switch (type) {
      case 'text':
      case 'number':
        return String(value)
      case 'select':
      case 'select-async-paginate':
        return isMulti
          ? value
              //@ts-ignore
              ?.map?.((item: unknown) => item?.label ?? '')
              ?.join(', ')
          : value.label
      case 'date-picker':
        return toISOString(value)
      case 'date-range-picker':
        return `${value.start} ${rangeLabel} ${value.end}`
      case 'month-year-picker':
        return renderAs === 'label'
          ? dayjs(value.start).format('MMMM YYYY')
          : `${value.start} ${rangeLabel} ${value.end}`
      case 'radio': {
        const options = schemaObj[key].options
        //@ts-ignore
        const selectedOption = options.find((item) => item.value === value)
        return selectedOption.label
      }
      case 'switch': {
        const yesLabel = schemaObj[key].yesLabel ?? t('common:yes')
        const noLabel = schemaObj[key].noLabel ?? t('common:no')
        const labelInside = schemaObj[key].labelInside ?? null
        const displayValueLabelInside =
          Number(value) === BOOLEAN.TRUE ? labelInside?.on : labelInside?.off
        const displayValueLabelOutside =
          Number(value) === BOOLEAN.TRUE ? yesLabel : noLabel
        return labelInside ? displayValueLabelInside : displayValueLabelOutside
      }
      default:
        return String(value)
    }
  }

  const renderActiveFilter = (params?: RenderActiveFilterParams) => {
    const finalQuery = applyDisabledDefaults(schemaObj, query, defaultValues)
    const queryArray = Object.entries(finalQuery).filter(
      ([key]) => schemaObj[key]
    )
    const hasAppliedFilter = queryArray.some(
      ([_, value]) =>
        value !== null &&
        value !== '' &&
        !(Array.isArray(value) && value.length === 0)
    )
    const currentHeight = activeFilterContainerRef?.current?.clientHeight
    const maxHeight = 72
    const isExpandable = currentHeight && currentHeight >= maxHeight

    if (!hasAppliedFilter) {
      return null
    }

    return (
      <>
        <hr />
        <div id="active-filter" className="ui-leading-tight ui-space-y-2">
          <div className="ui-justify-between ui-flex">
            <div className="ui-text-gray-500 ui-font-semibold ui-text-sm">
              {params?.activeFilterLabel ?? t('common:active_filter')}
            </div>
            <div className="ui-text-gray-500 ui-text-sm">
              {params?.filteredTime?.label ?? t('common:filtered_at')}:{' '}
              {params?.filteredTime?.value ?? dayjs().format('DD/MM/YY HH:mm')}
            </div>
          </div>

          <div
            ref={activeFilterContainerRef}
            id="active-filter-container"
            className="ui-items-end flex"
          >
            <div
              id="active-filter-content"
              className={cx('ui-leading-normal', {
                'ui-line-clamp-3': isExpandable && !expandedActiveFilter,
              })}
            >
              {queryArray.map(([key, value]) => {
                if (!value || (Array.isArray(value) && value.length === 0)) {
                  return null
                }

                const label = schemaObj[key].label
                const displayValue = getDisplayValue(
                  key,
                  value,
                  params?.rangeDateLabel
                )

                return (
                  <Fragment key={key}>
                    <span className="ui-font-semibold ui-mr-1">{label}: </span>
                    <span>{displayValue}</span>
                    <span className="last:ui-hidden ui-mx-2">|</span>
                  </Fragment>
                )
              })}
            </div>
            {isExpandable && !expandedActiveFilter && (
              <button
                id="btn-active-filter-expand-show"
                type="button"
                className="ui-text-primary-500 ui-whitespace-nowrap -ui-top-0.5 ui-relative"
                onClick={() => setExpandedActiveFilter(true)}
              >
                {t('common:expand_active_filter.show')}
              </button>
            )}
          </div>

          {isExpandable && expandedActiveFilter && (
            <div className="ui-justify-end flex">
              <button
                id="btn-active-filter-expand-less"
                type="button"
                className="ui-text-primary-500 ui-whitespace-nowrap"
                onClick={() => setExpandedActiveFilter(false)}
              >
                {t('common:expand_active_filter.less')}
              </button>
            </div>
          )}
        </div>
      </>
    )
  }

  return {
    setValue,
    getValues,
    reset,
    renderField: () =>
      schema.map((item) => {
        const { hidden, ...fieldProps } = item
        if (hidden) return null
        return renderField(fieldProps)
      }),
    renderActiveFilter,
    query,
    watch,
    formState,
    trigger,
    filterKey,
    handleSubmit: handleSubmit(handleFormSubmit),
  }
}
