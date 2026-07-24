import { STATUS } from '#constants/common'
import { TFunction } from 'i18next'
import * as yup from 'yup'

import { IDENTITY_TYPE_VALUE } from '../transaction-consumption.constant'
import { validateOrderedDates } from '../utils/helpers'

export const formSchemaVaccineRabies = (
  schema: yup.ObjectSchema<{}, yup.AnyObject, {}, "">,
  t: TFunction<['common', 'transactionCreateConsumption']>,
) => schema.shape({
  is_need_sequence: yup.number().nullable(),
  is_vaccine: yup.number().nullable(),
  identity_type: yup
    .object({
      value: yup.number(),
      label: yup.string().nullable(),
    })
    .required(t('common:validation.required')),
  vaccine_type: yup
    .object({
      value: yup.number(),
      label: yup.string().nullable(),
    })
    .when(['is_vaccine', 'is_need_sequence'], {
      is: (
        is_vaccine: number,
        is_need_sequence: number,
      ) => Number(is_vaccine) === STATUS.ACTIVE && Number(is_need_sequence) === STATUS.ACTIVE,
      then: (schema) =>
        schema.required(t('common:validation.required')),
      otherwise: (schema) => schema.notRequired(),
    }),
  vaccine_method: yup
    .object({
      value: yup.number(),
      label: yup.string().nullable(),
    })
    .when(['is_vaccine', 'is_need_sequence', 'vaccine_type'], {
      is: (
        is_vaccine: number,
        is_need_sequence: number,
        vaccine_type: any
      ) =>
        Number(is_vaccine) === STATUS.ACTIVE &&
        Number(is_need_sequence) === STATUS.ACTIVE &&
        !!vaccine_type?.value,
      then: (schema) =>
        schema.required(t('common:validation.required')),
      otherwise: (schema) => schema.notRequired(),
    }),
  vaccine_sequence: yup
    .object({
      value: yup.number(),
      label: yup.string().nullable(),
    })
    .when(['is_vaccine', 'is_need_sequence'], {
      is: (
        is_vaccine: number,
        is_need_sequence: number) =>
        Number(is_vaccine) === STATUS.ACTIVE &&
        Number(is_need_sequence) === STATUS.ACTIVE,
      then: (schema) =>
        schema.required(t('common:validation.required')),
      otherwise: (schema) => schema.notRequired(),
    }),
  patient_id: yup
    .string()
    .required(t('common:validation.required'))
    .when('identity_type', (identity_type: any, schema) => {
      const isNik =
        Number(identity_type?.[0]?.value) === IDENTITY_TYPE_VALUE.NIK

      schema = isNik
        ? schema.matches(
          /^\d{16}$/,
          t('transactionCreateConsumption:validation.patient_id')
        )
        : schema
      return schema.test(
        'unique-in-current-data',
        t('transactionCreateConsumption:validation.uniq_patient_id'),
        function (value) {
          const currentIndex = parseInt(
            this.path.match(/\d+/)?.[0] || '-1'
          )
          const currentIdentity = this.parent.identity_type?.value
          const root = this.from?.[1]?.value
          const allPatientId = root?.all_patient_id || {}

          if (!value || currentIdentity === undefined || !root)
            return true

          const data = root?.data || []

          const isDuplicateInForm = data.some(
            (item: any, index: number) =>
              index !== currentIndex &&
              item.patient_id === value &&
              item.identity_type?.value === currentIdentity
          )

          const isDuplicateInAll =
            currentIdentity === 1
              ? allPatientId?.nik?.includes(value)
              : allPatientId?.non_nik?.includes(value)

          return !(isDuplicateInForm || isDuplicateInAll)
        }
      )
    }),
}).required(t('common:validation.required'))

export const vaccineDataSchemaSkipSequenceRabies = (
  schema: yup.ArraySchema<any[] | undefined, yup.AnyObject, undefined, "">,
  t: TFunction<['common', 'transactionCreateConsumption']>
) =>
  schema.of(
    yup.object({
      vaccine_sequence: yup.number().required(),
      vaccine_sequence_title: yup.string().required(),
      date: yup
        .date()
        .typeError(
          t(
            'transactionCreateConsumption:completed_sequence.validation.date_not_valid'
          )
        ).nullable()
    })
  ).test(
    'ordered-dates',
    t(
      'transactionCreateConsumption:completed_sequence.validation.date_sequence_not_valid'
    ),
    function (data) {
      if (!data || data.length === 0) return true

      const actualDate = new Date(this.parent.actual_date)
      const result = validateOrderedDates(data, actualDate, this.path, t)

      if (!result.valid) {
        return this.createError({
          path: result.path,
          message: result.message,
        })
      }

      return true
    }
  )