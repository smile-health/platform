import * as yup from 'yup'

export const schema = yup.object().shape({
  phone_number: yup.string().notRequired(),
  email: yup
    .string()
    .required()
    .matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/),
})
