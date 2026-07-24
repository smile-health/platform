import { TFunction } from 'i18next'
import * as yup from 'yup'

const isInteger = (value: unknown): boolean => {
  if (value === '' || value === null || value === undefined) return true
  const num = Number(value)
  return !isNaN(num) && Number.isInteger(num)
}

export const schemaInput = (t: TFunction<['common', 'testMethod']>) =>
  yup.object().shape({
    name: yup
      .string()
      .required(t('common:validation.required'))
      .max(255, t('common:validation.char.max', { char: 255 })),
    quality_standard: yup
      .string()
      .required(t('common:validation.required'))
      .max(255, t('common:validation.char.max', { char: 255 })),
    deskripsi: yup
      .string()
      .max(255, t('common:validation.char.max', { char: 255 }))
      .defined()
      .default(''),

    // Validation type (optional)
    validation_type: yup.string().notRequired(),

    // Range validation
    min_value: yup.mixed().when('validation_type', {
      is: 'range',
      then: (schema) => schema
        .test(
          'required',
          t('common:validation.required'),
          (value) => value !== '' && value !== null && value !== undefined
        )
        .test(
          'no-decimal',
          t('testMethod:form.allow_decimal.error'),
          function (value) {
            const { allow_decimal } = this.parent
            if (allow_decimal) return true
            return isInteger(value)
          }
        )
        .test(
          'min-less-than-max',
          t('testMethod:form.min_value.errorMax'),
          function (value) {
            const { max_value } = this.parent
            if (value === '' || value === null || value === undefined) return true
            if (max_value === '' || max_value === null || max_value === undefined) return true
            return Number(value) < Number(max_value)
          }
        ),
      otherwise: (schema) => schema.notRequired(),
    }),
    max_value: yup.mixed().when('validation_type', {
      is: 'range',
      then: (schema) => schema
        .test(
          'required',
          t('common:validation.required'),
          (value) => value !== '' && value !== null && value !== undefined
        )
        .test(
          'no-decimal',
          t('testMethod:form.allow_decimal.error'),
          function (value) {
            const { allow_decimal } = this.parent
            if (allow_decimal) return true
            return isInteger(value)
          }
        )
        .test(
          'max-greater-than-min',
          t('testMethod:form.max_value.errorMin'),
          function (value) {
            const { min_value } = this.parent
            if (value === '' || value === null || value === undefined) return true
            if (min_value === '' || min_value === null || min_value === undefined) return true
            return Number(value) > Number(min_value)
          }
        ),
      otherwise: (schema) => schema.notRequired(),
    }),

    // Comparison validation
    operator: yup.string().when('validation_type', {
      is: 'comparison',
      then: (schema) => schema.required(t('common:validation.required')),
      otherwise: (schema) => schema.notRequired(),
    }),
    comparison_value: yup.mixed().when('validation_type', {
      is: 'comparison',
      then: (schema) => schema
        .required(t('common:validation.required'))
        .test(
          'no-decimal',
          t('testMethod:form.allow_decimal.error'),
          function (value) {
            const { allow_decimal } = this.parent
            if (allow_decimal) return true
            return isInteger(value)
          }
        ),
      otherwise: (schema) => schema.notRequired(),
    }),

    allow_decimal: yup.boolean().notRequired(),

    // Options validation
    options: yup.array().when(['result_format_type', 'validation_type'], {
      is: (resultFormatType: string, validationType: string) =>
        resultFormatType === 'text' && validationType === 'options',
      then: (schema) => schema.of(yup.string().required()).min(1, t('common:validation.required')),
      otherwise: (schema) => schema.notRequired(),
    }),
  })
