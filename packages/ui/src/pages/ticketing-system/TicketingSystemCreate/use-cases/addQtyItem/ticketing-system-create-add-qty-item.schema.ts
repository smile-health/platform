import { TFunction } from 'i18next'
import * as Yup from 'yup'

import { TicketingSystemCreateSelectedMaterialQtyItem } from '../../ticketing-system-create.type'

const ticketingSystemCreateAddQtyItemSchema = (
  t: TFunction<['ticketingSystemCreate']>
) => {
  return Yup.object({
    material: Yup.object({
      id: Yup.number().required(t('common:validation.required')),
      name: Yup.string().required(t('common:validation.required')),
      is_batch: Yup.boolean().required(t('common:validation.required')),
    }).nullable(),

    custom_material: Yup.object({
      name: Yup.string()
        .nullable()
        .test({
          name: 'required_when_material_not_exists',
          message: t('common:validation.required'),
          test(value, context) {
            const parent = context?.from?.[1].value
            const isCustomMaterial = !parent.material
            if (isCustomMaterial && !value) {
              return false
            }
            return true
          },
        }),
      is_batch: Yup.boolean().nullable(),
    }).nullable(),

    items: Yup.array<TicketingSystemCreateSelectedMaterialQtyItem>(
      Yup.object({
        batch_code: Yup.string()
          .nullable()
          .test({
            name: 'required_when_managed_in_batch',
            message: t('common:validation.required'),
            test(value, context) {
              const parent = context?.from?.[1].value
              const isBatch = Boolean(parent.material)
                ? parent.material.is_batch
                : parent.custom_material?.is_batch

              if (isBatch && !value) {
                return false
              }
              return true
            },
          }),
        expired_date: Yup.string().required(t('common:validation.required')),
        production_date: Yup.string().nullable(),
        qty: Yup.number().required(t('common:validation.required')),
        reason: Yup.mixed()
          .nullable()
          .required(t('common:validation.required')),
        child_reason: Yup.mixed().required(t('common:validation.required')),
      })
    ).min(1, t('common:validation.required')),
  })
}

export default ticketingSystemCreateAddQtyItemSchema
