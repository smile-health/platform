import { TFunction } from 'i18next'
import * as yup from 'yup'

export const formSchema = (t: TFunction<['common', 'assetVendor']>) =>
  yup.object({
    name: yup
      .string()
      .required(t('validation.required'))
      .max(255, t('common:validation.char.max', { char: 255 })),
    asset_vendor_type_id: yup
      .object({
        value: yup.number(),
        label: yup.string(),
      })
      .nullable()
      .required(t('validation.required')),
    description: yup
      .string()
      .notRequired()
      .max(255, t('common:validation.char.max', { char: 255 })),
  })
