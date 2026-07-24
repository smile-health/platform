import { TFunction } from 'i18next'
import * as Yup from 'yup'

export const programPlanMaterialRatioFormValidation = (
  t: TFunction<['common', 'programPlanMaterialRatio', 'programPlan']>,
) =>
  Yup.object().shape({
    from_material: Yup.object()
      .shape({
        subtype: Yup.object()
          .shape({
            value: Yup.number().nullable(),
          })
          .nullable()
          .required(t('common:validation.required')),
        material: Yup.object()
          .shape({
            value: Yup.number().nullable(),
          })
          .nullable()
          .required(t('common:validation.required')),
        amount: Yup.number().required(t('common:validation.required')),
      })
      .required(),
    to_material: Yup.object()
      .shape({
        subtype: Yup.object()
          .shape({
            value: Yup.number().nullable(),
          })
          .nullable()
          .required(t('common:validation.required')),
        material: Yup.object()
          .shape({
            value: Yup.number().nullable(),
          })
          .nullable()
          .required(t('common:validation.required')),
        amount: Yup.number().required(t('common:validation.required')),
      })
      .required(),
  })

export default {}
