import { TFunction } from 'i18next';
import * as yup from 'yup';

export const partnershipFormSchema = (
  t: TFunction<['common', 'partnership']>
) => {
  return yup.object().shape({
    contractDate: yup
      .object({
        start: yup.date().required(t('common:validation.required')),
        end: yup.date().required(t('common:validation.required')),
      })
      .required(t('common:validation.required'))
      .test('contractDateValidation', function (value) {
        const { start, end } = value || {};
        const { partnershipStatus } = this.parent;

        if (!start || !end) return true;

        const diffTime = Math.abs(
          new Date(end).getTime() - new Date(start).getTime()
        );
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays > 365) {
          return this.createError({
            path: 'contractDate.end',
            message: t('common:validation.max_range_contract'),
          });
        }
        // minDate is only checked if the status is not EXPIRED
        if (partnershipStatus !== 'EXPIRED') {
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          if (new Date(end) < today) {
            return this.createError({
              path: 'contractDate.end',
              message: t('common:validation.min_date_today'),
            });
          }
        }
        return true;
      }),

    entity: yup
      .object({
        value: yup.number().moreThan(0, t('common:validation.required')),
        label: yup.string().required(t('common:validation.required')),
      })
      .required(t('common:validation.required')),
    partnershipStatus: yup.string().required(t('common:validation.required')),
    providerType: yup.string().required(t('common:validation.required')),
    picName: yup.string().required(t('common:validation.required')),
    picPhoneNumber: yup
      .string()
      .matches(/^\d+(\.\d+)?$/, t('common:validation.numeric_only'))
      .min(10, ({ min }) => t('common:validation.char.min', { char: min }))
      .required(t('common:validation.required')),
    picPosition: yup.string().required(t('common:validation.required')),
    contractId: yup.string().required(t('common:validation.required')),

    // Conditional For Create
    wasteClassification: yup
      .array()
      .of(
        yup.object().shape({
          type: yup.string().required(t('common:validation.required')),
          typeLabel: yup.string().optional(),
          group: yup.string().required(t('common:validation.required')),
          groupLabel: yup.string().optional(),
          characteristic: yup
            .string()
            .required(t('common:validation.required')),
          characteristicLabel: yup.string().optional(),
          classification: yup
            .string()
            .required(t('common:validation.required')),
          pricePerKg: yup
            .string()
            .matches(/^\d+(\.\d+)?$/, t('common:validation.numeric_only'))
            .required(t('common:validation.required')),
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
    pricePerKg: yup.string().when('$isEdit', {
      is: true,
      then: (schema) =>
        schema
          .matches(/^\d+(\.\d+)?$/, t('common:validation.numeric_only'))
          .required(t('common:validation.required')),
      otherwise: (schema) => schema.notRequired(),
    }),
    wasteTypeId: yup.number().when('$isEdit', {
      is: true,
      then: (schema) =>
        schema
          .required(t('common:validation.required'))
          .moreThan(0, t('common:validation.required')),
      otherwise: (schema) => schema.notRequired(),
    }),
    wasteGroupId: yup.number().when('$isEdit', {
      is: true,
      then: (schema) =>
        schema
          .required(t('common:validation.required'))
          .moreThan(0, t('common:validation.required')),
      otherwise: (schema) => schema.notRequired(),
    }),
    wasteCharacteristicsId: yup.number().when('$isEdit', {
      is: true,
      then: (schema) =>
        schema
          .required(t('common:validation.required'))
          .moreThan(0, t('common:validation.required')),
      otherwise: (schema) => schema.notRequired(),
    }),
    wasteClassificationId: yup.number().when('$isEdit', {
      is: true,
      then: (schema) => schema.required(t('common:validation.required')),
      otherwise: (schema) => schema.notRequired(),
    }),

    // Modal form fields
    modalSpecification: yup
      .object()
      .shape({
        type: yup.string(),
        typeLabel: yup.string().optional(),
        group: yup.string(),
        groupLabel: yup.string().optional(),
        characteristic: yup.string(),
        characteristicLabel: yup.string().optional(),
        classification: yup.string(),
      })
      .default({}),
  });
};

export type PartnershipFormData = yup.InferType<
  ReturnType<typeof partnershipFormSchema>
>;
