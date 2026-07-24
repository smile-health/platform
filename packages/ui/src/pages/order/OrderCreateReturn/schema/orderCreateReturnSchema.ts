import { TFunction } from 'i18next'
import * as yup from 'yup'

const stockItemSchema = (t: TFunction<['common', 'orderCreateReturn']>) =>
  yup.object({
    batch_is_temperature_sensitive: yup.number().nullable(),
    batch_ordered_qty: yup
      .number()
      .nullable()
      .test(
        'must-less-than-qty',
        t('orderCreateReturn:drawer.table.column.quantity.validation.max'),
        function (value) {
          if (!value) return true
          const { batch_available_qty } = this.parent
          return Number(value) <= Number(batch_available_qty)
        }
      )
      .test({
        name: 'must-multiply-of',
        test: function (value) {
          const { batch_consumption_unit_per_distribution_unit } = this.parent
          if (!value || !batch_consumption_unit_per_distribution_unit)
            return true
          return Number(value) %
            Number(batch_consumption_unit_per_distribution_unit) ===
            0
            ? true
            : this.createError({
                message: t(
                  'orderCreateReturn:drawer.table.column.quantity.validation.multiply',
                  { value: batch_consumption_unit_per_distribution_unit }
                ),
              })
        },
      }),
    batch_order_stock_status_id: yup
      .object({
        label: yup.string().required(),
        value: yup.number().required(),
      })
      .nullable()
      .when(['batch_is_temperature_sensitive', 'batch_ordered_qty'], {
        is: (tempSensitive: number | null, orderedQty: number | null) =>
          tempSensitive === 1 && orderedQty != null,
        then: (schema) => schema.required(t('common:validation.required')),
        otherwise: (schema) => schema.nullable(),
      }),
  })

export const formSchema = (t: TFunction<['common', 'orderCreateReturn']>) =>
  yup.object({
    customer_id: yup
      .object({ value: yup.number(), label: yup.string() })
      .required(t('common:validation.required')),
    activity_id: yup
      .object({ value: yup.number(), label: yup.string() })
      .required(t('common:validation.required')),
    vendor_id: yup
      .object({ value: yup.number(), label: yup.string() })
      .required(t('common:validation.required')),
    required_date: yup.string().nullable().notRequired(),
    order_comment: yup.string().nullable().notRequired(),
    order_items: yup
      .array()
      .of(
        yup.object({
          material_stocks: yup
            .object({
              valid: yup.array().of(stockItemSchema(t)),
              expired: yup.array().of(stockItemSchema(t)),
            })
            .required(t('common:validation.required'))
            .test(
              'at-least-one-item',
              t('common:validation.required'),
              function (value) {
                const { valid, expired } = value || {}
                const hasValidItems = (valid?.length || 0) > 0
                const hasExpiredItems = (expired?.length || 0) > 0
                return hasValidItems || hasExpiredItems
              }
            )
            .test(
              'at-least-one-valid-entry',
              t('common:validation.required'),
              function (value) {
                const { valid, expired } = value || {}

                const hasValidEntry = valid?.some((stock) => {
                  const hasQty = stock.batch_ordered_qty != null
                  const isTempSensitive =
                    stock.batch_is_temperature_sensitive === 1
                  const hasStatus = stock.batch_order_stock_status_id != null
                  return (
                    hasQty &&
                    (!isTempSensitive || (isTempSensitive && hasStatus))
                  )
                })

                const hasExpiredEntry = expired?.some((stock) => {
                  const hasQty = stock.batch_ordered_qty != null
                  const isTempSensitive =
                    stock.batch_is_temperature_sensitive === 1
                  const hasStatus = stock.batch_order_stock_status_id != null
                  return (
                    hasQty &&
                    (!isTempSensitive || (isTempSensitive && hasStatus))
                  )
                })

                return hasValidEntry || hasExpiredEntry
              }
            ),
        })
      )
      .min(1, t('common:validation.required'))
      .required(t('common:validation.required')),
  })

export const formSchemaStocks = (
  t: TFunction<['common', 'orderCreateReturn']>
) =>
  yup.object({
    material_stocks: yup
      .object({
        valid: yup.array().of(stockItemSchema(t)),
        expired: yup.array().of(stockItemSchema(t)),
      })
      .required(t('common:validation.required'))
      .test(
        'at-least-one-item',
        t('common:validation.required'),
        function (value) {
          const { valid, expired } = value || {}

          const hasValidItems = (valid?.length || 0) > 0
          const hasExpiredItems = (expired?.length || 0) > 0
          return hasValidItems || hasExpiredItems
        }
      )
      .test(
        'at-least-one-change-qty',
        t('common:validation.required'),
        function (value) {
          const { valid, expired } = value || {}
          const hasValidQty = valid?.some(
            (stock) =>
              stock.batch_ordered_qty !== null &&
              stock.batch_ordered_qty !== undefined
          )
          const hasExpiredQty = expired?.some(
            (stock) =>
              stock.batch_ordered_qty !== null &&
              stock.batch_ordered_qty !== undefined
          )
          return hasValidQty || hasExpiredQty
        }
      ),
  })

export type TOrderReturnCreateFormData = yup.InferType<
  ReturnType<typeof formSchema>
>
export type TOrderReturnCreateFormDataStocks = yup.InferType<
  ReturnType<typeof formSchemaStocks>
>
