import { TFunction } from 'i18next'
import * as yup from 'yup'

export const finishedVaccineSchema = (
  t: TFunction<['common', 'notification']>
) =>
  yup.object().shape({
    reason: yup
      .number()
      .required(t('notification:finishedVaccine.form.reason.error')),
  })
