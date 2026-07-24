import { TFunction } from 'i18next'
import * as yup from 'yup'

export const schemaInput = (t: TFunction<['common', 'parameterCategory']>) =>
  yup.object().shape({
    name: yup
      .string()
      .required(t('common:validation.required'))
      .max(100, t('common:validation.char.max', { char: 100 })),
    analysis_parameters: yup
      .array()
      .of(
        yup.object().shape({
          env_analysis_parameter_id: yup
            .number()
            .required(t('common:validation.required')),
          env_test_method_ids: yup
            .array()
            .of(yup.number())
            .min(1, t('common:validation.required'))
            .required(t('common:validation.required')),
        })
      )
      .min(1, t('parameterCategory:form.analysis_parameters_min' as any)),
    fields: yup
      .array()
      .of(
        yup.object().shape({
          key: yup
            .string()
            .nullable()
            .max(100, t('common:validation.char.max', { char: 100 })),
          type_data: yup
            .string()
            .required(t('common:validation.required'))
            .max(100, t('common:validation.char.max', { char: 100 })),
          label: yup
            .string()
            .required(t('common:validation.required'))
            .max(100, t('common:validation.char.max', { char: 100 })),
          hint: yup
            .string()
            .nullable()
            .max(100, t('common:validation.char.max', { char: 100 })),
          mandatory: yup
            .number()
            .required(t('common:validation.required')),
          options: yup
            .string()
            .nullable()
            .when('type_data', {
              is: 'dropdown',
              then: (schema) => schema.required(t('common:validation.required')),
            }),
        })
      ),
  })
