// hooks/useFormBuilder.tsx
import React, { Fragment } from 'react'
import { yupResolver } from '@hookform/resolvers/yup'
import { parseDate } from '@internationalized/date'
import { Checkbox } from '#components/checkbox'
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
import { TextArea } from '#components/text-area'
import { BOOLEAN } from '#constants/common'
import { getReactSelectValue } from '#utils/react-select'
import { Controller, FieldValues, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import * as Yup from 'yup'

type GetValue = (fieldName: string) => any
type GetReactSelectValue = (
  fieldName: string
) => string | number | null | undefined | any

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
  maxLength?: number
}

type InputTextAreaSchema = {
  id?: string
  type: 'textarea'
  name: string
  label: string
  placeholder?: string
  required?: boolean
  disabled?: Disabled
  hidden?: Disabled
  className?: string
  maxLength?: number
  rows?: number
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
  additional?:
    | Record<string, any>
    | ((params: {
        getValue: GetValue
        getReactSelectValue: GetReactSelectValue
      }) => any)
  clearOnChangeFields?: Array<string>
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
}

type CheckboxSchema = {
  id?: string
  type: 'checkbox'
  name: string
  label: string
  disabled?: Disabled
  hidden?: Disabled
  required?: boolean
  className?: string
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
  callBack?: (params: { setValue: any; value?: number }) => void
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
}

type Component = {
  id?: string
  name: string
  type: 'component'
  required?: boolean
  component: React.ReactNode
  hidden?: Disabled
}

export type FormBuilderSchema =
  | InputTextSchema
  | InputTextAreaSchema
  | InputNumberSchema
  | SelectSchema
  | DateRangePickerSchema
  | DatePickerSchema
  | RadioSchema
  | CheckboxSchema
  | Component
  | SelectAsyncSchema
  | SwitchSchema
  | MonthYearPickerSchema

export type UseFormBuilderSchema = FormBuilderSchema[]

export const clearField = ({
  setValue,
  name,
}: {
  setValue: any
  name: string[]
}): void => {
  if (Array.isArray(name)) {
    name.forEach((item) => {
      setValue(item, null)
    })
  }
}

interface UseFormBuilderProps<T> {
  schema: UseFormBuilderSchema
  validation?: Yup.ObjectSchema<any>
  defaultValues?: T
  mode?: 'onSubmit' | 'onChange' | 'onBlur' | 'onTouched' | 'all'
}

export function useFormBuilder<T extends FieldValues>({
  schema,
  validation,
  defaultValues = {} as T,
  mode = 'onSubmit',
}: UseFormBuilderProps<T>) {
  const {
    t,
    i18n: { language },
  } = useTranslation(['common'])

  const methods = useForm<T>({
    resolver: validation ? yupResolver(validation) : undefined,
    mode,
    defaultValues: defaultValues as any,
  })

  const { control, watch, setValue, register } = methods

  const renderField = (field: FormBuilderSchema) => {
    const isHidden =
      typeof field.hidden === 'function'
        ? field.hidden({
            getValue: watch,
            getReactSelectValue: (name: string) =>
              getReactSelectValue(watch(name as any)),
          })
        : field.hidden

    if (isHidden) return null

    switch (field.type) {
      case 'text':
        return (
          <FormControl key={field.name} className={field.className}>
            <FormLabel required={field?.required ?? false}>
              {field.label}
            </FormLabel>
            <Controller
              name={field.name as any}
              control={control}
              render={({
                field: { onChange, value, ref },
                fieldState: { error },
              }) => (
                <Fragment>
                  <Input
                    id={field.id}
                    data-testid={field.id}
                    onChange={onChange}
                    disabled={
                      typeof field.disabled === 'function'
                        ? field.disabled({
                            getValue: watch,
                            getReactSelectValue: (name: string) =>
                              getReactSelectValue(watch(name as any)),
                          })
                        : field.disabled
                    }
                    value={value ?? ''}
                    ref={ref}
                    placeholder={field.placeholder}
                    maxLength={field.maxLength}
                    error={!!error?.message}
                  />
                  {error?.message && (
                    <FormErrorMessage>{error?.message}</FormErrorMessage>
                  )}
                </Fragment>
              )}
            />
          </FormControl>
        )

      case 'textarea':
        return (
          <FormControl key={field.name} className={field.className}>
            <FormLabel required={field?.required ?? false}>
              {field.label}
            </FormLabel>
            <Controller
              name={field.name as any}
              control={control}
              render={({
                field: { onChange, value, ref },
                fieldState: { error },
              }) => (
                <Fragment>
                  <TextArea
                    id={field.id}
                    data-testid={field.id}
                    onChange={onChange}
                    disabled={
                      typeof field.disabled === 'function'
                        ? field.disabled({
                            getValue: watch,
                            getReactSelectValue: (name: string) =>
                              getReactSelectValue(watch(name as any)),
                          })
                        : field.disabled
                    }
                    value={value ?? ''}
                    ref={ref}
                    placeholder={field.placeholder}
                    maxLength={field.maxLength}
                    rows={field.rows}
                    error={!!error?.message}
                  />
                  {error?.message && (
                    <FormErrorMessage>{error?.message}</FormErrorMessage>
                  )}
                </Fragment>
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
              name={field.name as any}
              control={control}
              render={({
                field: { onChange, value, ref },
                fieldState: { error },
              }) => (
                <Fragment>
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
                              getReactSelectValue(watch(name as any)),
                          })
                        : field.disabled
                    }
                    value={value ?? ''}
                    ref={ref}
                    placeholder={field.placeholder}
                  />
                  {error?.message && (
                    <FormErrorMessage>{error?.message}</FormErrorMessage>
                  )}
                </Fragment>
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
              name={field.name as any}
              control={control}
              rules={{
                required: field?.required,
              }}
              render={({
                field: { onChange, value, ref },
                fieldState: { error },
              }) => (
                <Fragment>
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
                              getReactSelectValue(watch(name as any)),
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
                </Fragment>
              )}
            />
          </FormControl>
        )

      case 'select-async-paginate':
        return (
          <FormControl key={field.name} className={field.className}>
            <FormLabel required={Boolean(field?.required)} htmlFor={field?.id}>
              {field.label}
            </FormLabel>
            <Controller
              name={field.name as any}
              control={control}
              rules={{
                required: field?.required,
              }}
              render={({
                field: { onChange, value, ref },
                fieldState: { error },
              }) => (
                <Fragment>
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
                    disabled={
                      typeof field.disabled === 'function'
                        ? field.disabled({
                            getValue: watch,
                            getReactSelectValue: (name: string) =>
                              getReactSelectValue(watch(name as any)),
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
                              getReactSelectValue(watch(name as any)),
                          })
                        : field.additional
                    }
                  />
                  {error && (
                    <FormErrorMessage>{error?.message}</FormErrorMessage>
                  )}
                </Fragment>
              )}
            />
          </FormControl>
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
              name={field.name as any}
              control={control}
              render={({
                field: { onChange, value },
                fieldState: { error },
              }) => (
                <Fragment>
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
                              getReactSelectValue(watch(name as any)),
                          })
                        : field.disabled
                    }
                    value={value}
                    onChange={onChange}
                    hideTimeZone
                  />
                  {error?.message && (
                    <FormErrorMessage>{error?.message}</FormErrorMessage>
                  )}
                </Fragment>
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
              name={field.name as any}
              control={control}
              render={({
                field: { onChange, value },
                fieldState: { error },
              }) => (
                <Fragment>
                  <DatePicker
                    id={field.id}
                    data-testid={field.id}
                    clearable={field.clearable ?? true}
                    minValue={
                      field?.minValue
                        ? typeof field.minValue === 'function'
                          ? parseDate(field.minValue({ getValue: watch }))
                          : parseDate(field.minValue)
                        : parseDate('2020-01-01')
                    }
                    maxValue={
                      field?.maxValue
                        ? typeof field.maxValue === 'function'
                          ? parseDate(field.maxValue({ getValue: watch }))
                          : parseDate(field.maxValue)
                        : undefined
                    }
                    isDisabled={
                      typeof field.disabled === 'function'
                        ? field.disabled({
                            getValue: watch,
                            getReactSelectValue: (name: string) =>
                              getReactSelectValue(watch(name as any)),
                          })
                        : field.disabled
                    }
                    value={value}
                    onChange={onChange}
                    hideTimeZone
                  />
                  {error?.message && (
                    <FormErrorMessage>{error?.message}</FormErrorMessage>
                  )}
                </Fragment>
              )}
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
                              getReactSelectValue(watch(name as any)),
                          })
                        : field.disabled
                    }
                    {...register(field.name as any)}
                    label={item.label}
                    value={item.value}
                  />
                )
              })}
            </div>
          </FormControl>
        )

      case 'checkbox':
        return (
          <FormControl key={field.name} className={field.className}>
            <Controller
              name={field.name as any}
              control={control}
              render={({ field: fieldProps }) => (
                <Checkbox
                  id={field.id}
                  data-testid={field.id}
                  checked={fieldProps.value || false}
                  onChange={(e) => fieldProps.onChange(e.target.checked)}
                  disabled={
                    typeof field.disabled === 'function'
                      ? field.disabled({
                          getValue: watch,
                          getReactSelectValue: (name: string) =>
                            getReactSelectValue(watch(name as any)),
                        })
                      : field.disabled
                  }
                  label={field.label}
                />
              )}
            />
          </FormControl>
        )

      case 'switch':
        return (
          <FormControl key={field.name} className={field.className}>
            <FormLabel required={field?.required ?? false}>
              {field.label}
            </FormLabel>
            <Controller
              name={field.name as any}
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
                      fieldProps.onChange(!isChecked)
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

      case 'month-year-picker':
        return (
          <FormControl key={field.name} className={field.className}>
            <FormLabel required={field?.required ?? false}>
              {field.label}
            </FormLabel>
            <Controller
              name={field.name as any}
              control={control}
              render={({
                field: { onChange, value },
                fieldState: { error },
              }) => (
                <Fragment>
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
                              getReactSelectValue(watch(name as any)),
                          })
                        : field.disabled
                    }
                  />
                  {error?.message && (
                    <FormErrorMessage>{error?.message}</FormErrorMessage>
                  )}
                </Fragment>
              )}
            />
          </FormControl>
        )

      case 'component':
        return <Fragment key={field.name}>{field.component}</Fragment>

      default:
        return null
    }
  }

  return {
    methods,
    renderField: () => schema.map((field) => renderField(field)),
  }
}
