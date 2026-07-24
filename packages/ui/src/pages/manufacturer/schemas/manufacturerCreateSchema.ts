import { pattern } from '#constants/pattern'
import { TFunction } from 'i18next'
import * as yup from 'yup'

export default function manufacturerCreateSchema(
  t: TFunction<['common', 'manufacturer']>
) {
  return yup.object().shape({
    name: yup
      .string()
      .required(t('manufacturer:form.name.validation.required')),
    type: yup
      .number()
      .required(t('manufacturer:form.type.validation.required'))
      .typeError(t('manufacturer:form.type.validation.required')),
    description: yup.string().optional(),
    phone_number: yup
      .string()
      .test(
        'manufacturer-match',
        t('manufacturer:form.phone.validation.match'),
        (phone) => {
          if (!phone) return true

          return pattern.NUMERIC_ONLY.test(phone)
        }
      ),
    email: yup.string().email(t('manufacturer:form.email.validation.invalid')),
    contact_name: yup.string().optional(),
    address: yup.string().optional(),
    workspace_ids: yup.array().of(yup.number()),
  })
}
