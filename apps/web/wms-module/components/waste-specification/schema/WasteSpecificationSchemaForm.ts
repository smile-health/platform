import { TFunction } from 'i18next';
import * as yup from 'yup';

export const wasteSpecificationFormSchema = (
  t: TFunction<['common', 'wasteSpecification']>
) => {
  return yup.object().shape({
    wasteTypeId: yup.number().required(t('common:validation.required')),
    wasteGroupId: yup.number().required(t('common:validation.required')),
    wasteCharacteristicsId: yup
      .number()
      .required(t('common:validation.required')),
    wasteCode: yup.string().required(t('common:validation.required')),
    wasteBagColor: yup.string().required(t('common:validation.required')),
    useColdStorage: yup.number().required(t('common:validation.required')),
    hasMultipleTransporters: yup
      .number()
      .required(t('common:validation.required')),
    storageRule: yup.string().notRequired(),
    coldStorageMaxProcessingTime: yup.number().when('useColdStorage', {
      is: 1,
      then: (schema) =>
        schema
          .typeError(t('common:validation.required'))
          .required(t('common:validation.required')),
      otherwise: (schema) => schema.notRequired(),
    }),
    minimunDecayDay: yup.number().when('wasteCharacteristicsId', {
      is: 54, // wasteCharacteristicsId Radioactive
      then: (schema) =>
        schema
          .typeError(t('common:validation.required'))
          .required(t('common:validation.required')),
      otherwise: (schema) => schema.notRequired(),
    }),
    temporaryStorageMaxProcessingTime: yup
      .number()
      .typeError(t('common:validation.required'))
      .required(t('common:validation.required')),
    wasteInternalTreatment: yup.string().notRequired(),
    wasteExternalTreatment: yup
      .string()
      .required(t('common:validation.required')),
    vehicleType: yup.string().notRequired(),
  });
};

export type WasteSpecificationFormData = yup.InferType<
  ReturnType<typeof wasteSpecificationFormSchema>
>;
