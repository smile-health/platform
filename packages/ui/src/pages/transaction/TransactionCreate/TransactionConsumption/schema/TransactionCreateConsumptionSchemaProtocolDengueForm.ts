import { OptionType } from '#components/react-select'
import { STATUS } from '#constants/common'
import { TFunction } from 'i18next'
import * as yup from 'yup'
import { REACTION_AFTER_DENGUE } from '../transaction-consumption.constant'
import { validateOrderedDates } from '../utils/helpers'

export const formSchemaVaccineDengue = (
  schema: yup.ObjectSchema<{}, yup.AnyObject, {}, "">,
  t: TFunction<['common', 'transactionCreateConsumption']>
) => schema.shape({
  is_need_sequence: yup.number().nullable(),
  is_vaccine: yup.number().nullable(),
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
    .when('_', (_: unknown, schema) => {
      schema = schema.matches(
        /^\d{16}$/,
        t('transactionCreateConsumption:validation.patient_id')
      )
      return schema.test(
        'unique-in-current-data',
        t('transactionCreateConsumption:validation.uniq_patient_id'),
        function (value) {
          const currentIndex = parseInt(
            this.path.match(/\d+/)?.[0] || '-1'
          )
          const root = this.from?.[1]?.value
          const allPatientId = root?.all_patient_id || {}

          if (!value || !root)
            return true

          const data = root?.data || []

          const isDuplicateInForm = data.some(
            (item: any, index: number) =>
              index !== currentIndex &&
              item.patient_id === value
          )

          const isDuplicateInAll = allPatientId?.nik?.includes(value)

          return !(isDuplicateInForm || isDuplicateInAll)
        }
      )
    }),
  reaction_id: yup.object({
    value: yup.number(),
    label: yup.string().nullable(),
  }).required(t('common:validation.required')),
  other_reaction: yup.string().when(['reaction_id'], {
    is: (reaction_id: OptionType) => reaction_id?.value === REACTION_AFTER_DENGUE.OTHERS,
    then: (schema) => schema.required(t('common:validation.required')),
    otherwise: (schema) => schema.notRequired()
  })
}).required(t('common:validation.required'))

export const formSchemaHistoryMedicalDengue = (
  schema: yup.ObjectSchema<{}, yup.AnyObject, {}, "">,
  t: TFunction<['common', 'transactionCreateConsumption']>
) => schema.shape({
  is_dengue_before: yup.number().required(t('common:validation.required')),
  last_dengue_diagnosis: yup.string().nullable().notRequired(),
  last_dengue_diagnosis_month: yup.number().when(['is_dengue_before'], {
    is: (is_dengue_before: number) => !!is_dengue_before,
    then: (schema) => schema.required('common:validation.required'),
    otherwise: (schema) => schema.notRequired()
  }),
  last_dengue_diagnosis_year: yup.number().when(['is_dengue_before'], {
    is: (is_dengue_before: number) => !!is_dengue_before,
    then: (schema) => schema.required('common:validation.required'),
    otherwise: (schema) => schema.nullable().notRequired()
  }),
  dengue_received_vaccine: yup.number().required(t('common:validation.required')),
}).required(t('common:validation.required'))

export const vaccineDataSchemaSkipSequenceDengue = (
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
        )
        .required(t('common:validation.required')),
      entity: yup.object({
        value: yup.number().required(),
        label: yup.string().required(),
      }).nullable().required(t('common:validation.required')),
      reaction: yup.object({
        value: yup.number().required(),
        label: yup.string().required(),
      }).nullable().required(t('common:validation.required')),
      other_reaction: yup.string().when(['reaction'], {
        is: (reaction: OptionType) => reaction?.value === REACTION_AFTER_DENGUE.OTHERS,
        then: (schema) => schema.required(t('common:validation.required')),
        otherwise: (schema) => schema.notRequired()
      }),
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
