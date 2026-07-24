import { TFunction } from 'i18next';
import * as yup from 'yup';

export const wasteSourceFormSchema = (
  t: TFunction<['common', 'wasteSource']>
) => {
  return yup.object().shape({
    sourceType: yup.string().required(t('common:validation.required')),
    internalSourceName: yup.string().when('sourceType', {
      is: 'INTERNAL',
      then: (schema) => schema.required(t('common:validation.required')),
      otherwise: (schema) => schema.notRequired(),
    }),
    internalTreatmentName: yup.string().when('sourceType', {
      is: 'INTERNAL_TREATMENT',
      then: (schema) => schema.required(t('common:validation.required')),
      otherwise: (schema) => schema.notRequired(),
    }),
    externalHealthcareFacility: yup
      .object({
        label: yup.string(),
        value: yup.number(),
      })
      .when('sourceType', {
        is: (sourceType: string) => sourceType === 'EXTERNAL',
        then: (schema) =>
          schema
            .shape({
              label: yup.string().required(t('common:validation.required')),
              value: yup.number().required(t('common:validation.required')),
            })
            .required(t('common:validation.required')),
        otherwise: (schema) =>
          schema
            .shape({
              label: yup.string().notRequired(),
              value: yup.number().notRequired(),
            })
            .notRequired(),
      }),
  });
};

export type WasteSourceFormData = yup.InferType<
  ReturnType<typeof wasteSourceFormSchema>
>;
