import { TFunction } from 'i18next'
import * as yup from 'yup'

import { batchQtyFormSchema } from './use-cases/fill-batch-qty-form/batch-qty-form.schema'

export const disposalInstructionCreateFormSchema = (
  t: TFunction<['common', 'disposalInstructionCreate']>
) =>
  yup.object().shape({
    instruction_type: yup
      .object()
      .shape({
        label: yup.string(),
        value: yup.number(),
      })
      .required(t('common:validation.required')),
    disposal_items: yup.array().of(batchQtyFormSchema(t)),
  })
