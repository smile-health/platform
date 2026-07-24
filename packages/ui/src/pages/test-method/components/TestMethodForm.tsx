'use client'

import Link from 'next/link'
import { Button } from '#components/button'
import { Checkbox } from '#components/checkbox'
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '#components/form-control'
import Plus from '#components/icons/Plus'
import XMark from '#components/icons/XMark'
import { Input } from '#components/input'
import { ReactSelect } from '#components/react-select'
import { TextArea } from '#components/text-area'
import useSmileRouter from '#hooks/useSmileRouter'
import { useTranslation } from 'react-i18next'
import { useEffect } from 'react'
import { Controller, useFieldArray } from 'react-hook-form'

import { TestMethodFormProps } from '../test-method.type'
import { useTestMethodCreateEdit } from '../hooks/useTestMethodCreateEdit'

const resultFormatTypeOptions = [
  { value: '', label: 'Pilih format hasil' },
  { value: 'number', label: 'Number' },
  { value: 'text', label: 'Text' },
]

const validationTypeOptionsNumber = [
  { value: '', label: 'Tidak ada validasi' },
  { value: 'range', label: 'Range' },
  { value: 'comparison', label: 'Perbandingan' },
]

const validationTypeOptionsText = [
  { value: '', label: 'Tidak ada validasi' },
  { value: 'options', label: 'Options' },
]

const operatorOptions = [
  { value: '<', label: '<' },
  { value: '>', label: '>' },
  { value: '≤', label: '≤' },
  { value: '≥', label: '≥' },
  { value: '=', label: '=' },
  { value: '≠', label: '≠' },
]

export default function TestMethodForm({
  isEdit,
  defaultValues,
  isDetail,
}: Readonly<TestMethodFormProps>) {
  const { t } = useTranslation(['common', 'testMethod'])
  const router = useSmileRouter()
  const { register, handleSubmit, errors, onValid, control, watch, setValue } =
    useTestMethodCreateEdit({
      isEdit,
      defaultValues,
    })

  // Watch result_format_type and validation_type for conditional rendering
  const resultFormatType = watch('result_format_type')
  const validationType = watch('validation_type')
  const allowDecimal = watch('allow_decimal')

  // Get validation type options based on result_format_type
  const getValidationOptions = () => {
    const optionsMap: Record<string, any[]> = {
      number: validationTypeOptionsNumber,
      text: validationTypeOptionsText,
    }
    return optionsMap[resultFormatType || ''] ?? []
  }

  const validationTypeOptions = getValidationOptions()

  // Field array for options
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'options',
  })

  // Prevent scroll from changing number input values
  const handleWheel = (e: React.WheelEvent<HTMLInputElement>) => {
    ; (e.target as HTMLInputElement).blur()
  }

  // Block decimal characters when allow_decimal is unchecked
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!allowDecimal && (e.key === '.' || e.key === ',')) {
      e.preventDefault()
    }
  }

  // Strip decimal values on paste when allow_decimal is unchecked
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    if (!allowDecimal) {
      const pastedText = e.clipboardData.getData('text')
      if (pastedText.includes('.') || pastedText.includes(',')) {
        e.preventDefault()
      }
    }
  }

  // Strip existing decimal part from min_value & max_value when allow_decimal becomes false
  useEffect(() => {
    if (!allowDecimal) {
      const minVal = watch('min_value')
      const maxVal = watch('max_value')
      if (minVal !== '' && minVal !== undefined && minVal !== null) {
        const truncated = String(Math.trunc(Number(minVal)))
        if (String(minVal) !== truncated) setValue('min_value', truncated)
      }
      if (maxVal !== '' && maxVal !== undefined && maxVal !== null) {
        const truncated = String(Math.trunc(Number(maxVal)))
        if (String(maxVal) !== truncated) setValue('max_value', truncated)
      }
    }
  }, [allowDecimal])

  return (
    <form
      onSubmit={handleSubmit(onValid)}
      className="ui-mt-6 ui-space-y-6 ui-max-w-form ui-mx-auto"
    >
      <div className="ui-p-4 ui-pb-4 ui-border ui-border-gray-300 ui-rounded ui-bg-white">
        <div className="ui-mb-5 ui-font-bold ui-text-primary ui-text-dark-blue">
          {t('testMethod:title.information')}
        </div>
        <div className="ui-flex ui-flex-col ui-space-y-5">
          <FormControl>
            <FormLabel htmlFor="name" required>
              {t('testMethod:form.name.label')}
            </FormLabel>
            <Input
              {...register('name')}
              id="input-test-method-name"
              placeholder={t('testMethod:form.name.placeholder')}
              type="text"
              disabled={isDetail}
              error={!!errors?.name?.message}
            />
            <FormErrorMessage>{errors?.name?.message}</FormErrorMessage>
          </FormControl>
          <FormControl>
            <FormLabel htmlFor="quality_standard" required>
              {t('testMethod:form.quality_standard.label')}
            </FormLabel>
            <Input
              {...register('quality_standard')}
              id="input-test-method-quality-standard"
              placeholder={t('testMethod:form.quality_standard.placeholder')}
              type="text"
              disabled={isDetail}
              error={!!errors?.quality_standard?.message}
            />
            <FormErrorMessage>{errors?.quality_standard?.message}</FormErrorMessage>
          </FormControl>
          <FormControl>
            <FormLabel htmlFor="deskripsi">
              {t('testMethod:form.deskripsi.label')}
            </FormLabel>
            <TextArea
              {...register('deskripsi')}
              id="input-test-method-deskripsi"
              placeholder={t('testMethod:form.deskripsi.placeholder')}
              disabled={isDetail}
              error={!!errors?.deskripsi?.message}
              rows={3}
              className="ui-resize-none"
            />
            <FormErrorMessage>{errors?.deskripsi?.message}</FormErrorMessage>
          </FormControl>
          <Controller
            control={control}
            name="result_format_type"
            render={({ field: { value, onChange, ...field } }) => (
              <FormControl>
                <FormLabel htmlFor="select-result-format-type">
                  {t('testMethod:form.result_format_type.label')}
                </FormLabel>
                <ReactSelect
                  {...field}
                  id="select-result-format-type"
                  options={resultFormatTypeOptions}
                  placeholder={t('testMethod:form.result_format_type.placeholder')}
                  value={resultFormatTypeOptions.find((opt) => opt.value === value) || null}
                  onChange={(option: { value: string; label: string } | null) =>
                    onChange(option?.value ?? '')
                  }
                  isDisabled={isDetail}
                  error={!!errors?.result_format_type?.message}
                />
                <FormErrorMessage>{errors?.result_format_type?.message}</FormErrorMessage>
              </FormControl>
            )}
          />
          {resultFormatType === 'number' && (
            <div>
              <Checkbox
                {...register('allow_decimal')}
                label={t('testMethod:form.allow_decimal.label')}
                disabled={isDetail}
              />
            </div>
          )}
        </div>
      </div>

      {/* Validation Section - Only show if result_format_type is selected */}
      {resultFormatType && (
        <ValidationSection
          resultFormatType={resultFormatType}
          validationType={validationType}
          validationTypeOptions={validationTypeOptions}
          allowDecimal={allowDecimal}
          control={control}
          register={register}
          errors={errors}
          handleWheel={handleWheel}
          handleKeyDown={handleKeyDown}
          handlePaste={handlePaste}
          isDetail={isDetail}
          fields={fields}
          remove={remove}
          append={append}
          t={t}
        />
      )}

      <div className="ui-flex ui-justify-end">
        <div className="ui-grid ui-grid-cols-2 ui-w-[300px] ui-gap-2">
          <Button asChild variant="outline">
            <Link href={router.getAsLink('/v5/test-method')}>
              {t('common:back')}
            </Link>
          </Button>
          {!isDetail && <Button type="submit">{t('common:save')}</Button>}
        </div>
      </div>
    </form>
  )
}

function ValidationSection({
  resultFormatType,
  validationType,
  validationTypeOptions,
  allowDecimal,
  control,
  register,
  errors,
  handleWheel,
  handleKeyDown,
  handlePaste,
  isDetail,
  fields,
  remove,
  append,
  t,
}: any) {
  return (
    <div className="ui-p-4 ui-border ui-border-gray-300 ui-rounded ui-bg-white">
      <div className="ui-mb-5 ui-font-bold ui-text-primary ui-text-dark-blue">
        {t('testMethod:title.validation')}
      </div>
      <div className="ui-flex ui-flex-col ui-space-y-5">
        {/* Validation Type - Only show for Number format */}
        {resultFormatType === 'number' && (
          <Controller
            control={control}
            name="validation_type"
            render={({ field: { value, onChange, ...field } }) => (
              <FormControl>
                <FormLabel htmlFor="select-validation-type">
                  {t('testMethod:form.validation_type.label')}
                </FormLabel>
                <ReactSelect
                  {...field}
                  id="select-validation-type"
                  options={validationTypeOptions}
                  placeholder={t('testMethod:form.validation_type.placeholder')}
                  value={
                    validationTypeOptions.find((opt: any) => opt.value === value) ||
                    validationTypeOptions[0]
                  }
                  onChange={(option: { value: string; label: string } | null) =>
                    onChange(option?.value ?? '')
                  }
                  isDisabled={isDetail}
                  error={!!errors?.validation_type?.message}
                />
                <FormErrorMessage>
                  {errors?.validation_type?.message}
                </FormErrorMessage>
              </FormControl>
            )}
          />
        )}

        {/* Range Fields */}
        {validationType === 'range' && resultFormatType === 'number' && (
          <div className="ui-grid ui-grid-cols-2 ui-gap-4">
            <FormControl>
              <FormLabel htmlFor="input-min-value" required>
                {t('testMethod:form.min_value.label')}
              </FormLabel>
              <Input
                {...register('min_value')}
                id="input-min-value"
                type="number"
                step={allowDecimal ? 'any' : '1'}
                onWheel={handleWheel}
                onKeyDown={handleKeyDown}
                onPaste={handlePaste}
                placeholder={t('testMethod:form.min_value.placeholder')}
                disabled={isDetail}
                error={!!errors?.min_value?.message}
              />
              <FormErrorMessage>{errors?.min_value?.message}</FormErrorMessage>
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="input-max-value" required>
                {t('testMethod:form.max_value.label')}
              </FormLabel>
              <Input
                {...register('max_value')}
                id="input-max-value"
                type="number"
                step={allowDecimal ? 'any' : '1'}
                onWheel={handleWheel}
                onKeyDown={handleKeyDown}
                onPaste={handlePaste}
                placeholder={t('testMethod:form.max_value.placeholder')}
                disabled={isDetail}
                error={!!errors?.max_value?.message}
              />
              <FormErrorMessage>{errors?.max_value?.message}</FormErrorMessage>
            </FormControl>
          </div>
        )}

        {/* Comparison Fields */}
        {validationType === 'comparison' && resultFormatType === 'number' && (
          <div className="ui-grid ui-grid-cols-2 ui-gap-4">
            <Controller
              control={control}
              name="operator"
              render={({ field: { value, onChange, ...field } }) => (
                <FormControl>
                  <FormLabel htmlFor="select-operator">
                    {t('testMethod:form.operator.label')}
                  </FormLabel>
                  <ReactSelect
                    {...field}
                    id="select-operator"
                    options={operatorOptions}
                    placeholder={t('testMethod:form.operator.placeholder')}
                    value={
                      operatorOptions.find((opt) => opt.value === value) || null
                    }
                    onChange={(option: { value: string; label: string } | null) =>
                      onChange(option?.value ?? '')
                    }
                    isDisabled={isDetail}
                    error={!!errors?.operator?.message}
                  />
                  <FormErrorMessage>
                    {errors?.operator?.message}
                  </FormErrorMessage>
                </FormControl>
              )}
            />
            <FormControl>
              <FormLabel htmlFor="input-comparison-value">
                {t('testMethod:form.comparison_value.label')}
              </FormLabel>
              <Input
                {...register('comparison_value')}
                id="input-comparison-value"
                type="number"
                step={allowDecimal ? 'any' : '1'}
                onWheel={handleWheel}
                onKeyDown={handleKeyDown}
                onPaste={handlePaste}
                placeholder={t('testMethod:form.comparison_value.placeholder')}
                disabled={isDetail}
                error={!!errors?.comparison_value?.message}
              />
              <FormErrorMessage>
                {errors?.comparison_value?.message}
              </FormErrorMessage>
            </FormControl>
          </div>
        )}

        {/* Options Fields - Show for Text format and Options validation type */}
        {resultFormatType === 'text' && (
          <div className="ui-flex ui-flex-col ui-space-y-5">
            <Controller
              control={control}
              name="validation_type"
              render={({ field: { value, onChange, ...field } }) => (
                <FormControl>
                  <FormLabel htmlFor="select-validation-type-text">
                    {t('testMethod:form.validation_type.label')}
                  </FormLabel>
                  <ReactSelect
                    {...field}
                    id="select-validation-type-text"
                    options={[
                      {
                        value: 'none',
                        label:
                          t('testMethod:form.validation_type.none') ??
                          'Free Text',
                      },
                      {
                        value: 'options',
                        label:
                          t('testMethod:form.validation_type.options') ??
                          'Opsi',
                      },
                    ]}
                    placeholder={t(
                      'testMethod:form.validation_type.placeholder'
                    )}
                    value={
                      value === 'options'
                        ? {
                          value: 'options',
                          label:
                            t('testMethod:form.validation_type.options') ??
                            'Opsi',
                        }
                        : {
                          value: 'none',
                          label:
                            t('testMethod:form.validation_type.none') ??
                            'Free Text',
                        }
                    }
                    onChange={(option: { value: string; label: string } | null) =>
                      onChange(option?.value ?? 'none')
                    }
                    isDisabled={isDetail}
                    error={!!errors?.validation_type?.message}
                  />
                  <FormErrorMessage>
                    {errors?.validation_type?.message}
                  </FormErrorMessage>
                </FormControl>
              )}
            />

            {validationType === 'options' && (
              <div className="ui-flex ui-flex-col ui-space-y-4">
                <FormLabel>{t('testMethod:form.options.label')}</FormLabel>

                {fields.map((field: any, index: number) => (
                  <div
                    key={field.id}
                    className="ui-flex ui-items-center ui-gap-2"
                  >
                    <div className="ui-flex-1">
                      <Input
                        {...register(`options.${index}` as const)}
                        placeholder={t('testMethod:form.options.placeholder')}
                        disabled={isDetail}
                        error={!!errors?.options?.[index]?.message}
                      />
                      {errors?.options?.[index]?.message && (
                        <FormErrorMessage>
                          {errors?.options?.[index]?.message}
                        </FormErrorMessage>
                      )}
                    </div>
                    {fields.length > 1 && !isDetail && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => remove(index)}
                        className="ui-px-2 ui-h-10"
                      >
                        <XMark className="ui-w-4 ui-h-4" />
                      </Button>
                    )}
                  </div>
                ))}

                {!isDetail && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append('')}
                    className="ui-w-fit"
                  >
                    <Plus className="ui-w-4 ui-h-4 ui-mr-2" />
                    {t('testMethod:form.options.add')}
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
