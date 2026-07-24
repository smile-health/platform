import { TFunction } from 'i18next';
import * as yup from 'yup';

export const printLabelFormSchema = (
  t: TFunction<['common', 'printLabel']>
) => {
  return yup.object().shape({
    sourceType: yup.string().required(t('common:validation.required')),
    wasteSource: yup
      .object({
        value: yup.number().moreThan(0, t('common:validation.required')),
        label: yup.string().required(t('common:validation.required')),
      })
      .required(t('common:validation.required')),
    wasteTypeId: yup
      .number()
      .required(t('common:validation.required'))
      .moreThan(0, t('common:validation.required')),
    wasteGroupId: yup
      .number()
      .required(t('common:validation.required'))
      .moreThan(0, t('common:validation.required')),
    wasteCharacteristicsId: yup
      .number()
      .required(t('common:validation.required'))
      .moreThan(0, t('common:validation.required')),
    wasteClassificationId: yup
      .number()
      .required(t('common:validation.required')),
    total_number: yup
      .number()
      .typeError(t('common:validation.numeric_only'))
      .required(t('common:validation.required'))
      .min(1, ({ min }) => t('common:validation.min', { value: min })),
  });
};

export type PrintLabelFormData = yup.InferType<
  ReturnType<typeof printLabelFormSchema>
>;
