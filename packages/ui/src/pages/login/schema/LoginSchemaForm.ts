// import { pattern } from '#constants/pattern'
import { pattern } from '#constants/pattern'
import { TFunction } from 'i18next'
import * as yup from 'yup'

export const loginFormSchema = (t:TFunction<'login'>) => yup.object().shape({
  username: yup.string().required(t('required')).matches(pattern.USERNAME, t('username.validation.invalid')),
  password: yup.string().required(t('required')),
})
