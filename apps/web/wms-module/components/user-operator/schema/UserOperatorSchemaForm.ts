import { TFunction } from 'i18next';
import * as yup from 'yup';

export const userOperatorFormSchema = (
  t: TFunction<['common', 'userOperator']>
) => {
  return yup.object().shape({
    operator: yup
      .object({
        value: yup.string(),
        label: yup.string(),
      })
      .required(t('common:validation.required')),
    healthcare_facility: yup
      .object({
        value: yup.number(),
        label: yup.string(),
      })
      .required(t('common:validation.required')),
  });
};

export type UserOperatorFormData = yup.InferType<
  ReturnType<typeof userOperatorFormSchema>
>;
