import { TFunction } from 'i18next';
import * as yup from 'yup';

export const budgetSourceFormSchema = (
  t: TFunction<['common', 'budgetSource']>
) => {
  return yup.object().shape({
    name: yup.string().required(t('common:validation.required')),
    description: yup.string().required(t('common:validation.required')),
  });
};

export type BudgetSourceFormData = yup.InferType<
  ReturnType<typeof budgetSourceFormSchema>
>;
