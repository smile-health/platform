import { TFunction } from 'i18next'
import * as Yup from 'yup'

import { noughtPrefix } from './annual-planning-target-group-form.common'

const combineAge = ({ year = 0, month = 0, day = 0 }) =>
  Number(`${noughtPrefix(year)}${noughtPrefix(month)}${noughtPrefix(day)}`)

const ageLessThanOrEqual = (fromKey: string, toKey: string) => {
  return function (this: Yup.TestContext) {
    const values = this?.from?.[1]?.value ?? {}
    const fromValue = values[fromKey]
    const toValue = values[toKey]

    if (
      (!fromValue?.year && !fromValue?.month && !fromValue?.day) ||
      (!toValue?.year && !toValue?.month && !toValue?.day)
    )
      return true

    const combinedFrom = combineAge(fromValue)
    const combinedTo = combineAge(toValue)
    return combinedFrom <= combinedTo
  }
}

export const annualPlanningTargetGroupFormValidation = (
  t: TFunction<['common', 'annualPlanningTargetGroup']>
) =>
  Yup.object().shape({
    title: Yup.string().required(t('common:validation.required')),
    from_age: Yup.object()
      .shape({
        year: Yup.number()
          .transform((value, originalValue) =>
            originalValue === '' ? null : value
          )
          .nullable()
          .min(0, t('common:validation.min', { value: 0 })),
        month: Yup.number()
          .transform((value, originalValue) =>
            originalValue === '' ? null : value
          )
          .nullable()
          .min(0, t('common:validation.min', { value: 0 }))
          .max(11, t('annualPlanningTargetGroup:validation.month_max')),
        day: Yup.number()
          .transform((value, originalValue) =>
            originalValue === '' ? null : value
          )
          .nullable()
          .min(0, t('common:validation.min', { value: 0 }))
          .max(29, t('annualPlanningTargetGroup:validation.day_max')),
      })
      .test(
        'cannot-greater-than-to-age',
        t('annualPlanningTargetGroup:validation.cannot_greater_than_to'),
        function () {
          const valid = ageLessThanOrEqual('from_age', 'to_age').call(this)
          if (!valid) {
            return this.createError({
              path: this.path,
            })
          }
          return true
        }
      ),
    to_age: Yup.object()
      .shape({
        year: Yup.number()
          .transform((value, originalValue) =>
            originalValue === '' ? null : value
          )
          .nullable()
          .min(0, t('common:validation.min', { value: 0 })),
        month: Yup.number()
          .transform((value, originalValue) =>
            originalValue === '' ? null : value
          )
          .nullable()
          .min(0, t('common:validation.min', { value: 0 }))
          .max(11, t('annualPlanningTargetGroup:validation.month_max')),
        day: Yup.number()
          .transform((value, originalValue) =>
            originalValue === '' ? null : value
          )
          .nullable()
          .min(0, t('common:validation.min', { value: 0 }))
          .max(29, t('annualPlanningTargetGroup:validation.day_max')),
      })
      .test(
        'cannot-greater-than-to-age',
        t('annualPlanningTargetGroup:validation.cannot_greater_than_to'),
        function () {
          const valid = ageLessThanOrEqual('from_age', 'to_age').call(this)
          if (!valid) {
            return this.createError({
              path: this.path,
            })
          }
          return true
        }
      ),
    program_ids: Yup.array(),
  })

export const annualPlanningTargetGroupProgramFormValidation = (
  t: TFunction<['common', 'annualPlanningTargetGroup']>
) =>
  Yup.object().shape({
    target_group: Yup.array()
      .of(
        Yup.object().shape({
          target_group_child: Yup.object()
            .shape({
              value: Yup.number().nullable(),
            })
            .nullable(),
        })
      )
      .min(1, t('common:validation.required')),
  })

export default {}
