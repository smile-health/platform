import { TFunction } from 'i18next'
import * as yup from 'yup'

import { FORM_VALIDATION_TYPE } from './batch-qty-form.constants'
import { BatchQtyFormValues } from './batch-qty-form.type'

export const batchQtyFormSchema = (
  t: TFunction<['common', 'disposalInstructionCreate']>
) =>
  yup.object<BatchQtyFormValues>().shape({
    stocks: yup
      .array()
      .of(
        yup.object().shape({
          disposal_stocks: yup.array().of(
            yup.object().shape({
              consumption_unit_per_distribution_unit: yup
                .number()
                .notRequired(),
              disposal_discard_qty: yup.number().notRequired(),
              discard_qty: yup
                .number()
                .nullable()
                .required()
                .when(
                  'disposal_discard_qty',
                  ([disposal_discard_qty], schema, { value }) => {
                    if (
                      typeof value === 'number' &&
                      value >= 0 &&
                      typeof disposal_discard_qty === 'number'
                    )
                      return schema
                        .max(
                          disposal_discard_qty,
                          t(
                            'disposalInstructionCreate:field.discard_qty.validation.max_qty'
                          )
                        )
                        .required(t('common:validation.required'))
                    return schema.notRequired()
                  }
                )
                .when(
                  ['consumption_unit_per_distribution_unit'],
                  ([consumption_unit_per_distribution_unit], schema) => {
                    return schema.test(
                      'discard-qty-unit',
                      t('disposalInstructionCreate:form.validation.qty_unit', {
                        amount: consumption_unit_per_distribution_unit,
                      }),
                      (qty) => {
                        return (
                          !qty ||
                          (qty > 0 &&
                            qty % consumption_unit_per_distribution_unit === 0)
                        )
                      }
                    )
                  }
                ),
              received_qty: yup
                .number()
                .nullable()
                .typeError(t('common:validation.required'))
                .when(
                  'disposal_received_qty',
                  ([disposal_received_qty], schema, { value }) => {
                    if (
                      typeof value === 'number' &&
                      value >= 0 &&
                      typeof disposal_received_qty === 'number'
                    )
                      return schema
                        .max(
                          disposal_received_qty,
                          t(
                            'disposalInstructionCreate:field.received_qty.validation.max_qty'
                          )
                        )
                        .required(t('common:validation.required'))
                    return schema.notRequired()
                  }
                )
                .when(
                  ['consumption_unit_per_distribution_unit'],
                  ([consumption_unit_per_distribution_unit], schema) => {
                    return schema.test(
                      'received-qty-unit',
                      t('disposalInstructionCreate:form.validation.qty_unit', {
                        amount: consumption_unit_per_distribution_unit,
                      }),
                      (qty) =>
                        !qty ||
                        (qty > 0 &&
                          qty % consumption_unit_per_distribution_unit === 0)
                    )
                  }
                ),
            })
          ),
        })
      )
      .test(
        FORM_VALIDATION_TYPE.at_least_one_qty,
        t('common:validation.required'),
        (stocks) => {
          if (!stocks) return false
          return stocks.some((stock) =>
            stock.disposal_stocks?.some(
              (disposalStock) =>
                (disposalStock.discard_qty !== null &&
                  disposalStock.discard_qty !== undefined) ||
                (disposalStock.received_qty !== null &&
                  disposalStock.received_qty !== undefined)
            )
          )
        }
      ),
  })
