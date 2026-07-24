import { TFunction } from 'i18next';
import * as yup from 'yup';

export const thirdPartyPartnerFormSchema = (
  t: TFunction<['common', 'thirdPartyPartner']>
) => {
  return yup.object().shape({
    isSameCompany: yup.boolean().required(t('common:validation.required')),
    thirdPartyPartner: yup
      .object({
        value: yup.number().moreThan(0, t('common:validation.required')),
        label: yup.string().required(t('common:validation.required')),
      })
      .when('isSameCompany', {
        is: false,
        then: (schema) => schema.required(t('common:validation.required')),
        otherwise: (schema) => schema.notRequired().nullable(),
      }),
    healthcarePartner: yup
      .object({
        value: yup.number().moreThan(0, t('common:validation.required')),
        label: yup.string().required(t('common:validation.required')),
      })
      .required(t('common:validation.required')),

    partnershipStatus: yup.string().required(t('common:validation.required')),
    contractId: yup.string().required(t('common:validation.required')),
    contractDate: yup
      .object({
        start: yup.date(),
        end: yup.date(),
      })
      .when('isSameCompany', {
        is: false,
        then: (schema) =>
          schema
            .shape({
              start: yup.date().required(t('common:validation.required')),
              end: yup
                .date()
                .required(t('common:validation.required'))
                .test(
                  'maxRange',
                  t('common:validation.max_range_contract'),
                  function (endDate) {
                    const { start } = this.parent;
                    if (!start || !endDate) return true;
                    const startDate = new Date(start);
                    const end = new Date(endDate);
                    const diffTime = Math.abs(
                      end.getTime() - startDate.getTime()
                    );
                    const diffDays = Math.ceil(
                      diffTime / (1000 * 60 * 60 * 24)
                    );
                    return diffDays <= 365;
                  }
                )
                .test(
                  'minDate',
                  t('common:validation.min_date_today'),
                  function (endDate) {
                    if (!endDate) return true;
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    return new Date(endDate) >= today;
                  }
                ),
            })
            .required(t('common:validation.required')),
        otherwise: (schema) => schema.notRequired().nullable(),
      }),

    // Conditional For Create
    wasteClassification: yup
      .array()
      .of(
        yup.object().shape({
          characteristicId: yup
            .string()
            .required(t('common:validation.required')),
          characteristicLabel: yup.string().optional(),
          providerType: yup.string().required(t('common:validation.required')),
        })
      )
      .when('$isEdit', {
        is: false,
        then: (schema) =>
          schema
            .min(1, t('common:validation.required'))
            .required(t('common:validation.required')),
        otherwise: (schema) => schema.notRequired(),
      }),

    // Conditional For Edit
    providerType: yup.string().when('$isEdit', {
      is: true,
      then: (schema) => schema.required(t('common:validation.required')),
      otherwise: (schema) => schema.notRequired(),
    }),
    wasteClassificationId: yup.number().when('$isEdit', {
      is: true,
      then: (schema) =>
        schema
          .required(t('common:validation.required'))
          .moreThan(0, t('common:validation.required')),
      otherwise: (schema) => schema.notRequired(),
    }),

    // Modal form fields
    modalSpecification: yup
      .object()
      .shape({
        characteristicId: yup.string(),
        characteristicLabel: yup.string().optional(),
      })
      .default({}),
  });
};

export type ThirdPartyPartnerFormData = yup.InferType<
  ReturnType<typeof thirdPartyPartnerFormSchema>
>;
