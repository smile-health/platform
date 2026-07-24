import { TFunction } from 'i18next';
import * as yup from 'yup';

export const partnershipVehicleFormSchema = (
  t: TFunction<['common', 'partnershipVehicle']>,
  isEdit: boolean = false
) => {
  const entitySchema = isEdit
    ? yup
        .object({
          value: yup.number().moreThan(0, t('common:validation.required')),
          label: yup.string().required(t('common:validation.required')),
        })
        .required(t('common:validation.required'))
    : yup
        .array()
        .of(
          yup.object({
            value: yup.number().moreThan(0, t('common:validation.required')),
            label: yup.string().required(t('common:validation.required')),
          })
        )
        .min(1, t('common:validation.required'))
        .required(t('common:validation.required'));

  return yup.object().shape({
    entity: entitySchema,
    vehicleType: yup.string().required(t('common:validation.required')),
    vehicleNumber: yup
      .string()
      .required(t('common:validation.required'))
      .matches(
        /^[A-Z]{1,3} \d{1,4} [A-Z]{1,3}$/,
        t('partnershipVehicle:form.vehicle_number.validation.invalid_format')
      ),
    capacityInKgs: yup.string().required(t('common:validation.required')),
  });
};

export type PartnershipVehicleFormData = yup.InferType<
  ReturnType<typeof partnershipVehicleFormSchema>
>;
