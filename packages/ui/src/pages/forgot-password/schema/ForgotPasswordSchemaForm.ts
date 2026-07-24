import * as yup from 'yup'

export const forgotPasswordFormSchema = yup.object().shape({
  username: yup.string().required('Field Required'),
})