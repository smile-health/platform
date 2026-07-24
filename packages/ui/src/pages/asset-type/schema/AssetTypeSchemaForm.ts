import { TFunction } from 'i18next'
import * as yup from 'yup'

export const formSchema = (t: TFunction<['common', 'assetType']>) =>
  yup.object({
    name: yup
      .string()
      .required(t('validation.required'))
      .max(255, t('common:validation.char.max', { char: 255 })),
    description: yup
      .string()
      .notRequired()
      .max(255, t('common:validation.char.max', { char: 255 })),
    temperature_thresholds: yup
      .array()
      .of(yup.object({ id: yup.number() }))
      .test({
        name: 'is-valid-temperatures',
        message: t('validation.required'),
        test: function (value: any) {
          const { is_cce } = this?.parent
          if (!is_cce) {
            return true
          }
          if (is_cce && !value?.length) {
            return false
          }
          return value.every((item: any) => item.id !== undefined)
        },
      }),
  })
