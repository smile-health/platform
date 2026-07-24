import { TFunction } from 'i18next'
import * as yup from 'yup'

export const confirmationFormSchema = (t: TFunction<['common']>) =>
  yup.object({
    bast_no: yup.string().required(t('common:validation.required')),
    disposal_comments: yup.string().notRequired(),
  })
