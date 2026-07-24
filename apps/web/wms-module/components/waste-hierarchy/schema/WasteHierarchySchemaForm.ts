import { TFunction } from 'i18next';
import * as yup from 'yup';

export const wasteTypeFormSchema = (
  t: TFunction<['common', 'wasteHierarchy']>
) => {
  return yup.object().shape({
    waste_type: yup.string().required(t('common:validation.required')),
    description: yup
      .string()
      .max(255)
      .required(t('common:validation.required')),
  });
};

export type WasteTypeFormData = yup.InferType<
  ReturnType<typeof wasteTypeFormSchema>
>;

export const wasteGroupFormSchema = (
  t: TFunction<['common', 'wasteHierarchy']>
) => {
  return yup.object().shape({
    waste_type: yup
      .object({
        value: yup.number().moreThan(0, t('common:validation.required')),
        label: yup.string().required(t('common:validation.required')),
      })
      .required(t('common:validation.required')),
    waste_group: yup.string().required(t('common:validation.required')),
    description: yup
      .string()
      .max(255)
      .required(t('common:validation.required')),
  });
};

export type WasteGroupFormData = yup.InferType<
  ReturnType<typeof wasteGroupFormSchema>
>;

export const wasteCharacteristicFormSchema = (
  t: TFunction<['common', 'wasteHierarchy']>
) => {
  return yup.object().shape({
    waste_type: yup
      .object({
        value: yup.number().moreThan(0, t('common:validation.required')),
        label: yup.string().required(t('common:validation.required')),
      })
      .required(t('common:validation.required')),
    waste_group: yup
      .object({
        value: yup.number().moreThan(0, t('common:validation.required')),
        label: yup.string().required(t('common:validation.required')),
      })
      .required(t('common:validation.required')),
    waste_characteristic: yup
      .string()
      .required(t('common:validation.required')),
    is_active: yup.boolean().required(t('common:validation.required')),
    description: yup
      .string()
      .max(255)
      .required(t('common:validation.required')),
  });
};

export type WasteCharacteristicFormData = yup.InferType<
  ReturnType<typeof wasteCharacteristicFormSchema>
>;
