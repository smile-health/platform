import * as yup from 'yup'

export const filterSchema = yup.object({
  keyword: yup.string().notRequired(),
})
