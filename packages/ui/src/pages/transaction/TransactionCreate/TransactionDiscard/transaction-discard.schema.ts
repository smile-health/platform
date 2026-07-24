import { BOOLEAN } from '#constants/common'
import { TFunction } from 'i18next'
import * as yup from 'yup'

export const formDiscardSchema = (
  t: TFunction<['transactionCreate', 'common']>
) =>
  yup.object({
    details: yup
      .array()
      .of(
        yup.object().shape({
          transaction_reason: yup
            .object({ value: yup.number(), label: yup.string() })
            .when(
              ['qty', 'open_vial', 'close_vial'],
              ([qty, open_vial, close_vial], schema) => {
                if (qty > 0 || open_vial > 0 || close_vial > 0)
                  return schema.required(t('common:validation.required'))
                return schema.notRequired()
              }
            ),
          consumption_unit_per_distribution_unit: yup.number().notRequired(),
          is_open_vial: yup.number().notRequired(),
          transaction_type_id: yup
            .number()
            .required(t('common:validation.required')),
          other_reason: yup.string().notRequired(),
          material_id: yup.number().required(t('common:validation.required')),
          stock_id: yup.number().required(t('common:validation.required')),
          is_temperature_sensitive: yup
            .number()
            .required(t('common:validation.required')),
          on_hand: yup.number().nullable().notRequired(),
          available_qty: yup.number().nullable().notRequired(),
          open_vial_qty: yup.number().notRequired(),
          stock_quality: yup
            .object({ value: yup.number(), label: yup.string() })
            .when(
              ['is_temperature_sensitive', 'qty'],
              ([is_temperature_sensitive, qty], schema) => {
                if (is_temperature_sensitive === 1 && qty > 0)
                  return schema.required(t('common:validation.required'))
                return schema.notRequired()
              }
            ),
          qty: yup
            .number()
            .nullable()
            .typeError(t('common:validation.required'))
            .when(
              ['consumption_unit_per_distribution_unit', 'on_hand'],
              ([consumption_unit_per_distribution_unit, on_hand], schema) => {
                return schema
                  .test(
                    'qty-unit',
                    t(
                      'transactionCreate:transaction_discard.form.validation.qty.unit',
                      { amount: consumption_unit_per_distribution_unit }
                    ),
                    (qty) =>
                      !qty ||
                      (qty > 0 &&
                        qty % consumption_unit_per_distribution_unit === 0)
                  )
                  .test(
                    'qty-cannot-more-than',
                    t(
                      'transactionCreate:transaction_discard.form.validation.qty_cannot_more_than',
                      { value: on_hand }
                    ),
                    (value, context) => {
                      const { on_hand } = context.parent
                      if (Number(value) > 0) {
                        return Number(value) <= Number(on_hand)
                      }
                      return true
                    }
                  )
                  .when(
                    'available_qty',
                    ([available_qty], schema, { value }) => {
                      if (
                        typeof value === 'number' &&
                        value >= 0 &&
                        available_qty
                      )
                        return schema
                          .min(
                            1,
                            t(
                              'transactionCreate:transaction_discard.form.validation.qty.amount'
                            )
                          )
                          .max(
                            available_qty,
                            t(
                              'transactionCreate:transaction_discard.form.validation.qty.max'
                            )
                          )
                          .required(t('common:validation.required'))
                      return schema.notRequired()
                    }
                  )
              }
            ),
          open_vial: yup
            .number()
            .nullable()
            .when(
              ['open_vial_qty', 'is_open_vial'],
              ([open_vial_qty, is_open_vial], schema) => {
                if (Number(is_open_vial) === BOOLEAN.FALSE || !open_vial_qty)
                  return schema.notRequired()

                return schema.test(
                  'qty-open-vial',
                  t(
                    'transactionCreate:transaction_discard.form.validation.open_vial'
                  ),
                  (open_vial) =>
                    !open_vial || (open_vial_qty && open_vial === open_vial_qty)
                )
              }
            ),
          close_vial: yup
            .number()
            .nullable()
            .when(
              [
                'consumption_unit_per_distribution_unit',
                'available_qty',
                'on_hand',
              ],
              (
                [
                  consumption_unit_per_distribution_unit,
                  available_qty,
                  on_hand,
                ],
                schema
              ) => {
                return schema
                  .test(
                    'qty-close-vial',
                    t(
                      'transactionCreate:transaction_discard.form.validation.close_vial',
                      { value: consumption_unit_per_distribution_unit }
                    ),
                    (close_vial) => {
                      if (
                        typeof close_vial === 'number' &&
                        Number(close_vial) > 0 &&
                        Number(close_vial) %
                          Number(consumption_unit_per_distribution_unit) ===
                          0
                      ) {
                        if (
                          on_hand !== undefined &&
                          on_hand !== null &&
                          on_hand !== ''
                        ) {
                          return true
                        }
                        if (
                          available_qty !== undefined &&
                          available_qty !== null &&
                          available_qty !== ''
                        ) {
                          return (
                            Number(close_vial) <
                            Number(available_qty) -
                              Number(consumption_unit_per_distribution_unit)
                          )
                        }

                        return !close_vial
                      }
                      return !close_vial
                    }
                  )
                  .test(
                    'cannot-more-than',
                    t(
                      'transactionCreate:transaction_discard.form.validation.close_vial_cannot_more_than',
                      { value: on_hand }
                    ),
                    (value, context) => {
                      const { on_hand } = context.parent
                      if (Number(value) > 0) {
                        return Number(value) <= Number(on_hand)
                      }
                      return true
                    }
                  )
              }
            ),
        })
      )
      .test('at-least-one-qty', 'common:validation.required', (details) => {
        if (!details) return false
        return details.some((stock) => {
          if (Number(stock.is_open_vial) === BOOLEAN.TRUE) {
            return (
              (stock.open_vial !== null &&
                stock.open_vial !== undefined &&
                stock.open_vial > 0) ||
              (stock.close_vial !== null &&
                stock.close_vial !== undefined &&
                stock.close_vial > 0)
            )
          }
          return stock.qty !== null && stock.qty !== undefined && stock.qty > 0
        })
      }),
  })
