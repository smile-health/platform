import * as yup from 'yup'

export const formSchema = yup.object({
  id: yup.number().notRequired(),
  key: yup.string().required('common:validation.required'),
  name: yup.string().required('common:validation.required'),
  description: yup.string().notRequired(),
  color: yup.string().required('common:validation.required'),
  protocols: yup.array(yup.number()),
  is_hierarchy_enabled: yup.number().required('common:validation.required'),
})
