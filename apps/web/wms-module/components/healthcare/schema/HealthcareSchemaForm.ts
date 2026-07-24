import { ROLE_LABEL } from '@/types/roles';
import { TFunction } from 'i18next';
import * as yup from 'yup';
import { isFacilityAdmin } from '@/utils/getUserRole';

export const healthcareFormSchema = (
  t: TFunction<['common', 'healthCare']>,
  role: ROLE_LABEL | null
) => {
  return yup.object().shape({
    healthcare_facility: isFacilityAdmin()
      ? yup
          .object({
            value: yup.number().nullable(),
            label: yup.string().nullable(),
          })
          .nullable()
          .notRequired()
      : yup
          .object({
            value: yup.number().moreThan(0, t('common:validation.required')),
            label: yup.string().required(t('common:validation.required')),
          })
          .required(t('common:validation.required')),
    assetType: yup.string().required(t('common:validation.required')),
    manufacture: yup
      .object({
        value: yup.number().moreThan(0, t('common:validation.required')),
        label: yup.string().required(t('common:validation.required')),
      })
      .required(t('common:validation.required')),
    model: yup
      .object({
        value: yup.number().moreThan(0, t('common:validation.required')),
        label: yup.string().required(t('common:validation.required')),
      })
      .required(t('common:validation.required')),
    assetId: yup
      .string()
      .required(t('common:validation.required'))
      .min(3, ({ min }) => t('common:validation.char.min', { char: min })),
    isIotEnable: yup.boolean().required(t('common:validation.required')),
    assetStatus: yup.string().required(t('common:validation.required')),
    yearOfProduction: yup
      .number()
      .required(t('common:validation.required'))
      .min(1900, t('common:validation.message_invalid_year'))
      .max(
        new Date().getFullYear(),
        t('common:validation.message_invalid_year')
      ),
    warrantyStartDate: yup
      .date()
      .typeError(t('common:validation.message_invalid_date'))
      .required(t('common:validation.required')),
    warrantyEndDate: yup
      .date()
      .nullable()
      .typeError(t('common:validation.message_invalid_date'))
      .required(t('common:validation.required'))
      .min(
        yup.ref('warrantyStartDate'),
        t('common:validation.date_must_be_after_start_date')
      ),
  });
};

export type HealthcareFormData = yup.InferType<
  ReturnType<typeof healthcareFormSchema>
>;
