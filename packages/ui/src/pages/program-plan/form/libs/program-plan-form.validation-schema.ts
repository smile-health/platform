import { TFunction } from 'i18next'
import * as Yup from 'yup'

export const programPlanFormValidation = (
  t: TFunction<['common', 'programPlan']>
) =>
  Yup.object().shape({
    target_year: Yup.object()
      .shape({
        value: Yup.string(),
        label: Yup.string(),
      })
      .required(t('common:validation.required')),
    use_data_from_prev_year: Yup.boolean(),
    source_id: Yup.object()
      .shape({
        value: Yup.string(),
        label: Yup.string(),
      })
      .when('use_data_from_prev_year', {
        is: true,
        then: (schema) =>
          schema.required(
            t('programPlan:required_when_using_data_from_prev_year')
          ),
        otherwise: (schema) => schema.nullable().notRequired(),
      }),
    copy_items: Yup.array()
      .of(Yup.string())
      .default([])
      .when('use_data_from_prev_year', {
        is: true,
        then: (schema) =>
          schema.min(
            1,
            t('programPlan:required_when_using_data_from_prev_year')
          ),
        otherwise: (schema) => schema.notRequired(),
      }),
  })

export default {}
