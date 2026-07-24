import { pattern } from '#constants/pattern'
import { USER_ROLE } from '#constants/roles'
import { TFunction } from 'i18next'
import * as yup from 'yup'

const getPasswordSchema = (
  t: TFunction<['common', 'user']>,
  isEdit: boolean
) => {
  return yup.object().shape({
    password: yup
      .string()
      .when([], {
        is: () => !isEdit,
        then: (schema) =>
          schema.required(t('user:form.password.validation.required')),
        otherwise: (schema) => schema.nullable(),
      })
      .max(255, t('common:validation.char.max', { char: 255 }))
      .test(
        'password-requirements',
        t('user:form.password.validation.invalid'),
        function (value) {
          if (!value) return true
          if (value.length < 8) {
            return this.createError({
              message: t('common:validation.char.min', { char: 8 }),
            })
          }
          return pattern.PASSWORD.test(value)
        }
      ),
    password_confirmation: yup.string().when('password', (password, schema) => {
      if (!isEdit) {
        return schema
          .required(t('user:form.password_confirmation.validation.required'))
          .oneOf(
            [yup.ref('password')],
            t('user:form.password_confirmation.validation.match')
          )
      }
      return schema
        .nullable()
        .oneOf(
          [yup.ref('password')],
          t('user:form.password_confirmation.validation.match')
        )
    }),
  })
}

export default function userCreateSchema(
  t: TFunction<['common', 'user']>,
  isEdit = false
) {
  const passwordSchema = getPasswordSchema(t, isEdit)
  return yup
    .object()
    .shape({
      username: yup
        .string()
        .matches(pattern.USERNAME, t('user:form.username.validation.invalid'))
        .max(255, t('common:validation.char.max', { char: 255 }))
        .required(t('user:form.username.validation.required')),
      role: yup.object({
        value: yup.number().required(t('user:form.role.validation.required')),
      }),
      firstname: yup
        .string()
        .max(255, t('common:validation.char.max', { char: 255 }))
        .required(t('user:form.firstname.validation.required')),
      lastname: yup
        .string()
        .max(255, t('common:validation.char.max', { char: 255 })),
      gender: yup.string().required(t('user:form.gender.validation.required')),
      entity: yup.object().required(t('user:form.entity.validation.required')),
      email: yup
        .string()
        .email(t('user:form.email.validation.invalid'))
        .matches(pattern.EMAIL, t('user:form.email.validation.invalid'))
        .required(t('user:form.email.validation.required')),
      mobile_phone: yup
        .string()
        .test('phone-match', t('common:validation.numeric_only'), (phone) => {
          if (!phone) return true

          return pattern.NUMERIC_ONLY.test(phone)
        }),
      manufacturer: yup
        .object({
          value: yup.number(),
          label: yup.string(),
        })
        .nullable()
        .test(
          'required',
          t('user:form.manufacturer.validation.required'),
          (value, context) => {
            const { role } = context.parent
            if (role === USER_ROLE.MANUFACTURE) {
              return !!value
            }
            return true
          }
        ),
      daily_recap_email: yup.boolean().notRequired(),
    })
    .concat(passwordSchema)
}
