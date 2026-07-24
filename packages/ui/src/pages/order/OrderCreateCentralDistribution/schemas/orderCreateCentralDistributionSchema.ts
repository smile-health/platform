import { TFunction } from 'i18next'
import * as yup from 'yup'

import { isLessThanToday } from '../../order.helper'
import orderCreateCentralDistributionStocksSchema from './orderCreateCentralDistributionStocksSchema'

export default function orderCreateCentralDistributionSchema(
  t: TFunction<'orderCentralDistribution'>
) {
  const stocksSchema = orderCreateCentralDistributionStocksSchema(t)

  return yup.object().shape({
    vendor: yup.object().required(t('form.vendor.validation.required')),
    customer: yup.object().required(t('form.customer.validation.required')),
    activity: yup.object().required(t('form.activity.validation.required')),
    delivery_type_id: yup
      .number()
      .required(t('form.delivery.validation.required')),
    required_date: yup
      .string()
      .nullable()
      .test(
        'is-valid-date',
        t('form.date.required.validation.invalid'),
        (value) => {
          if (!value) return true
          return !isLessThanToday(value)
        }
      ),
    do_number: yup.string().required(t('form.do.validation.required')),
    po_number: yup.object().notRequired(),
    order_items: yup
      .array()
      .of(stocksSchema)
      .min(1, t('form.order_items.validation.required')),
  })
}
