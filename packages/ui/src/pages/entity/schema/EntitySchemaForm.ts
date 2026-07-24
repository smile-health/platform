import { TFunction } from 'i18next'
import moment from 'moment'
import * as yup from 'yup'
import type { TestContext } from 'yup'

import { dateRegex } from '../utils/helper'

export const formSchema = yup.object({
  id: yup.string().notRequired(),
  id_satu_sehat: yup
    .string()
    .nullable()
    .transform((val, originalVal) => (originalVal === '' ? null : val))
    .test('len-10', 'common:validation.satu_sehat', (value) => {
      if (!value || value === 'null') return true
      return value.length === 10
    }),
  code: yup.string().required('common:validation.required'),
  name: yup.string().required('common:validation.required'),
  type: yup.number().required('common:validation.required'),
  entity_tag_id: yup.number().required('common:validation.required'),
  is_puskesmas: yup.string().required(),
  is_vendor: yup.string().nullable(),
  is_ayosehat: yup.string().required(),

  province_id: yup.string().notRequired(),
  regency_id: yup.string().notRequired(),
  sub_district_id: yup.string().notRequired(),
  village_id: yup.string().notRequired(),
  postal_code: yup.string().notRequired(),
  address: yup.string().required('common:validation.required'),
  lat: yup.string().notRequired(),
  lng: yup.string().notRequired(),

  activities_date: yup
    .array()
    .of(
      yup.object().shape({
        id: yup.string().required(),
        start_date: yup.string(),
        end_date: yup.string(),
      })
    )
    .notRequired(),

  rutin_join_date: yup.string().notRequired(),
  beneficiaries_ids: yup.array().of(yup.number().required()),
  program_ids: yup.array().of(yup.number().required()),

  // sentinel lab
  is_sentinel_lab: yup.boolean().notRequired().default(false),
  sentinel_lab_start_date: yup
    .string()
    .nullable()
    .notRequired()
    .when('is_sentinel_lab', {
      is: true,
      then: (schema) => schema.required('common:validation.required'),
    }),
  sentinel_lab_end_date: yup
    .string()
    .nullable()
    .notRequired()
    .when('is_sentinel_lab', {
      is: true,
      then: (schema) => schema.required('common:validation.required'),
    }),

  // addtional data global
  province: yup
    .object({
      value: yup.number(),
      label: yup.string(),
    })
    .notRequired(),
  regency: yup
    .object({
      value: yup.number(),
      label: yup.string(),
    })
    .notRequired(),
  sub_district: yup
    .object({
      value: yup.number(),
      label: yup.string(),
    })
    .notRequired(),
  village: yup
    .object({
      value: yup.number(),
      label: yup.string(),
    })
    .notRequired(),
})

export const addMaterialEntitySchema = (t: TFunction<['entity', 'common']>) =>
  yup.object({
    material_id: yup.number().required(t('common:validation.required')),
    activity_id: yup
      .array()
      .of(yup.number())
      .required(t('common:validation.required')),
    material_type_id: yup
      .array()
      .of(yup.number())
      .required(t('common:validation.required')),
  })

export const updateMaterialEntitySchema = (
  t: TFunction<['entity', 'common']>
) =>
  yup.object({
    material_id: yup
      .mixed()
      .test(
        'is-object-or-number',
        t('common:validation.required'),
        (value: number | object) => {
          if (typeof value === 'number') return true
          if (typeof value === 'object') {
            return true
          }
          return false
        }
      )
      .required(t('common:validation.required')),
    activity_id: yup
      .mixed()
      .test(
        'is-object-or-number',
        t('common:validation.required'),
        (value: number | object) => {
          if (typeof value === 'number') return true
          if (typeof value === 'object') {
            return true
          }
          return false
        }
      )
      .required(t('common:validation.required')),
    min: yup
      .mixed()
      .test(
        'is-valid-number',
        t('entity:form.errors.insert_with_number'),
        (value) => typeof value !== 'string'
      ),
    max: yup
      .mixed()
      .test(
        'is-valid-number',
        t('entity:form.errors.insert_with_number'),
        (value) => typeof value !== 'string'
      )
      .test(
        'max-greater-than-min',
        t('entity:form.errors.max_greater_than_min'),
        function (value) {
          if (isNaN(this.parent.min)) return true

          return Number(value) >= Number(this.parent.min)
        }
      ),
    consumption_rate: yup
      .mixed()
      .test(
        'is-valid-number',
        t('entity:form.errors.insert_with_number'),
        (value) => typeof value !== 'string'
      ),
    retailer_price: yup
      .mixed()
      .test(
        'is-valid-number',
        t('entity:form.errors.insert_with_number'),
        (value) => typeof value !== 'string'
      ),
    tax: yup
      .mixed()
      .test(
        'is-valid-number',
        t('entity:form.errors.insert_with_number'),
        (value) => typeof value !== 'string'
      ),
  })

export const activityImpelemtationTimeSchema = (
  t: TFunction<['common', 'entity']>
) =>
  yup.object({
    activities: yup
      .array()
      .of(
        yup.array().of(
          yup.object({
            id: yup.string().nullable(),
            start_date: yup
              .string()
              .matches(dateRegex, t('entity:form.errors.invalid_date_format'))
              .test(
                'start-date-required-when-end-date',
                t('entity:form.errors.invalid_only_end_date'),
                function (value) {
                  const { end_date } = this.parent
                  if (end_date) return value !== null && value !== ''
                  return true
                }
              )
              .test(
                'startDate-overLap',
                t('entity:form.errors.invalid_current_start_date'),
                function (value) {
                  const { options, path } = this
                  const allPeriods = (options as TestContext)?.from?.[1]?.value
                    ?.activities
                  const matches = path.split(/[|[\]]/)
                  const firstIndex = Number(matches[1])
                  const secondIndex = Number(matches[3])

                  const currentActivity = allPeriods?.[firstIndex]

                  const currentStart = moment(value)?.valueOf()
                  const prevEnd = moment(
                    currentActivity?.[secondIndex - 1]?.end_date || null
                  )?.valueOf()

                  const isOverlapping = currentStart <= prevEnd
                  return !isOverlapping
                }
              )
              .nullable(),
            end_date: yup
              .string()
              .matches(dateRegex, t('entity:form.errors.invalid_date_format'))
              .test(
                'endDate-after-joinDate',
                t('entity:form.errors.invalid_end_date'),
                function (value) {
                  const { start_date } = this.parent
                  return !start_date || !value || value >= start_date
                }
              )
              .test(
                'endDate-required',
                t('entity:form.errors.prev_end_date_required'),
                function (value) {
                  const { options, path } = this
                  const allPeriods = (options as TestContext)?.from?.[1]?.value
                    ?.activities
                  const matches = path.split(/[|[\]]/)
                  const firstIndex = Number(matches[1])
                  const secondIndex = Number(matches[3])

                  const currentActivity = allPeriods?.[firstIndex]

                  const nextStart =
                    currentActivity?.[secondIndex + 1]?.start_date

                  if (!nextStart) return true
                  if (!!nextStart && !!value) return true
                  return false
                }
              )
              .nullable(),
          })
        )
      )
      .test(function (items) {
        const isValid = items?.some((item) => item?.some((i) => i.start_date))
        if (!isValid)
          return this.createError({
            message: t('entity:form.errors.at_least_one_required'),
            type: 'AtLeastOneRequired',
          })
        return true
      }),
  })

export const customerSchema = (t: TFunction<['entity', 'user', 'common']>) =>
  yup.object({
    customers: yup.array().of(
      yup.object({
        customer: yup
          .object({
            value: yup.number(),
          })
          ?.required(t('common:validation.required')),
        activity: yup
          .array()
          .of(yup.object({ value: yup.number() }))
          .nullable()
          .test(function (items) {
            const isValid = items?.some((item) => item.value && item.value > 0)
            if (!isValid)
              return this.createError({
                message: t('common:validation.required'),
                type: 'AtLeastOneRequired',
              })
            return true
          }),
      })
    ),
  })
