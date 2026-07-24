import { TFunction } from 'i18next'
import * as yup from 'yup'

import { isLessThanToday } from '../../order.helper'
import { TFormatBatch } from '../order-create-distribution.type'
import {
  generateBatchSchema,
  generateMaterialSchema,
} from './orderCreateDistributionBatchSchema'

export default function orderCreateDistributionSchema(
  t: TFunction<'orderDistribution'>
) {
  const batchSchema = yup.object().shape({
    material: generateMaterialSchema(),
    batch: generateBatchSchema(t)
      .min(1, t('form.batch.validation.required'))
      .test(
        'at-least-one-filled',
        t('form.batch.validation.empty'),
        validateBatchItems(t)
      ),
  })

  return yup.object().shape({
    vendor: yup.object().required(t('form.vendor.validation.required')),
    customer: yup.object().required(t('form.customer.validation.required')),
    activity: yup.object().required(t('form.activity.validation.required')),
    required_date: yup
      .string()
      .nullable()
      .test('is-valid-date', t('form.date.validation.invalid'), (value) => {
        if (!value) return true
        return !isLessThanToday(value)
      }),
    order_items: yup
      .array()
      .of(batchSchema)
      .min(1, t('form.order_items.validation.required')),
  })
}

function validateBatchItems(t: TFunction<'orderDistribution'>) {
  return (batch: TFormatBatch[], context: yup.TestContext) => {
    if (!batch) return false
    const isDisabledMaterialStatus =
      !context?.parent?.material?.is_temperature_sensitive

    const isValid = batch.some((item) =>
      isDisabledMaterialStatus
        ? item.ordered_qty
        : item.ordered_qty && item.order_stock_status
    )

    return isValid
  }
}
