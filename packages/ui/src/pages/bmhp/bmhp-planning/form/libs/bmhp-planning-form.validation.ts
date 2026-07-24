import { TFunction } from 'i18next'
import * as Yup from 'yup'

export const bmhpPlanningFormValidation = (
  t: TFunction<['common', 'bmhpPlanning']>
) =>
  Yup.object({
    year: Yup.object()
      .shape({
        value: Yup.number().required(
          t('bmhpPlanning:validation.year_required')
        ),
        label: Yup.string(),
      })
      .nullable()
      .required(t('bmhpPlanning:validation.year_required')),
  })
