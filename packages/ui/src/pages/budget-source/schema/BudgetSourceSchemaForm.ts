import { TFunction } from 'i18next'
import * as yup from 'yup'

export const formSchema = (t: TFunction<['common', 'budgetSource']>) =>
  yup.object({
    name: yup.string().required(t('validation.required')).max(255, t('common:validation.char.max', { char: 255 })),
    description: yup.string().notRequired().max(255, t('common:validation.char.max', { char: 255 })),
  })
