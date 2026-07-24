import { TFunction } from 'i18next'
import * as yup from 'yup'

export const relationSchema = (t: TFunction<['common', 'protocol']>) =>
  yup.object({
    relations: yup.array().of(
      yup.object({
        activity: yup
          .object({
            value: yup.number(),
            label: yup.string(),
          })
          .required(t('common:validation.required')),
        material: yup
          .object({
            value: yup.number(),
            label: yup.string(),
          })
          .required(t('common:validation.required')),
      })
    ),
  })
