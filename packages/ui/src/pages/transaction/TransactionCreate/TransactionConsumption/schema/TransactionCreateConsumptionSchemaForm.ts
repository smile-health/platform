import { STATUS } from '#constants/common'
import { TFunction } from 'i18next'
import * as yup from 'yup'

import { getTodayDate } from '../../utils/helper'
import {
  IDENTITY_TYPE_VALUE,
  VACCINE_PROTOCOL,
} from '../transaction-consumption.constant'
import {
  formSchemaHistoryMedicalDengue,
  formSchemaVaccineDengue,
} from './TransactionCreateConsumptionSchemaProtocolDengueForm'
import { formSchemaVaccineRabies } from './TransactionCreateConsumptionSchemaProtocolRabiesForm'

export const formSchemaConsumption = (
  t: TFunction<['transactionCreate', 'common', 'transactionCreateConsumption']>
) =>
  yup.object({
    entity: yup
      .object({
        value: yup.number(),
        label: yup.string(),
      })
      .required(t('common:validation.required')),
    activity: yup
      .object({
        value: yup.number(),
        label: yup.string(),
      })
      .required(t('common:validation.required')),
    transactionType: yup
      .object({
        value: yup.number(),
        label: yup.string(),
      })
      .required(t('common:validation.required')),
    actual_date: yup
      .date()
      .typeError(t('common:validation.message_invalid_date'))
      .required(t('common:validation.required'))
      .max(getTodayDate(), t('transactionCreateConsumption:error_actual_date')),
    customer: yup
      .object({
        value: yup.number(),
        label: yup.string(),
      })
      .required(t('common:validation.required')),
    items: yup
      .array()
      .of(
        yup.object().shape({
          batches: yup
            .array()
            .test(
              'at-least-one-change_qty',
              t('common:validation.required'),
              (batches) => {
                if (!batches || batches.length === 0) return false
                return batches.some((batch) => {
                  if (batch.is_open_vial) {
                    // Must have open_vial or close_vial true
                    return batch.open_vial || batch.close_vial
                  } else {
                    // Must have a defined and non-null change_qty
                    return !!batch.change_qty
                  }
                })
              }
            ),
        })
      )
      .required(t('common:validation.required'))
      .min(1, t('transactionCreateConsumption:validation.required_materials')),
  })

export const formSchemaBatch = (
  t: TFunction<['common', 'transactionCreateConsumption']>
) =>
  yup.object({
    batches: yup
      .array()
      .of(
        yup.object().shape({
          managed_in_batch: yup.number().nullable(),
          temperature_sensitive: yup.number().nullable(),
          batch_id: yup.number().nullable(),
          available_qty: yup.number().nullable(),
          pieces_per_unit: yup.number().nullable(),
          is_vaccine: yup.number().nullable(),
          is_need_sequence: yup.number().nullable(),
          vaccine_max_qty: yup.number().nullable(),
          vaccine_min_qty: yup.number().nullable(),
          is_open_vial: yup.boolean().nullable(),
          open_vial_qty: yup.number().nullable(),
          change_qty: yup
            .number()
            .nullable()
            .typeError(t('common:validation.numeric_only'))
            .when(['pieces_per_unit'], (pieces_per_unit, schema) =>
              schema.test({
                test: (change_qty) =>
                  !change_qty ||
                  (Number(change_qty) > 0 &&
                    Number(change_qty) % Number(pieces_per_unit) === 0),
                message: t(
                  'transactionCreateConsumption:validation.quantity_must_multiply',
                  { number: pieces_per_unit }
                ),
              })
            )
            .when('available_qty', ([available_qty], schema, { value }) => {
              if (typeof value === 'number' && value >= 0 && available_qty)
                return schema
                  .min(1, t('transactionCreateConsumption:validation.min_qty'))
                  .max(
                    available_qty,
                    t('transactionCreateConsumption:validation.max_qty')
                  )
              return schema.notRequired()
            })
            .when(
              ['is_need_sequence', 'vaccine_min_qty'],
              (
                [is_need_sequence, vaccine_min_qty]: [any, any],
                schema: yup.NumberSchema<number | null>
              ) => {
                return schema.test({
                  name: 'min-vaccine-check',
                  message: t(
                    'transactionCreateConsumption:validation.min_qty_rabies',
                    {
                      number: vaccine_min_qty,
                    }
                  ),
                  test: (change_qty) => {
                    if (
                      change_qty != null &&
                      is_need_sequence &&
                      vaccine_min_qty != null
                    ) {
                      return Number(change_qty) >= Number(vaccine_min_qty)
                    }
                    return true
                  },
                })
              }
            )
            .when(
              ['is_need_sequence', 'vaccine_max_qty'],
              (
                [is_need_sequence, vaccine_max_qty]: [any, any],
                schema: yup.NumberSchema<number | null>
              ) => {
                return schema.test({
                  name: 'max-vaccine-check',
                  message: t(
                    'transactionCreateConsumption:validation.max_qty_rabies',
                    {
                      number: vaccine_max_qty,
                    }
                  ),
                  test: (change_qty) => {
                    if (
                      change_qty != null &&
                      is_need_sequence &&
                      vaccine_max_qty != null
                    ) {
                      return Number(change_qty) <= Number(vaccine_max_qty)
                    }
                    return true
                  },
                })
              }
            ),
          open_vial: yup
            .number()
            .nullable()
            .typeError(t('common:validation.numeric_only'))
            .when('open_vial_qty', ([open_vial_qty], schema, { value }) => {
              if (typeof value === 'number' && value >= 0 && open_vial_qty)
                return schema
                  .min(1, t('transactionCreateConsumption:validation.min_qty'))
                  .max(
                    open_vial_qty,
                    t(
                      'transactionCreateConsumption:validation.max_open_vial_qty'
                    )
                  )
              return schema.notRequired()
            })
            .test(
              'open-vial-required-if-close-filled',
              t(
                'transactionCreateConsumption:validation.open_vial_still_available'
              ),
              function (value) {
                const { close_vial, open_vial_qty } = this.parent
                if (!!close_vial && Number(open_vial_qty) > 0) {
                  return Number(value) === Number(open_vial_qty)
                }
                return true
              }
            ),
          close_vial: yup
            .number()
            .nullable()
            .typeError(t('common:validation.numeric_only'))
            .when(['pieces_per_unit'], (pieces_per_unit, schema) =>
              schema.test({
                test: (change_qty) =>
                  !change_qty ||
                  (Number(change_qty) > 0 &&
                    Number(change_qty) % Number(pieces_per_unit) === 0),
                message: t(
                  'transactionCreateConsumption:validation.quantity_must_multiply',
                  { number: pieces_per_unit }
                ),
              })
            )
            .when('available_qty', ([available_qty], schema, { value }) => {
              if (typeof value === 'number' && value >= 0 && available_qty)
                return schema
                  .min(1, t('transactionCreateConsumption:validation.min_qty'))
                  .max(
                    available_qty,
                    t(
                      'transactionCreateConsumption:validation.max_close_vial_qty'
                    )
                  )
              return schema.notRequired()
            }),
          status_material: yup
            .object({
              value: yup.number(),
              label: yup.string().nullable(),
            })
            .when(
              [
                'temperature_sensitive',
                'change_qty',
                'is_open_vial',
                'close_vial',
                'open_vial',
              ],
              {
                is: (
                  temperature_sensitive: number,
                  change_qty: number,
                  is_open_vial: number,
                  close_vial: number,
                  open_vial: number
                ) => {
                  const changedQtyRule = is_open_vial
                    ? !!close_vial || !!open_vial
                    : !!change_qty
                  return (
                    changedQtyRule &&
                    Number(temperature_sensitive) === STATUS.ACTIVE
                  )
                },
                then: (schema) =>
                  schema.required(t('common:validation.required')),
                otherwise: (schema) => schema.notRequired(),
              }
            ),
          patients: yup
            .array()
            .nullable()
            .when(['is_vaccine'], {
              is: (is_vaccine: number) => is_vaccine === STATUS.ACTIVE,
              then: (schema) => schema.min(1, t('common:validation.required')),
              otherwise: (schema) => schema.nullable(),
            }),
        })
      )
      .test(
        'at-least-one-change_qty',
        t('common:validation.required'),
        (batches) => {
          if (!batches || batches.length === 0) return false
          return batches.some((batch) => {
            if (batch.is_open_vial) {
              // Must have open_vial or close_vial true
              return batch.open_vial || batch.close_vial
            } else {
              // Must have a defined and non-null change_qty
              return !!batch.change_qty
            }
          })
        }
      ),
  })

export const formSchemaVaccine = (
  schema: yup.ObjectSchema<{}, yup.AnyObject, {}, ''>,
  t: TFunction<['common', 'transactionCreateConsumption']>
) =>
  schema
    .shape({
      is_need_sequence: yup.number().nullable(),
      is_vaccine: yup.number().nullable(),
      identity_type: yup
        .object({
          value: yup.number(),
          label: yup.string().nullable(),
        })
        .required(t('common:validation.required')),
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
              const currentIndex = parseInt(this.path.match(/\d+/)?.[0] || '-1')
              const currentIdentity = this.parent.identity_type?.value
              const root = this.from?.[1]?.value
              const allPatientId = root?.all_patient_id || {}

              if (!value || currentIdentity === undefined || !root) return true

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
    })
    .required(t('common:validation.required'))

export const formSchemaInputPatient = (
  t: TFunction<['common', 'transactionCreateConsumption']>
) =>
  yup.object({
    all_patient_id: yup
      .object()
      .shape({
        nik: yup.array().nullable(),
        non_nik: yup.array().nullable(),
      })
      .nullable(),
    data: yup
      .array()
      .of(
        yup.object().shape({
          is_vaccine: yup.number().nullable(),
          protocol_id: yup.number().nullable(),
          vaccination: yup
            .object()
            .when(['protocol_id'], ([protocol_id], schema) => {
              switch (Number(protocol_id)) {
                case VACCINE_PROTOCOL.RABIES:
                  return formSchemaVaccineRabies(schema, t)

                case VACCINE_PROTOCOL.DENGUE:
                  return formSchemaVaccineDengue(schema, t)

                default:
                  return formSchemaVaccine(schema, t)
              }
            }),
          identity: yup.object().when(['is_vaccine'], {
            is: (is_vaccine: number) => Number(is_vaccine) === STATUS.ACTIVE,
            then: (schema) =>
              schema
                .shape({
                  full_name: yup
                    .string()
                    .required(t('common:validation.required')),
                  birth_date: yup
                    .string()
                    .required(t('common:validation.required')),
                  gender: yup
                    .object({
                      value: yup.number(),
                      label: yup.string().nullable(),
                    })
                    .required(t('common:validation.required')),
                  marital_status: yup
                    .object({
                      value: yup.number(),
                      label: yup.string().nullable(),
                    })
                    .nullable(),
                  last_education: yup
                    .object({
                      value: yup.number(),
                      label: yup.string().nullable(),
                    })
                    .nullable(),
                  occupation: yup
                    .object({
                      value: yup.number(),
                      label: yup.string().nullable(),
                    })
                    .nullable(),
                  religion: yup
                    .object({
                      value: yup.number(),
                      label: yup.string().nullable(),
                    })
                    .nullable(),
                  ethnic: yup
                    .object({
                      value: yup.number(),
                      label: yup.string().nullable(),
                    })
                    .nullable(),
                  phone_number: yup
                    .string()
                    .min(
                      8,
                      t('transactionCreateConsumption:validation.phone_min')
                    )
                    .max(
                      15,
                      t('transactionCreateConsumption:validation.phone_max')
                    )
                    .required(t('common:validation.required')),
                  province: yup
                    .object({
                      value: yup.number(),
                      label: yup.string(),
                    })
                    .nullable(),
                  regency: yup
                    .object({
                      value: yup.number(),
                      label: yup.string(),
                    })
                    .nullable(),
                  sub_district: yup
                    .object({
                      value: yup.number(),
                      label: yup.string(),
                    })
                    .nullable(),
                  village: yup
                    .object({
                      value: yup.number(),
                      label: yup.string(),
                    })
                    .nullable(),
                  province_residential: yup
                    .object({
                      value: yup.number(),
                      label: yup.string(),
                    })
                    .nullable(),
                  regency_residential: yup
                    .object({
                      value: yup.number(),
                      label: yup.string(),
                    })
                    .nullable(),
                  sub_district_residential: yup
                    .object({
                      value: yup.number(),
                      label: yup.string(),
                    })
                    .nullable(),
                  village_residential: yup
                    .object({
                      value: yup.number(),
                      label: yup.string(),
                    })
                    .nullable(),
                  registered_address: yup.string().nullable(),
                  is_matched_address: yup.number().nullable(),
                  residential_address: yup.string().nullable(),
                })
                .required(t('common:validation.required')),
            otherwise: (schema) => schema.notRequired(),
          }),
          history_medical: yup
            .object()
            .when('protocol_id', ([protocol_id], schema) => {
              if (Number(protocol_id) === VACCINE_PROTOCOL.DENGUE) {
                return formSchemaHistoryMedicalDengue(schema, t)
              }

              return schema.shape({}).notRequired()
            }),
          history_vaccination: yup.object().shape({}).notRequired(),
        })
      )
      .required(t('common:validation.required')),
  })
