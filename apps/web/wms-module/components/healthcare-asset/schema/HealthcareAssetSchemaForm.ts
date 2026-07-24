import { TFunction } from 'i18next';
import * as yup from 'yup';

export const healthcareAssetFormSchema = (
  t: TFunction<['common', 'healthcareAsset']>
) => {
  return yup.object().shape({
    assetId: yup
      .string()
      .nullable()
      .test(
        'min-length',
        t('common:validation.char.min', { char: 3 }),
        (value) => !value || value.length >= 3
      ),
  });
};

export type HealthcareAssetFormData = yup.InferType<
  ReturnType<typeof healthcareAssetFormSchema>
>;
