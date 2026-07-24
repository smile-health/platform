import { TFunction } from 'i18next'
import * as yup from 'yup'

const validateNonNegativeValue = (value: any) => {
  if (
    value === null ||
    value === undefined ||
    value === '' ||
    Number.isNaN(value)
  ) {
    return true
  }
  return Number(value) >= 0
}

const createCapacitySchema = (
  fieldName: string,
  t: TFunction<['common', 'pqs']>
) =>
  yup
    .mixed()
    .transform((val, orig) => {
      return isNaN(Number(orig)) ? null : Number(orig)
    })
    .nullable()
    .test(fieldName, t('validation.required'), validateNonNegativeValue)
    .test({
      name: 'at-least-one-capacity',
      test: function validateAtLeastOneCapacity() {
        const { parent } = this
        const isEmpty = (value: any) => {
          return (
            value === null || value === undefined || value === '' || value === 0
          )
        }

        const allEmpty =
          isEmpty(parent.net_capacity5) &&
          isEmpty(parent.net_capacityMin20) &&
          isEmpty(parent.net_capacityMin86)

        return !allEmpty
      },
      message: t('pqs:form.capacity.validation.at_least_one_capacity_required'),
    })

export const formSchema = (t: TFunction<['common', 'pqs']>) =>
  yup.object({
    code: yup.string().required(t('validation.required')),
    pqs_type_id: yup
      .object()
      .shape({
        value: yup.number(),
        label: yup.string(),
      })
      .required(t('validation.required')),
    cceigat_description_id: yup
      .object()
      .shape({
        value: yup.number(),
        label: yup.string(),
      })
      .notRequired(),
    net_capacity5: createCapacitySchema('net_capacity5', t),
    net_capacityMin20: createCapacitySchema('net_capacityMin20', t),
    net_capacityMin86: createCapacitySchema('net_capacityMin86', t),
  })
