import { TFunction } from 'i18next'
import * as Yup from 'yup'

import { TicketingSystemCreateFormValues } from './ticketing-system-create.type'
import ticketingSystemCreateAddQtyItemSchema from './use-cases/addQtyItem/ticketing-system-create-add-qty-item.schema'

const ticketingSystemCreateSchema = (t: TFunction<['ticketingSystemCreate']>) =>
  Yup.object<TicketingSystemCreateFormValues>({
    entity: Yup.object().nullable().required(t('validation.entityRequired')),

    has_order: Yup.number().nullable(),

    order_id: Yup.object()
      .nullable()
      .test({
        name: 'order_id_required',
        message: t('common:validation.required'),
        test: function (value, context) {
          const has_order = context?.parent?.has_order
          return has_order ? Boolean(value) : true
        },
      }),

    do_number: Yup.string()
      .nullable()
      .trim()
      .test({
        name: 'do_number_required',
        message: t('common:validation.required'),
        test: function (value, context) {
          const has_order = context?.parent?.has_order
          return !has_order ? Boolean(value) : true
        },
      }),

    arrived_date: Yup.string()
      .nullable()
      .required(t('common:validation.required')),

    selected_materials: Yup.array(ticketingSystemCreateAddQtyItemSchema(t)).min(
      1,
      t('common:validation.required')
    ),

    accept_terms: Yup.boolean().test({
      name: 'accept_terms_required',
      message: t('common:validation.required'),
      test: function (value, context) {
        const has_order = context?.parent?.has_order
        return has_order ? Boolean(value) : true
      },
    }),
  })

export default ticketingSystemCreateSchema
