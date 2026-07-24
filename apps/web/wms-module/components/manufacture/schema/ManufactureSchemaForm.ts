import { TFunction } from 'i18next';
import * as yup from 'yup';

export const manufactureFormSchema = (
  t: TFunction<['common', 'manufacture']>
) => {
  return yup.object().shape({
    asset_type: yup.string().required(t('common:validation.required')),
    manufacturer: yup
      .object({
        value: yup.number(),
        label: yup.string(),
      })
      .required(t('common:validation.required')),
    model: yup.string().notRequired(),
    description: yup.string().notRequired(),
  });
};

export type ManufactureFormData = yup.InferType<
  ReturnType<typeof manufactureFormSchema>
>;
