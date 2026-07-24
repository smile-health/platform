import { TFunction } from 'i18next';
import * as yup from 'yup';

export const distanceSchemaForm = (
  t: TFunction<['common', 'distance']>,
  minDistance?: number
) => {
  return yup.object().shape({
    distance_limit: yup
      .number()
      .required(t('common:validation.required'))
      .min(minDistance ?? 1, ({ min }) =>
        t('common:validation.min', { value: min })
      )
      .transform((value, originalValue) =>
        String(originalValue).trim() === '' ? undefined : value
      ),
  });
};
export type DistanceSchemaFormData = yup.InferType<
  ReturnType<typeof distanceSchemaForm>
>;
