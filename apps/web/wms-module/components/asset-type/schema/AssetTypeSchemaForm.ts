import { TFunction } from 'i18next';
import * as yup from 'yup';

export const assetTypeFormSchema = (t: TFunction<['common', 'assetType']>) => {
  return yup.object().shape({
    name: yup.string().required(t('common:validation.required')),
    description: yup.string().required(t('common:validation.required')),
    maxTemperature: yup.string().notRequired(),
    minTemperature: yup.string().notRequired(),
  });
};

export type AssetTypeFormData = yup.InferType<
  ReturnType<typeof assetTypeFormSchema>
>;
