import { TFunction } from 'i18next'
import * as yup from 'yup'

const validateValue = (value: number) => {
  if (
    value === null ||
    value === undefined ||
    value === '' ||
    value === 0 ||
    Number.isNaN(value)
  ) {
    return false
  }
  return Number(value) >= 0
}

export const formSchema = (t: TFunction<['common', 'materialVolume']>) =>
  yup.object({
    material_id: yup
      .object()
      .shape({
        value: yup.number(),
        label: yup.string(),
      })
      .required(t('validation.required')),
    manufacture_id: yup
      .object()
      .shape({
        value: yup.number(),
        label: yup.string(),
      })
      .required(t('validation.required')),
    box_length: yup
      .mixed()
      .transform((_, orig) => {
        return isNaN(Number(orig)) ? null : Number(orig)
      })
      .nullable()
      .test('box_length', t('validation.required'), validateValue),
    box_width: yup
      .mixed()
      .transform((_, orig) => {
        return isNaN(Number(orig)) ? null : Number(orig)
      })
      .nullable()
      .test('box_width', t('validation.required'), validateValue),
    box_height: yup
      .mixed()
      .transform((_, orig) => {
        return isNaN(Number(orig)) ? null : Number(orig)
      })
      .nullable()
      .test('box_height', t('validation.required'), validateValue),
    unit_per_box: yup.number().nullable().required(t('validation.required')),
    consumption_unit_per_distribution_unit: yup
      .number()
      .nullable()
      .notRequired(),
  })
