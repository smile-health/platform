import { TFunction } from 'i18next'
import * as yup from 'yup'

const FREE_TEXT_VALUE = -1

export const schemaInput = (t: TFunction<['common', 'analysisParameter']>) =>
  yup.object().shape({
    name: yup
      .string()
      .required(t('common:validation.required'))
      .max(255, t('common:validation.char.max', { char: 255 })),
    unit_id: yup
      .number()
      .nullable()
      .required(t('common:validation.required')),
    custom_unit_name: yup
      .string()
      .when('unit_id', {
        is: FREE_TEXT_VALUE,
        then: (schema) =>
          schema
            .required(t('common:validation.required'))
            .max(255, t('common:validation.char.max', { char: 255 })),
        otherwise: (schema) => schema.notRequired(),
      }),
  })
