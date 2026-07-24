import * as Yup from 'yup'

export const BMHPMaterialValidationSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  description: Yup.string().required('Description is required'),

  is_reagent: Yup.boolean().required('Is Reagent is required'),
  is_active: Yup.boolean().required('Is Active is required'),
})
