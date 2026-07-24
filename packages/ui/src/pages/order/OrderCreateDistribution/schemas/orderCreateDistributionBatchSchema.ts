import { fromDate } from '@internationalized/date'
import { TFunction } from 'i18next'
import * as yup from 'yup'

import { TFormatBatch } from '../order-create-distribution.type'

type SeparateForm = {
  material: yup.InferType<ReturnType<typeof generateMaterialSchema>>
  validBatch: TFormatBatch[]
  expiredBatch: TFormatBatch[]
}

export function generateMaterialSchema() {
  return yup.object().shape({
    id: yup.number(),
    name: yup.string(),
    is_managed_in_batch: yup.number(),
    is_temperature_sensitive: yup.number(),
  })
}

export function generateBatchSchema(t: TFunction<'orderDistribution'>) {
  return yup.array().of(
    yup.object().shape({
      pieces_per_unit: yup.number(),
      qty: yup.number(),
      available_qty: yup.number(),
      ordered_qty: yup
        .number()
        .nullable()
        .min(0, t('form.ordered_qty.validation.min'))
        .test(
          'validate-ordered-qty',
          t('form.ordered_qty.validation.required'),
          function (value) {
            return validateQuantityValue(this, value, t)
          }
        ),
      order_stock_status: yup
        .object({
          label: yup.string().required(),
          value: yup.number().required(),
        })
        .nullable()
        .test(
          'validate-order-stock-status',
          t('form.order_stock_status.validation.required'),
          function (value) {
            const { from, parent } = this
            const isTemperatureSensitive =
              from?.[2]?.value?.material?.is_temperature_sensitive
            const orderedQty = parent?.ordered_qty

            if (
              isTemperatureSensitive &&
              orderedQty !== null &&
              value === null
            ) {
              return false
            } else {
              return true
            }
          }
        ),
    })
  )
}

export default function orderCreateDistributionBatchSchema(
  t: TFunction<'orderDistribution'>
): yup.ObjectSchema<any> {
  return yup
    .object()
    .shape({
      material: generateMaterialSchema(),
      validBatch: generateBatchSchema(t).default([]),
      expiredBatch: generateBatchSchema(t).default([]),
    })
    .test(
      'at-least-one-filled',
      t('form.batch.validation.empty'),
      (value: SeparateForm, context) => validateBatchItems(t, value, context)
    )
}

/**
 * Validates batch items for ordered_qty and order_stock_status
 */

export function validateBatchItems(
  t: TFunction<'orderDistribution'>,
  value: SeparateForm,
  context: yup.TestContext
) {
  const batch = [...value.validBatch, ...value.expiredBatch]

  if (!batch?.length) return false
  const isDisabledMaterialStatus =
    !context?.parent?.material?.is_temperature_sensitive

  const isValid = batch.some((item) =>
    isDisabledMaterialStatus
      ? item.ordered_qty
      : item.ordered_qty && item.order_stock_status
  )

  return isValid
    ? true
    : createBatchValidationErrors(batch, context, t, isDisabledMaterialStatus)
}

/**
 * Generates validation errors for batch items
 */
function createBatchValidationErrors(
  batch: TFormatBatch[],
  context: yup.TestContext,
  t: TFunction<'orderDistribution'>,
  isDisabledMaterialStatus: boolean
) {
  const errors: yup.ValidationError[] = []

  batch.forEach((item, index) => {
    if (!item?.ordered_qty) {
      errors.push(
        new yup.ValidationError(
          t('form.ordered_qty.validation.required'),
          item?.ordered_qty,
          `${context?.path}[${index}].ordered_qty`
        )
      )
    }

    if (!isDisabledMaterialStatus && !item?.order_stock_status) {
      errors.push(
        new yup.ValidationError(
          t('form.order_stock_status.validation.required'),
          item?.order_stock_status,
          `${context?.path}[${index}].order_stock_status`
        )
      )
    }
  })

  return new yup.ValidationError(errors)
}

/**
 * Validates order quantity value
 */
function validateQuantityValue(
  context: yup.TestContext,
  value: undefined | number | null,
  t: TFunction<'orderDistribution'>
): boolean | yup.ValidationError {
  const available_qty = Number(context?.parent?.available_qty)
  const pieces_per_unit = Number(context?.parent?.pieces_per_unit)

  if (value && value > available_qty) {
    return context.createError({
      message: t('form.ordered_qty.validation.max'),
    })
  }

  if (value && value % pieces_per_unit !== 0) {
    return context.createError({
      message: t('form.ordered_qty.validation.multiple', {
        value: pieces_per_unit,
      }),
    })
  }

  return true
}
