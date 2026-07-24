import { TFunction } from 'i18next';
import * as yup from 'yup';

export const assetDongleFormSchema = (t: TFunction<['common']>) => {
  return yup.object().shape({
    assetId: yup
      .string()
      .required(t('common:validation.required'))
      .min(3, ({ min }) => t('common:validation.char.min', { char: min })),
  });
};

export type AssetDongleFormData = yup.InferType<
  ReturnType<typeof assetDongleFormSchema>
>;
