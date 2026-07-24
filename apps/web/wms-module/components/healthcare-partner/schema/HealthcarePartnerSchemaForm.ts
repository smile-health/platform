import { TFunction } from 'i18next';
import * as yup from 'yup';

export const thirdPartyPartnerFormSchema = (
  t: TFunction<['common', 'healthcarePartner']>
) => {
  return yup.object().shape({
    partnershipStatus: yup.string().required(t('common:validation.required')),
    picName: yup.string().required(t('common:validation.required')),
    picPhoneNumber: yup
      .string()
      .matches(/^\d+(\.\d+)?$/, t('common:validation.numeric_only'))
      .min(10, ({ min }) => t('common:validation.char.min', { char: min }))
      .required(t('common:validation.required')),
    picPosition: yup.string().required(t('common:validation.required')),
  });
};

export type HealthcarePartnerFormData = yup.InferType<
  ReturnType<typeof thirdPartyPartnerFormSchema>
>;
