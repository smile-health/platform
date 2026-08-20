import { TFunction } from 'i18next'
import * as yup from 'yup'

export const schemaInput = (t: TFunction<['common', 'activity']>) =>
  yup.object().shape({
    is_ordered_purchase: yup.boolean().optional(),
    is_ordered_sales: yup.boolean().when('is_ordered_purchase', {
      is: (is_ordered_purchase: boolean) => !is_ordered_purchase,
      then: (schema) =>
        schema.oneOf([true], t('activity:form.process.validation.required')),
      otherwise: (schema) => schema.nullable(),
    }),
    name: yup
      .string()
      .required(t('common:validation.required'))
      .matches(/^(?!\s+$).*/, t('activity:form.name.validation.required'))
      .max(255, t('common:validation.char.max', { char: 255 })),
    protocol: yup.string().required(t('common:validation.required')),
    is_final_distribution: yup.boolean().nullable().optional(),
  })
