import { TFunction } from 'i18next'
import * as yup from 'yup'

export const commentFormSchema = (
  t: TFunction<['disposalInstructionDetail']>
) => {
  return yup.object({
    comment: yup
      .string()
      .trim(
        t('disposalInstructionDetail:form.field.comment.validation.required')
      ),
  })
}
