import { TFunction } from 'i18next'
import * as yup from 'yup'

export const formSchema = (t: TFunction<['common', 'orderCreate']>) =>
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
    required_date: yup.string().nullable(),
    order_comment: yup.string().nullable().notRequired(),
    order_items: yup
      .array()
      .of(
        yup.object().shape({
          label: yup.string().notRequired(),
          value: yup
            .object()
            .shape({
              material_id: yup.number().notRequired(),
              max: yup.number().notRequired(),
              min: yup.number().notRequired(),
              ordered_qty: yup
                .mixed()
                .nullable()
                .test(
                  'is-valid',
                  t('common:validation.required'),
                  (value) => value !== '' && !isNaN(value as number)
                )
                .test(
                  'is-minimum',
                  t('orderCreate:list.selected.column.quantity.error.zero'),
                  (value: number) => {
                    const numericValue =
                      typeof value === 'string' ? Number(value) : value
                    return numericValue >= 1
                  }
                )
                .test({
                  name: 'must-multiply-of',
                  test: function (value) {
                    const { parent } = this
                    if (
                      !value ||
                      !parent?.consumption_unit_per_distribution_unit
                    )
                      return true
                    return Number(value) %
                      Number(parent?.consumption_unit_per_distribution_unit) ===
                      0
                      ? true
                      : this.createError({
                          message: t(
                            'orderCreate:list.selected.column.quantity.error.multiply',
                            {
                              value:
                                parent?.consumption_unit_per_distribution_unit,
                            }
                          ),
                        })
                  },
                }),
              order_reason_id: yup
                .object({
                  label: yup.string().required(),
                  value: yup.number().required(),
                })
                .nullable()
                .test({
                  name: 'order-reason-required',
                  message: t('common:validation.required'),
                  test: function (value) {
                    const { parent } = this

                    if (parent.recommended_stock === 0) {
                      return !!value
                    }

                    if (
                      parent.recommended_stock > 0 &&
                      parent.recommended_stock !== parent.ordered_qty
                    ) {
                      return !!value
                    }

                    return true
                  },
                }),
              other_reason: yup
                .string()
                .when('order_reason_id', (order_reason_id, schema) => {
                  return Number(order_reason_id?.[0]?.value) === 9
                    ? schema.required(t('common:validation.required'))
                    : schema.notRequired()
                }),
            })
            .required(t('common:validation.required')),
        })
      )
      .min(1, t('common:validation.required'))
      .required(t('common:validation.required')),
  })

export const formSchemaHierarchy = (t: TFunction<['common', 'orderCreate']>) =>
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
    required_date: yup.string().nullable(),
    order_comment: yup.string().nullable().notRequired(),
    order_items: yup
      .array()
      .of(
        yup.object().shape({
          label: yup.string().notRequired(),
          value: yup
            .object()
            .shape({
              children: yup
                .array()
                .of(
                  yup.object().shape({
                    kfa_type: yup.number().notRequired(),
                    material_id: yup.number().notRequired(),
                    available_stock: yup.number().notRequired(),
                    min: yup.number().notRequired(),
                    max: yup.number().notRequired(),
                    ordered_qty: yup
                      .mixed()
                      .nullable()
                      .test(
                        'is-valid',
                        t('common:validation.required'),
                        (value) => value !== ''
                      )
                      .nullable()
                      .test({
                        name: 'must-multiply-of',
                        test: function (value) {
                          const { parent } = this
                          if (
                            !value ||
                            !parent?.consumption_unit_per_distribution_unit
                          )
                            return true
                          return Number(value) %
                            Number(
                              parent?.consumption_unit_per_distribution_unit
                            ) ===
                            0
                            ? true
                            : this.createError({
                                message: t(
                                  'orderCreate:list.selected.column.quantity.error.multiply',
                                  {
                                    value:
                                      parent?.consumption_unit_per_distribution_unit,
                                  }
                                ),
                              })
                        },
                      }),
                    total_ordered_qty: yup.number().nullable().notRequired(),
                  })
                )
                .notRequired(),
              order_reason_id: yup
                .object({
                  label: yup.string().required(),
                  value: yup.number().required(),
                })
                .nullable()
                .test({
                  name: 'order-reason-required',
                  message: t('common:validation.required'),
                  test: function (value) {
                    const { parent } = this

                    if (parent.recommended_stock === 0) {
                      return !!value
                    }

                    if (
                      parent.recommended_stock > 0 &&
                      parent.recommended_stock !== parent.ordered_qty
                    ) {
                      return !!value
                    }

                    return true
                  },
                }),
              other_reason: yup
                .string()
                .when('order_reason_id', (order_reason_id, schema) => {
                  return Number(order_reason_id?.[0]?.value) === 9
                    ? schema.required(t('common:validation.required'))
                    : schema.notRequired()
                }),
              code_kfa_product_template: yup.string().notRequired(),
              material_id: yup.number().notRequired(),
              max: yup.number().notRequired(),
              min: yup.number().notRequired(),
              ordered_qty: yup
                .mixed()
                .nullable()
                .test(
                  'is-valid',
                  t('common:validation.required'),
                  (value) => value !== ''
                )
                .test(
                  'is-minimum',
                  t('orderCreate:list.selected.column.quantity.error.zero'),
                  (value: number) => {
                    const numericValue =
                      typeof value === 'string' ? Number(value) : value
                    return numericValue >= 1
                  }
                )
                .test({
                  name: 'must-multiply-of',
                  test: function (value) {
                    const { parent } = this
                    if (
                      !value ||
                      !parent?.consumption_unit_per_distribution_unit
                    )
                      return true
                    return Number(value) %
                      Number(parent?.consumption_unit_per_distribution_unit) ===
                      0
                      ? true
                      : this.createError({
                          message: t(
                            'orderCreate:list.selected.column.quantity.error.multiply',
                            {
                              value:
                                parent?.consumption_unit_per_distribution_unit,
                            }
                          ),
                        })
                  },
                }),
            })
            .required(t('common:validation.required')),
        })
      )
      .notRequired(),
  })

export const formSchemaChild = (t: TFunction<['common', 'orderCreate']>) =>
  yup.object({
    children: yup
      .array()
      .of(
        yup.object().shape({
          kfa_type: yup.number().notRequired(),
          material_id: yup.number().notRequired(),
          available_stock: yup.number().notRequired(),
          min: yup.number().notRequired(),
          max: yup.number().notRequired(),
          ordered_qty: yup
            .mixed()
            .nullable()
            .test(
              'is-child-ordered-qty-valid',
              t('common:validation.required'),
              (value) => {
                if (value === undefined) {
                  return true
                }
                return value !== '' && !isNaN(value as number)
              }
            )
            .nullable()
            .test(
              'is-minimum',
              t('orderCreate:list.selected.column.quantity.error.zero'),
              (value: number) => {
                if (value === null || value === undefined) {
                  return true
                } else {
                  const numericValue =
                    typeof value === 'string' ? Number(value) : value
                  return numericValue >= 1
                }
              }
            )
            .test({
              name: 'must-multiply-of',
              test: function (value) {
                const { parent } = this
                if (!value || !parent?.consumption_unit_per_distribution_unit)
                  return true
                return Number(value) %
                  Number(parent?.consumption_unit_per_distribution_unit) ===
                  0
                  ? true
                  : this.createError({
                      message: t(
                        'orderCreate:list.selected.column.quantity.error.multiply',
                        {
                          value: parent?.consumption_unit_per_distribution_unit,
                        }
                      ),
                    })
              },
            }),
          total_ordered_qty: yup.number().nullable().notRequired(),
        })
      )
      .test(
        'at-least-one-filled',
        t('common:validation.required'),
        (_, context) => validateBatchItems(t, context)
      ),
  })

export function validateBatchItems(
  t: TFunction<['common', 'orderCreate']>,
  context: yup.TestContext
) {
  const errors: yup.ValidationError[] = []

  const batch: any[] = context?.originalValue?.filter(
    (val: any) => val?.ordered_qty
  )
  if (!batch?.length) return false

  batch.forEach((item: any, index) => {
    if (!item?.ordered_qty) {
      errors.push(
        new yup.ValidationError(
          t('common:validation.required'),
          item?.ordered_qty,
          `${context?.path}[${index}].ordered_qty`
        )
      )
    }
  })

  return errors?.length > 0 ? new yup.ValidationError(errors) : true
}
