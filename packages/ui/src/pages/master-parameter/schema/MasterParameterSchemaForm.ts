import type { TFunction } from 'i18next'
import * as yup from 'yup'

export const masterParameterFormSchema = (t: TFunction) =>
  yup.object({
    name: yup
      .string()
      .required(t('common:validation.required'))
      .min(3, t('common:validation.char.min', { char: 3 }))
      .max(100, t('common:validation.char.max', { char: 100 })),
    unit: yup.string().nullable().optional(),
    description: yup
      .string()
      .required(t('common:validation.required'))
      .min(10, t('common:validation.char.min', { char: 10 }))
      .max(500, t('common:validation.char.max', { char: 500 })),
  })

export type MasterParameterFormType = yup.InferType<
  ReturnType<typeof masterParameterFormSchema>
>
