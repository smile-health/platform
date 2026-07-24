import { yupResolver } from '@hookform/resolvers/yup'
import { TFunction } from 'i18next'
import * as yup from 'yup'

import { thousandFormatter } from '../utils/util'

export const detailDistributionDisposalCommentFormSchema = yupResolver(
  yup.object({
    comment: yup
      .string()
      .trim('common:validation.required')
      .required('common:validation.required'),
  })
)

export const detailDistributionDisposalReceiveFormSchema = yupResolver(
  yup.object({
    comment: yup.string().notRequired(),
    items: yup.array().of(
      yup.object().shape({
        id: yup.number().notRequired(),
        name: yup.string().notRequired(),
        shipped_qty: yup.number().notRequired(),
        received_qty: yup
          .number()
          .required('common:validation.required')
          .test(
            'its-not-same-with-shipped',
            'distributionDisposal:received.validation.not_same',
            (received_qty, { parent }) =>
              typeof received_qty === 'number' &&
              received_qty === parent.shipped_qty
          ),
      })
    ),
  })
)

export const detailDistributionDisposalReceiveDetailFormSchema = yupResolver(
  yup.object({
    stocks: yup.array().of(
      yup.object().shape({
        id: yup.number().notRequired(),
        name: yup.string().notRequired(),
        allocated_qty: yup.number().notRequired(),
        received_qty: yup
          .number()
          .required('common:validation.required')
          .test(
            'its-not-same-with-shipped',
            'distributionDisposal:receive.validation.not_same',
            (received_qty, { parent }) =>
              typeof received_qty === 'number' &&
              received_qty === parent.allocated_qty
          ),
      })
    ),
  })
)

export const v2DetailDistributionDisposalReceiveDetailFormSchema = (
  t: TFunction<['common', 'distributionDisposal']>,
  locale: string
) =>
  yup.object({
    stock_members: yup.array().of(
      yup.object().shape({
        received_qty: yup
          .number()
          .nullable()
          .test({
            name: 'cannot-more-than-qty',
            test: function (value) {
              if (!value && value !== 0) return true
              const { parent } = this
              const totalShipped =
                parent?.accumulated_reasons?.reduce(
                  (acc: { qty: number }, item: { qty?: number }) => ({
                    qty: Number(acc.qty ?? 0) + Number(item.qty ?? 0),
                  }),
                  { qty: 0 }
                ).qty ?? 0
              if (Number(value) !== totalShipped)
                return this.createError({
                  message: t(
                    'distributionDisposal:form.validation.qty.has_to_be_equal',
                    {
                      amount: thousandFormatter({
                        value: totalShipped,
                        locale,
                      }),
                    }
                  ),
                })
              return true
            },
          }),
      })
    ),
  })

export const createDistributionDisposalFormSchema = yupResolver(
  yup.object({
    activity: yup
      .object({
        value: yup.number(),
        label: yup.string(),
      })
      .required('common:validation.required'),
    customer: yup
      .object({
        value: yup.number(),
        label: yup.string(),
        code: yup.string(),
      })
      .required('common:validation.required'),
    vendor: yup
      .object({
        value: yup.number(),
        label: yup.string(),
        code: yup.string(),
      })
      .required('common:validation.required'),
    order_items: yup.array().of(
      yup.object({
        id: yup.number().notRequired(),
        activity_name: yup.string().notRequired(),
        material_name: yup.string().notRequired(),
        ordered_qty: yup.number().notRequired(),
        is_valid: yup
          .boolean()
          .oneOf([true], 'common:validation.required')
          .required('common:validation.required'),
      })
    ),
  })
)

export const createDistributionDisposalDetailFormSchema = (
  t: TFunction<['common', 'distributionDisposal']>
) =>
  yupResolver(
    yup.object({
      stocks: yup
        .array()
        .of(
          yup.object({
            activity_id: yup.number().notRequired(),
            activity_name: yup.string().notRequired(),
            batch: yup
              .object({
                id: yup.number().notRequired(),
                code: yup.string().notRequired(),
                expired_date: yup.string().notRequired(),
                production_date: yup.string().notRequired(),
              })
              .notRequired(),
            stock_id: yup.number().notRequired(),
            stock_qty: yup.number().notRequired(),
            extermination_discard_qty: yup.number().notRequired(),
            extermination_received_qty: yup.number().notRequired(),
            stock_exterminations: yup.array().of(
              yup.object({
                pieces_per_unit: yup.number().notRequired(),
                discard_qty: yup
                  .number()
                  .nullable()
                  .typeError(t('common:validation.required'))
                  .when(
                    'extermination_discard_qty',
                    ([extermination_discard_qty], schema, { value }) => {
                      if (
                        typeof value === 'number' &&
                        value >= 0 &&
                        typeof extermination_discard_qty === 'number'
                      )
                        return schema
                          .max(
                            extermination_discard_qty,
                            t('distributionDisposal:form.validation.qty.max')
                          )
                          .required(t('common:validation.required'))
                      return schema.notRequired()
                    }
                  )
                  .when(['pieces_per_unit'], ([pieces_per_unit], schema) => {
                    return schema.test(
                      'discard-qty-unit',
                      t('distributionDisposal:form.validation.qty.unit', {
                        amount: pieces_per_unit,
                      }),
                      (qty) => !qty || (qty > 0 && qty % pieces_per_unit === 0)
                    )
                  }),
                received_qty: yup
                  .number()
                  .nullable()
                  .typeError(t('common:validation.required'))
                  .when(
                    'extermination_received_qty',
                    ([extermination_received_qty], schema, { value }) => {
                      if (
                        typeof value === 'number' &&
                        value >= 0 &&
                        typeof extermination_received_qty === 'number'
                      )
                        return schema
                          .max(
                            extermination_received_qty,
                            t('distributionDisposal:form.validation.qty.max')
                          )
                          .required(t('common:validation.required'))
                      return schema.notRequired()
                    }
                  )
                  .when(['pieces_per_unit'], ([pieces_per_unit], schema) => {
                    return schema.test(
                      'received-qty-unit',
                      t('distributionDisposal:form.validation.qty.unit', {
                        amount: pieces_per_unit,
                      }),
                      (qty) => !qty || (qty > 0 && qty % pieces_per_unit === 0)
                    )
                  }),
                extermination_discard_qty: yup.number().notRequired(),
                extermination_received_qty: yup.number().notRequired(),
                stock_extermination_id: yup.number().notRequired(),
                transaction_reason_title: yup.string().notRequired(),
              })
            ),
          })
        )
        .test('at-least-one-qty', 'common:validation.required', (stocks) => {
          if (!stocks) return false
          return stocks.some((x) =>
            x.stock_exterminations?.some(
              (y) =>
                (y.discard_qty !== null && y.discard_qty !== undefined) ||
                (y.received_qty !== null && y.received_qty !== undefined)
            )
          )
        }),
    })
  )

export const createDistributionDisposalConfirmationFormSchema = yupResolver(
  yup.object({
    no_document: yup.string().required('common:validation.required'),
    comment: yup.string().notRequired(),
  })
)
