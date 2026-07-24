import { KfaLevelEnum } from '#constants/material'
import { Stock } from '#types/stock'
import { numberFormatter } from '#utils/formatter'
import { TFunction } from 'i18next'
import * as yup from 'yup'

import {
  orderDetailItemAddFormSchema,
  orderDetailItemEditFormSchema,
} from './order-detail.schema'
import { OrderDetailItem, OrderDetailItemMaterial } from './order-detail.type'

const receiveSchema = (
  t: TFunction<['common', 'orderDetail']>,
  language: string,
  orderItemMaterial?: OrderDetailItemMaterial,
  validateStatus?: boolean
) => {
  return yup.object({
    stock_id: yup.number().required(),
    received_qty: yup
      .number()
      .transform((value, originalValue) =>
        originalValue === '' ? null : value
      )
      .nullable()
      .test({
        name: 'cannot_be_higher_than_shipped_qty',
        test: function (value) {
          const { from, path } = this
          const receivesMatch = path.match(/receives\[(\d+)\]/)
          const currentIndex = receivesMatch ? parseInt(receivesMatch[1]) : 0
          const shippedQty =
            from?.[1]?.value?.receives?.[currentIndex]?._order_stock
              ?.shipped_qty

          if (!value || !shippedQty) return true

          return Number(value) === Number(shippedQty)
            ? true
            : this.createError({
                message: t('orderDetail:form.receive_qty.validation.equal', {
                  value: numberFormatter(shippedQty, language),
                }),
              })
        },
      })
      .test({
        name: 'must_multiply_of_multiplier',
        test: function () {
          const { received_qty } = this.parent

          const multiplier =
            orderItemMaterial?.consumption_unit_per_distribution_unit
          if (!received_qty || !multiplier) return true

          return Number(received_qty) % Number(multiplier) === 0
            ? true
            : this.createError({
                message: t(
                  'orderDetail:form.received_qty.validation.multiply',
                  {
                    value: numberFormatter(multiplier, language),
                  }
                ),
              })
        },
      })
      .typeError(t('common:validation.required'))
      .required(t('common:validation.required')),
    fulfill_stock_status_id: validateStatus
      ? yup
          .object({
            label: yup.string(),
            value: yup.mixed(),
          })
          .nullable()
          .test({
            name: 'required',
            message: t('common:validation.required'),
            test: function (value) {
              const { received_qty } = this.parent
              const isTemperatureSensitive =
                this.parent?._order_item_children?.material
                  ?.is_temperature_sensitive ??
                orderItemMaterial?.is_temperature_sensitive
              const hasReceivedQty = Number(received_qty) > 0

              if (isTemperatureSensitive && hasReceivedQty && !value?.value) {
                return false
              }
              return true
            },
          })
      : yup.mixed().notRequired(),
  })
}

export const updateOrderStatusToPendingFromDraftFormSchema = (
  t: TFunction<['common', 'orderDetail']>,
  languange: string
) => {
  return yup.object({
    letter_number: yup.string().required(t('common:validation.required')),
  })
}

export const receiveChildSchema = (
  t: TFunction<['common', 'orderDetail']>,
  language: string,
  orderItemMaterial?: OrderDetailItemMaterial
) =>
  yup.object({
    id: yup.number().required(),
    receives: yup
      .array()
      .of(receiveSchema(t, language, orderItemMaterial, true))
      .required(),
  })

export const receiveModalChildSchema = (
  t: TFunction<['common', 'orderDetail']>,
  language: string,
  orderItemMaterial?: OrderDetailItemMaterial
) =>
  yup.object({
    id: yup.number().required(),
    receives: yup
      .array()
      .of(receiveSchema(t, language, orderItemMaterial, false))
      .required(),
  })

export const orderItemSchema = (
  t: TFunction<['common', 'orderDetail']>,
  language: string,
  orderItemMaterial?: OrderDetailItemMaterial
) =>
  yup.object({
    id: yup.number().required(),
    children: yup
      .array()
      .of(receiveChildSchema(t, language, orderItemMaterial))
      .required(),
  })

export const orderDetailReceivedHierarchyFormSchema = (
  t: TFunction<['common', 'orderDetail']>,
  language: string,
  actualShipmentDate: string
) =>
  yup.object({
    order_items: yup.array().of(orderItemSchema(t, language)).required(),
    fulfilled_at: yup
      .string()
      .test({
        name: 'valid-date',
        test: function (value) {
          return /^\d{4}-\d{2}-\d{2}$/.test(value || '')
            ? true
            : this.createError({
                message: t('orderDetail:form.received_date.validation.format'),
              })
        },
      })
      .test({
        name: 'not-in-past',
        test: function (value) {
          if (!value) return true
          const minDate = new Date(actualShipmentDate)
          const selectedDate = new Date(value)
          minDate.setHours(0, 0, 0, 0)

          if (selectedDate < minDate) {
            return this.createError({
              message: t('orderDetail:form.received_date.validation.past_date'),
            })
          }
          return true
        },
      })
      .test({
        name: 'not-in-future',
        test: function (value) {
          if (!value) return true
          const today = new Date()
          const selectedDate = new Date(value)
          today.setHours(23, 59, 59, 999)

          if (selectedDate > today) {
            return this.createError({
              message: t(
                'orderDetail:form.received_date.validation.future_date'
              ),
            })
          }
          return true
        },
      }),
  })

export const orderDetailHierarchyChildrenFormSchema = (
  t: TFunction<['common', 'orderDetail']>,
  language: string,
  data?: Stock | OrderDetailItem
) => {
  return yup.object({
    children: yup
      .array()
      .of(
        yup.object({
          ordered_qty: yup
            .mixed()
            .nullable()
            .test({
              name: 'must_multiply_of_multiplier',
              test: function () {
                const { ordered_qty } = this.parent

                const multiplier =
                  data?.material?.consumption_unit_per_distribution_unit

                if (!ordered_qty || !multiplier) return true

                return Number(ordered_qty) % Number(multiplier) === 0
                  ? true
                  : this.createError({
                      message: t(
                        'orderDetail:form.ordered_qty.validation.multiply',
                        {
                          value: numberFormatter(multiplier, language),
                        }
                      ),
                    })
              },
            }),
        })
      )
      .test(
        'at-least-one-filled',
        t('common:validation.required'),
        (_, context) => validateBatchItems(t, context, 'ordered_qty')
      ),
  })
}

export function validateBatchItems(
  t: TFunction<['common', 'orderDetail']>,
  context: yup.TestContext,
  type: string
) {
  const errors: yup.ValidationError[] = []

  const batch: any[] = context?.originalValue?.filter((val: any) => val?.[type])
  if (!batch?.length) return false

  batch.forEach((item: any, index) => {
    if (!item?.[type]) {
      errors.push(
        new yup.ValidationError(
          t('common:validation.required'),
          item?.[type],
          `${context?.path}.[${index}].${type}`
        )
      )
    }
  })
  return errors?.length > 0 ? new yup.ValidationError(errors) : true
}

export function validateOrderStockStatusId(
  t: TFunction<['common', 'orderDetail']>,
  context: yup.TestContext
) {
  const errors: yup.ValidationError[] = []
  const children: any[] = context?.originalValue || []

  const hasAtLeastOneFilled = children.some(
    (child: any) => !!child?.order_stock_status_id?.value
  )

  const hasAllocatedQty = children.some(
    (child: any) => Number(child?.allocated_qty) > 0
  )

  if (!hasAtLeastOneFilled) {
    children.forEach((item: any, index) => {
      const isTemperatureSensitive =
        item?._child_detail?.material?.is_temperature_sensitive === true

      if (
        !item?.order_stock_status_id?.value &&
        isTemperatureSensitive &&
        !hasAllocatedQty
      ) {
        errors.push(
          new yup.ValidationError(
            t('common:validation.required'),
            item?.order_stock_status_id,
            `${context?.path}[${index}].order_stock_status_id`
          )
        )
      }
    })
  }

  return errors.length > 0 ? new yup.ValidationError(errors) : true
}

export const orderDetailHierarchyChildrenConfirmOrderSchema = (
  t: TFunction<['common', 'orderDetail']>,
  language: string,
  data?: Stock | OrderDetailItem
) => {
  return yup.object({
    order_items: yup.array().of(
      yup.object({
        id: yup.number().required(),
        confirmed_qty: yup
          .number()
          .test({
            name: 'must_multiply_of_multiplier',
            test: function (value) {
              const multiplier =
                data?.material?.consumption_unit_per_distribution_unit

              if (!value || !multiplier) return true

              return Number(value) % Number(multiplier) === 0
                ? true
                : this.createError({
                    message: t(
                      'orderDetail:form.ordered_qty.validation.multiply',
                      {
                        value: numberFormatter(multiplier, language),
                      }
                    ),
                  })
            },
          })
          .typeError(t('orderDetail:form.confirmed_qty.validation.required'))
          .required(t('orderDetail:form.confirmed_qty.validation.required')),
        children: yup.array().of(
          yup.object({
            ordered_qty: yup
              .number()
              .typeError(t('orderDetail:form.ordered_qty.validation.required'))
              .notRequired()
              .test({
                name: 'must_multiply_of_multiplier',
                test: function (value) {
                  const multiplier =
                    data?.material?.consumption_unit_per_distribution_unit

                  if (!value || !multiplier) return true

                  return Number(value) % Number(multiplier) === 0
                    ? true
                    : this.createError({
                        message: t(
                          'orderDetail:form.ordered_qty.validation.multiply',
                          {
                            value: numberFormatter(multiplier, language),
                          }
                        ),
                      })
                },
              }),
          })
        ),
      })
    ),
  })
}

export const orderDetailAddHierarchyFormSchema = (
  t: TFunction<['common', 'orderDetail']>,
  language: string,
  stockData?: Stock
) => {
  return orderDetailItemAddFormSchema(t, language).concat(
    orderDetailHierarchyChildrenFormSchema(t, language, stockData)
  )
}

export const orderDetailEditHierarchyFormSchema = (
  t: TFunction<['common', 'orderDetail']>,
  language: string,
  orderItemData?: OrderDetailItem
) => {
  return orderDetailItemEditFormSchema(t, language).concat(
    orderDetailHierarchyChildrenFormSchema(t, language, orderItemData)
  )
}

export const orderDetailAllocateMaterial93FormSchema = (
  t: TFunction<['common', 'orderDetail']>
) => {
  return yup.array().of(
    yup.object({
      id: yup.number(),
      order_stock_status_id: yup.object().shape({
        label: yup.string(),
        value: yup.mixed(),
      }),
      allocations: yup
        .array()
        .of(
          yup.object({
            stock_id: yup.number(),
            allocated_qty: yup.number(),
          })
        )
        .test(
          'at-least-one-filled',
          t('orderDetail:table.trademark.validation.min_qty'),
          (_, context) => validateBatchItems(t, context, 'allocated_qty')
        ),
    })
  )
}

export const orderDetailAllocateHierarchyFormSchema = (
  t: TFunction<['common', 'orderDetail']>
) => {
  return yup.object({
    order_items: yup.array().of(
      yup.object({
        id: yup.number().required(),
        confirmed_qty: yup
          .number()
          .typeError(t('orderDetail:form.confirmed_qty.validation.required'))
          .required(t('orderDetail:form.confirmed_qty.validation.required')),
        children: orderDetailAllocateMaterial93FormSchema(t),
      })
    ),
  })
}

export const allocationsFormSchema = (
  t: TFunction<['common', 'orderDetail']>,
  language: string,
  isImmunization: boolean = false,
  validateStatus: boolean = true
) => {
  return yup.array().of(
    yup.object({
      allocated_qty: yup
        .number()
        .test({
          name: 'cannot_be_higher_than_vendor_stock',
          test: function (value) {
            const { from, path } = this
            const allocationsMatch = path.match(/allocations\[(\d+)\]/)
            const currentIndex = allocationsMatch
              ? Number(allocationsMatch[1])
              : 0
            const vendorQty =
              from?.[1]?.value?.allocations?.[currentIndex]?._stock_detail
                ?.available_qty

            if (!value || !vendorQty) return true

            return Number(value) <= Number(vendorQty)
              ? true
              : this.createError({
                  message: t(
                    'orderDetail:form.allocated_qty.validation.less_than',
                    {
                      value: numberFormatter(vendorQty, language),
                    }
                  ),
                })
          },
        })
        .test({
          name: 'must_multiply_of_multiplier',
          test: function (value) {
            const { parent } = this
            const multiplier =
              parent?._stock_material?.consumption_unit_per_distribution_unit

            if (!value || !multiplier) return true

            return Number(value) % Number(multiplier) === 0
              ? true
              : this.createError({
                  message: t(
                    'orderDetail:form.ordered_qty.validation.multiply',
                    {
                      value: numberFormatter(multiplier, language),
                    }
                  ),
                })
          },
        })
        .test({
          name: 'total_must_same_as_confirmed_qty',
          test: function (value) {
            const { from, path, createError, options } = this

            // Immunization Program Only
            if (!isImmunization) return true

            // For Trademark only
            if (Number(options?.parent?.kfa_level_id) === KfaLevelEnum.KFA_92)
              return true

            const allocationsMatch = path.match(/allocations\[(\d+)\]/)
            const currentIndex = allocationsMatch
              ? Number(allocationsMatch[1])
              : 0
            const siblings = from?.[1]?.value?.allocations || []
            const totalAllocated = siblings.reduce(
              (total: number, allocation: any, index: number) => {
                if (index === currentIndex) {
                  return total + Number(value ?? 0)
                }
                return total + Number(allocation.allocated_qty ?? 0)
              },
              0
            )

            const confirmedQty = options?.parent?.confirmed_qty

            if (!confirmedQty) return true

            return Number(totalAllocated) === Number(confirmedQty)
              ? true
              : createError({
                  message: t(
                    'orderDetail:form.allocated_qty.validation.total_must_same_as_confirmed_qty',
                    {
                      value: numberFormatter(confirmedQty, language),
                    }
                  ),
                })
          },
        }),
      order_stock_status_id: yup
        .object({
          label: yup.string(),
          value: yup.mixed(),
        })
        .nullable()
        .test({
          name: 'required',
          message: t('common:validation.required'),
          test: function (value) {
            if (!validateStatus) return true

            const { allocated_qty, _stock_material } = this.parent
            const isTemperatureSensitive =
              _stock_material?.is_temperature_sensitive === 1 ||
              _stock_material?.is_temperature_sensitive === true

            const hasAllocated = Number(allocated_qty) > 0

            if (isTemperatureSensitive && hasAllocated && !value?.value) {
              return false
            }

            return true
          },
        }),
    })
  )
}

export const orderDetailAllocateBatchModalHierarchyFormSchema = (
  t: TFunction<['common', 'orderDetail']>,
  language: string,
  isImmunization: boolean = false
) => {
  return yup.object({
    allocations: allocationsFormSchema(t, language, isImmunization, false),
  })
}

export const orderDetailAllocateModalHierarchyFormSchema = (
  t: TFunction<['common', 'orderDetail']>,
  language: string,
  isImmunization: boolean = false
) => {
  return yup.object({
    id: yup.number().nullable(),
    confirmed_qty: yup.number().notRequired(),
    children: yup
      .array()
      .of(
        yup
          .object({
            id: yup.number().nullable(),
            order_stock_status_id: yup
              .object({
                label: yup.string(),
                value: yup.mixed(),
              })
              .nullable()
              .notRequired(),
          })
          .concat(
            yup.object({
              allocations: allocationsFormSchema(t, language, isImmunization, true),
            })
          )
      )
      .test({
        name: 'total_allocation_kfa92_must_same_as_confirmed_qty',
        test: function () {
          const { createError, options } = this
          if (!isImmunization) return true

          const isKfa92 = options?.parent?.children?.some(
            (child) => Number(child?.kfa_level_id) === KfaLevelEnum.KFA_92
          )

          if (!isKfa92) return true

          const confirmedQty = options.parent?.children?.[0]?.confirmed_qty

          if (!confirmedQty) return true

          const totalAllocated =
            options?.parent?.children?.reduce(
              (total: number, allocation: { allocated_qty?: number }) =>
                total + Number(allocation?.allocated_qty ?? 0),
              0
            ) ?? 0

          if (Number(totalAllocated) !== Number(confirmedQty)) {
            return createError({
              message: t(
                'orderDetail:form.allocated_qty.validation.total_must_same_as_confirmed_qty',
                {
                  value: numberFormatter(confirmedQty, language),
                }
              ),
            })
          }

          return true
        },
      })
      .test(
        'at-least-one-filled',
        t('common:validation.required'),
        (_, context) => validateOrderStockStatusId(t, context)
      ),
  })
}

export const orderDetailAllocateDrawerHierarchyFormSchema = (
  t: TFunction<['common', 'orderDetail']>,
  language: string
) => {
  return yup.object({
    order_items: yup
      .array()
      .of(orderDetailAllocateModalHierarchyFormSchema(t, language)),
  })
}
