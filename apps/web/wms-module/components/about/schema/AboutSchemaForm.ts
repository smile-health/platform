import { TFunction } from 'i18next';
import * as yup from 'yup';

export const aboutFormSchema = (t: TFunction<['common', 'about']>) => {
  return yup.object().shape({
    nib: yup.string().nullable().notRequired(),
    headName: yup.string().nullable().notRequired(),
    gender: yup.number().nullable().notRequired(),
    email: yup.string().email(t('common:validation.email')).nullable().notRequired(),
    phone: yup
      .mixed()
      .test('is-number', t('common:validation.numeric_only'), (value) => {
        if (value === '' || value === null || value === undefined) return true;
        return /^\d+$/.test(String(value));
      })
      .test(
        'min-length',
        t('common:validation.char.min', { char: 10 }),
        (value) => {
          if (value === '' || value === null || value === undefined)
            return true;
          return String(value).length >= 10;
        }
      )
      .nullable()
      .notRequired(),
    totalBedroom: yup
      .string()
      .nullable()
      .notRequired()
      .matches(/^\d*$/, t('common:validation.numeric_only'))
      .transform((value) => (value === '' ? null : value)),
    percentageBedroom: yup
      .string()
      .nullable()
      .notRequired()
      .matches(/^\d*([.,]\d+)?$/, t('common:validation.percentage'))
      .transform((value) => (value === '' ? null : value)),
  });
};

export type AboutFormData = yup.InferType<ReturnType<typeof aboutFormSchema>>;
