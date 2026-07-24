import { TFunction } from 'i18next';
import * as yup from 'yup';

export const healthcareStorageLocationSchemaForm = (
  t: TFunction<['common', 'healthcareStorageLocation']>
) => {
  const latRegex = /^-?([0-8]?\d(\.\d+)?|90(\.0+)?)$/;
  const lngRegex = /^-?((1[0-7]\d|\d?\d)(\.\d+)?|180(\.0+)?)$/;

  return yup.object().shape({
    facilityName: yup.string().notRequired(),
    locationName: yup.string().required(t('common:validation.required')),
    latitude: yup
      .string()
      .required(t('common:validation.required'))
      .matches(latRegex, t('common:validation.coordinate'))
      .test('lat-range', t('common:validation.coordinate'), (value) => {
        if (!value) return false;
        const num = Number(value);
        return num >= -90 && num <= 90;
      }),
    longitude: yup
      .string()
      .required(t('common:validation.required'))
      .matches(lngRegex, t('common:validation.coordinate'))
      .test('lng-range', t('common:validation.coordinate'), (value) => {
        if (!value) return false;
        const num = Number(value);
        return num >= -180 && num <= 180;
      }),
    distanceLimitInMeters: yup
      .number()
      .notRequired()
      .transform((value, originalValue) =>
        String(originalValue).trim() === '' ? undefined : value
      ),
    address: yup.string().notRequired(),
    province: yup
      .object({
        label: yup.string(),
        value: yup.number(),
      })
      .notRequired(),
    city: yup
      .object({
        label: yup.string(),
        value: yup.number(),
      })
      .notRequired(),
  });
};
export type HealthcareStorageLocationSchemaFormData = yup.InferType<
  ReturnType<typeof healthcareStorageLocationSchemaForm>
>;
