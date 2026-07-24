import { TFunction } from 'i18next'
import * as Yup from 'yup'

export const annualPlanningSubstitutionFormValidation = (
  t: TFunction<['common', 'annualPlanningSubstitution', 'programPlan']>
) =>
  Yup.object().shape({
    material: Yup.object()
      .shape({
        value: Yup.number().nullable(),
      })
      .nullable()
      .required(t('common:validation.required')),
    substitution_materials: Yup.array()
      .of(
        Yup.object().shape({
          substitution_material_child: Yup.object()
            .shape({
              value: Yup.number().nullable(),
            })
            .nullable()
            .required(t('common:validation.required')),
        })
      )
      .min(1, t('common:validation.required')),
  })

export default {}
