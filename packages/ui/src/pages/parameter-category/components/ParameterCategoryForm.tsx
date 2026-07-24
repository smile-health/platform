'use client'

import Link from 'next/link'
import { Button } from '#components/button'
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '#components/form-control'
import { Input } from '#components/input'
import { ReactSelect } from '#components/react-select'
import { Switch } from '#components/switch'
import { Checkbox } from '#components/checkbox'
import Plus from '#components/icons/Plus'
import Trash from '#components/icons/Trash'
import useSmileRouter from '#hooks/useSmileRouter'
import { useTranslation } from 'react-i18next'
import { Controller } from 'react-hook-form'
import { useQuery } from '@tanstack/react-query'
import { components } from 'react-select'

import { ParameterCategoryFormProps } from '../parameter-category.type'
import { useParameterCategoryCreateEdit } from '../hooks/useParameterCategoryCreateEdit'
import {
  listAnalysisParameterOptions,
  listTestMethodOptions,
} from '../parameter-category.service'

export default function ParameterCategoryForm({
  isEdit,
  defaultValues,
}: Readonly<ParameterCategoryFormProps>) {
  const { t } = useTranslation(['common', 'parameterCategory'])
  const router = useSmileRouter()
  const {
    register,
    handleSubmit,
    errors,
    onValid,
    fields,
    append,
    remove,
    control,
    setValue,
    watch,
    fieldItems,
    appendField,
    removeField,
    watchedAnalysisParameters,
  } = useParameterCategoryCreateEdit({
    isEdit,
    defaultValues,
  })

  // Fetch analysis parameters for dropdown
  const { data: analysisParameterData } = useQuery<{ data: { id: number; name: string; unit_name: string }[] }>({
    queryKey: ['analysis-parameter-options'],
    queryFn: listAnalysisParameterOptions,
    refetchOnWindowFocus: false,
  })

  // Fetch test methods for dropdown
  const { data: testMethodData } = useQuery<{ data: { id: number; name: string; quality_standard: string }[] }>({
    queryKey: ['test-method-options'],
    queryFn: listTestMethodOptions,
    refetchOnWindowFocus: false,
  })

  const analysisOptions = analysisParameterData?.data?.map((item) => ({
    value: item.id,
    label: item.name,
    unit_name: item.unit_name,
  })) ?? []

  const testMethodOptions = testMethodData?.data?.map((item) => ({
    value: item.id,
    label: item.name,
    quality_standard: item.quality_standard,
  })) ?? []

  const typeDataOptions = [
    { value: 'text', label: 'Textfield' },
    { value: 'number', label: 'Number' },
    { value: 'dropdown', label: 'Dropdown' },
    { value: 'date', label: 'Date' },
  ]

  // Custom Option component for test method with quality standard (checkbox style)
  const CustomTestMethodCheckboxOption = (props: any) => {
    const { isSelected, data } = props
    const value = props?.value
    const id = `option-${value}`
    const innerProps = {
      ...props.innerProps,
      id,
      'data-testid': id,
    }

    return (
      <components.Option {...props} innerProps={innerProps}>
        <Checkbox
          checked={isSelected}
          readOnly
          label={
            <span>
              {data.label}
              {data.quality_standard && (
                <span className="ui-block ui-text-xs ui-text-gray-500">{data.quality_standard}</span>
              )}
            </span>
          }
        />
      </components.Option>
    )
  }

  // Get available analysis parameter options (exclude already selected ones)
  const getAvailableAnalysisOptions = (currentIndex: number) => {
    const selectedIds = watchedAnalysisParameters
      ?.map((param, idx) => {
        // Don't exclude current index and deleted items
        if (idx === currentIndex || param?._delete) return null
        return param?.env_analysis_parameter_id
      })
      .filter((id): id is number => id !== null && id !== undefined)

    return analysisOptions.filter(opt => !selectedIds.includes(opt.value))
  }

  return (
    <form
      onSubmit={handleSubmit(onValid)}
      className="ui-mt-6 ui-space-y-6 ui-max-w-form ui-mx-auto"
    >
      <div className="ui-p-4 ui-pb-4 ui-mt-6 ui-border ui-border-gray-300 ui-rounded ui-bg-white">
        <div className="ui-mb-5 ui-font-bold ui-text-primary ui-text-dark-blue">
          {t('parameterCategory:title.information')}
        </div>
        <div className="ui-flex ui-flex-col ui-space-y-5">
          <FormControl>
            <FormLabel htmlFor="name" required>
              {t('parameterCategory:form.name.label')}
            </FormLabel>
            <Input
              {...register('name')}
              id="input-parameter-category-name"
              placeholder={t('parameterCategory:form.name.placeholder')}
              type="text"
              error={!!errors?.name?.message}
            />
            <FormErrorMessage>{errors?.name?.message}</FormErrorMessage>
          </FormControl>
        </div>

        <hr className="ui-my-6" />

        <div className="ui-flex ui-justify-between ui-items-center ui-mb-4">
          <div className="ui-font-bold ui-text-primary ui-text-dark-blue">
            {t('parameterCategory:table.analysis_parameters')}
          </div>
        </div>

        <div className="ui-space-y-4">
          {fields.map((field, index) => (
            <AnalysisParameterItem
              key={field.id}
              index={index}
              field={field}
              control={control}
              errors={errors}
              analysisOptions={analysisOptions}
              testMethodOptions={testMethodOptions}
              t={t}
              setValue={setValue}
              remove={remove}
              watchedAnalysisParameters={watchedAnalysisParameters}
              getAvailableAnalysisOptions={getAvailableAnalysisOptions}
              CustomTestMethodCheckboxOption={CustomTestMethodCheckboxOption}
            />
          ))}
          {errors.analysis_parameters?.root?.message && (
            <p className="ui-text-danger-500 ui-text-sm">{errors.analysis_parameters.root.message}</p>
          )}
          {errors.analysis_parameters?.message && (
            <p className="ui-text-danger-500 ui-text-sm">{errors.analysis_parameters.message}</p>
          )}

          <Button
            type="button"
            variant="outline"
            className="ui-w-full ui-border-dashed ui-py-6 ui-mt-2"
            leftIcon={<Plus className="ui-size-4" />}
            onClick={() => append({ env_analysis_parameter_id: undefined as any, env_test_method_ids: [], id: undefined })}
          >
            {t('common:add')}
          </Button>
        </div>
      </div>

      {/* Fields Section */}
      <div className="ui-p-4 ui-pb-4 ui-border ui-border-gray-300 ui-rounded ui-bg-white">
        <div className="ui-flex ui-justify-between ui-items-center ui-mb-4">
          <div className="ui-font-bold ui-text-primary ui-text-dark-blue">
            {t('parameterCategory:form.fields.title')}
          </div>
        </div>

        <div className="ui-space-y-4">
          {fieldItems.map((field, index) => (
            <FieldItem
              key={field.id}
              index={index}
              field={field}
              control={control}
              register={register}
              errors={errors}
              typeDataOptions={typeDataOptions}
              t={t}
              removeField={removeField}
              watch={watch}
              setValue={setValue}
            />
          ))}

          <Button
            type="button"
            variant="outline"
            className="ui-w-full ui-border-dashed ui-py-6 ui-mt-2"
            leftIcon={<Plus className="ui-size-4" />}
            onClick={() => appendField({ key: '', type_data: '', label: '', hint: '', mandatory: 0 })}
          >
            {t('common:add')}
          </Button>
        </div>
      </div>

      <div className="ui-flex ui-justify-end ui-mt-8">
        <div className="ui-grid ui-grid-cols-2 ui-w-[300px] ui-gap-2">
          <Button asChild variant="outline">
            <Link href={router.getAsLink('/v5/parameter-category')}>
              {t('common:back')}
            </Link>
          </Button>
          <Button type="submit">{t('common:save')}</Button>
        </div>
      </div>
    </form>
  )
}

function AnalysisParameterItem({
  index,
  field,
  control,
  errors,
  analysisOptions,
  testMethodOptions,
  t,
  setValue,
  remove,
  watchedAnalysisParameters,
  getAvailableAnalysisOptions,
  CustomTestMethodCheckboxOption,
}: any) {
  // Hide items marked for deletion
  if ((watchedAnalysisParameters?.[index] as any)?._delete) return null

  return (
    <div
      key={field.id}
      className="ui-p-4 ui-border ui-border-gray-200 ui-rounded-md ui-relative ui-bg-gray-50/50"
    >
      <div className="ui-mt-2 ui-space-y-4">
        <FormControl>
          <div className="ui-flex ui-justify-between ui-items-center ui-mb-0 ui-h-4">
            <FormLabel required className="ui-mb-0">
              {t('parameterCategory:form.analysis_parameter.label')}
            </FormLabel>
            {watchedAnalysisParameters?.filter((f: any) => !f?._delete).length >
              1 && (
                <Button
                  type="button"
                  variant="subtle"
                  size="sm"
                  onClick={() => {
                    if (watchedAnalysisParameters?.[index]?.id) {
                      setValue(`analysis_parameters.${index}._delete`, true)
                    } else {
                      remove(index)
                    }
                  }}
                  className="ui-text-danger-500 ui-p-2 ui-mb-2"
                  title={t('common:delete')}
                >
                  <Trash className="ui-size-5 ui-pointer-events-none" />
                </Button>
              )}
          </div>
          <Controller
            control={control}
            name={`analysis_parameters.${index}.env_analysis_parameter_id`}
            render={({ field: { value, onChange, onBlur } }) => {
              const availableOptions = getAvailableAnalysisOptions(index)
              return (
                <ReactSelect
                  id={`select-analysis-parameter-${index}`}
                  options={availableOptions}
                  value={analysisOptions.find((opt: any) => opt.value === value)}
                  onChange={(opt: any) => onChange(opt ? opt.value : undefined)}
                  onBlur={onBlur}
                  placeholder={t(
                    'parameterCategory:form.analysis_parameter.placeholder'
                  )}
                  error={
                    !!(errors?.analysis_parameters?.[index] as any)
                      ?.env_analysis_parameter_id?.message
                  }
                  noOptionsMessage={() =>
                    t('parameterCategory:form.analysis_parameter.no_options')
                  }
                />
              )
            }}
          />
          <FormErrorMessage>
            {
              (errors?.analysis_parameters?.[index] as any)
                ?.env_analysis_parameter_id?.message
            }
          </FormErrorMessage>
        </FormControl>

        <FormControl>
          <FormLabel required>
            {t('parameterCategory:form.test_method.label')}
          </FormLabel>
          <Controller
            control={control}
            name={`analysis_parameters.${index}.env_test_method_ids`}
            render={({ field: { value, onChange, onBlur } }) => (
              <ReactSelect
                id={`select-test-method-${index}`}
                isMulti
                multiSelectOptionStyle="normal"
                hideSelectedOptions={false}
                closeMenuOnSelect={false}
                options={testMethodOptions}
                value={testMethodOptions.filter((opt: any) =>
                  value?.includes(opt.value)
                )}
                onChange={(opts: any) =>
                  onChange(opts ? opts.map((o: any) => o.value) : [])
                }
                onBlur={onBlur}
                placeholder={t(
                  'parameterCategory:form.test_method.placeholder'
                )}
                error={
                  !!(errors?.analysis_parameters?.[index] as any)
                    ?.env_test_method_ids?.message
                }
                components={{
                  Option: CustomTestMethodCheckboxOption,
                }}
                classNames={{
                  option: () => '!ui-bg-white hover:!ui-bg-gray-100',
                }}
              />
            )}
          />
          <FormErrorMessage>
            {
              (errors?.analysis_parameters?.[index] as any)?.env_test_method_ids
                ?.message
            }
          </FormErrorMessage>
        </FormControl>
      </div>
    </div>
  )
}

function FieldItem({ index, field, control, register, errors, typeDataOptions, t, removeField, watch, setValue }: any) {
  return (
    <div className="ui-p-4 ui-border ui-border-gray-200 ui-rounded-md ui-relative ui-bg-gray-50/50">
      <div className="ui-absolute ui-top-2 ui-right-2">
        <Button
          type="button"
          variant="subtle"
          size="sm"
          onClick={() => removeField(index)}
          className="ui-text-danger-500 hover:ui-bg-danger-50"
        >
          <Trash className="ui-size-4" />
        </Button>
      </div>

      <div className="ui-mt-2 ui-space-y-4">
        <div className="ui-grid ui-grid-cols-2 ui-gap-4">
          <FormControl>
            <FormLabel required>{t('parameterCategory:form.fields.label.label')}</FormLabel>
            <Input
              {...register(`fields.${index}.label`, {
                onChange: (e: any) => {
                  const keyValue = e.target.value
                    .toLowerCase()
                    .replace(/\s/g, '_')
                    .replace(/[^a-z_]/g, '')
                  setValue(`fields.${index}.key`, keyValue)
                },
              })}
              id={`input-field-label-${index}`}
              placeholder={t('parameterCategory:form.fields.label.placeholder')}
              type="text"
              maxLength={100}
              error={!!errors?.fields?.[index]?.label?.message}
            />
            <FormErrorMessage>
              {errors?.fields?.[index]?.label?.message}
            </FormErrorMessage>
          </FormControl>

          <FormControl>
            <FormLabel>{t('parameterCategory:form.fields.hint.label')}</FormLabel>
            <Input
              {...register(`fields.${index}.hint`)}
              id={`input-field-hint-${index}`}
              placeholder={t('parameterCategory:form.fields.hint.placeholder')}
              type="text"
              maxLength={100}
              error={!!errors?.fields?.[index]?.hint?.message}
            />
            <FormErrorMessage>
              {errors?.fields?.[index]?.hint?.message}
            </FormErrorMessage>
          </FormControl>
        </div>

        <FormControl>
          <FormLabel required>{t('parameterCategory:form.fields.type_data.label')}</FormLabel>
          <Controller
            control={control}
            name={`fields.${index}.type_data`}
            render={({ field: { value, onChange, onBlur } }) => (
              <ReactSelect
                id={`select-field-type-data-${index}`}
                options={typeDataOptions}
                value={typeDataOptions.find((opt: any) => opt.value === value)}
                onChange={(opt: any) => onChange(opt ? opt.value : '')}
                onBlur={onBlur}
                placeholder={t('parameterCategory:form.fields.type_data.placeholder')}
                error={!!errors?.fields?.[index]?.type_data?.message}
              />
            )}
          />
          <FormErrorMessage>
            {errors?.fields?.[index]?.type_data?.message}
          </FormErrorMessage>
        </FormControl>

        {watch(`fields.${index}.type_data`) === 'dropdown' && (
          <div className="ui-mt-4 ui-p-4 ui-bg-white ui-rounded-md ui-border">
            <FormLabel>{t('parameterCategory:form.fields.options.label')}</FormLabel>
            <div className="ui-mt-2 ui-space-y-2">
              <Controller
                control={control}
                name={`fields.${index}.options`}
                render={({ field: { value, onChange } }) => (
                  <DropdownOptions
                    value={value}
                    onChange={onChange}
                    t={t}
                    fieldId={field.id}
                  />
                )}
              />
            </div>
          </div>
        )}

        <FormControl>
          <div className="ui-flex ui-items-center ui-gap-3">
            <Controller
              control={control}
              name={`fields.${index}.mandatory`}
              render={({ field: { value, onChange } }) => (
                <Switch
                  checked={value === 1}
                  onCheckedChange={(checked) => onChange(checked ? 1 : 0)}
                  size="sm"
                />
              )}
            />
            <FormLabel>{t('parameterCategory:form.fields.mandatory.label')}</FormLabel>
          </div>
        </FormControl>
      </div>
    </div>
  )
}

function DropdownOptions({ value, onChange, t, fieldId }: any) {
  const options = typeof value === 'string'
    ? value.split(',').filter((opt, i, self) => opt !== '' || i === self.length - 1)
    : ['']

  // Ensure at least one empty string if empty
  const displayOptions = options.length === 0 ? [''] : options

  return (
    <div className="ui-space-y-2">
      {displayOptions.map((opt, optIndex) => (
        <div key={`${fieldId}-opt-${optIndex}`} className="ui-flex ui-gap-2">
          <Input
            value={opt}
            onChange={(e: any) => {
              const newOpts = [...displayOptions]
              newOpts[optIndex] = e.target.value
              onChange(newOpts.join(','))
            }}
            placeholder={`Opsi ${optIndex + 1}`}
          />
          <Button
            type="button"
            variant="subtle"
            size="sm"
            onClick={() => {
              const newOpts = displayOptions.filter((_, i) => i !== optIndex)
              onChange(newOpts.join(','))
            }}
            className="ui-text-danger-500"
          >
            <Trash className="ui-size-4" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => {
          if (typeof value !== 'string') {
            onChange('')
          } else {
            onChange(value === '' ? ',' : `${value},`)
          }
        }}
      >
        <Plus className="ui-size-3 ui-mr-2" />
        {t('common:add')}
      </Button>
    </div>
  )
}
