import { TFunction } from 'i18next'
import * as yup from 'yup'

import orderCreateCentralDistributionBatchSchema from './orderCreateCentralDistributionBatchSchema'

export default function orderCreateCentralDistributionStocksSchema(
  t: TFunction<'orderCentralDistribution'>
) {
  const batchSchema = orderCreateCentralDistributionBatchSchema(t)

  return yup.object().shape({
    pieces_per_unit: yup.number(),
    is_managed_in_batch: yup.number(),
    stocks: yup
      .array()
      .of(
        yup
          .object()
          .shape({
            ordered_qty: yup
              .number()
              .required(t('form.ordered_qty.validation.required'))
              .min(0, t('form.ordered_qty.validation.min'))
              .when('$pieces_per_unit', ([pieces_per_unit], schema) => {
                return pieces_per_unit
                  ? schema.test(
                      'multiple-of-pieces-per-unit',
                      t('form.ordered_qty.validation.pieces', {
                        value: pieces_per_unit,
                      }),
                      (qty: number) => qty % Number(pieces_per_unit) === 0
                    )
                  : schema
              }),

            total_price: yup
              .number()
              .required(t('form.ordered_qty.validation.required'))
              .min(0, t('form.ordered_qty.validation.min')),
          })
          .concat(batchSchema)
      )
      .min(1, t('form.batch.validation.required')),
  })
}
