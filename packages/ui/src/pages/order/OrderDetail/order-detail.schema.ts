import { OptionType } from '#components/react-select'
import { Stock } from '#types/stock'
import { numberFormatter } from '#utils/formatter'
import { TFunction } from 'i18next'
import * as yup from 'yup'

import { OrderCancelReasonEnum, OrderReasonEnum } from '../order.constant'
import { OrderDetailAllocateModalFormValues } from './components/Forms/OrderDetailAllocateModalForm'
import {
  OrderDetailItem,
  OrderDetailMappedOrderItem,
} from './order-detail.type'

export const orderDetailCommentFormSchema = (t: TFunction<'orderDetail'>) => {
  return yup.object({
    comment: yup.string().trim(t('form.comment.validation.required')),
  })
}

export const orderDetailItemAddFormSchema = (
  t: TFunction<['common', 'orderDetail']>,
  language: string,
  stockData?: Stock
) => {
  return yup.object({
    material_id: yup
      .number()
      .typeError(t('orderDetail:form.material.validation.required'))
      .required(t('orderDetail:form.material.validation.required')),
    ordered_qty: yup
      .number()
      .typeError(t('orderDetail:form.ordered_qty.validation.required'))
      .required(t('orderDetail:form.ordered_qty.validation.required'))
      .test({
        name: 'must-more-than-zero',
        test: function (value) {
          if (Number(value) === 0) {
            return this.createError({
              message: t('orderDetail:form.ordered_qty.validation.zero'),
            })
          }

          if (isNaN(value) || value === null) {
            return this.createError({
              message: t('orderDetail:form.ordered_qty.validation.required'),
            })
          }

          return true
        },
      })
      .test({
        name: 'must-multiply-of-multiplier',
        test: function (value) {
          const multiplier =
            stockData?.material?.consumption_unit_per_distribution_unit

          if (!value || !multiplier) return true

          return Number(value) % Number(multiplier) === 0
            ? true
            : this.createError({
                message: t('orderDetail:form.ordered_qty.validation.multiply', {
                  value: numberFormatter(multiplier, language),
                }),
              })
        },
      }),
    recommended_stock: yup.number().nullable(),
    order_reason_id: yup
      .object({
        value: yup.number(),
        label: yup.string(),
      })
      .required(t('orderDetail:form.reason.validation.required'))
      .when(['ordered_qty', 'recommended_stock'], {
        is: (ordered_qty: number, recommended_stock: number) => {
          return recommended_stock > 0 && ordered_qty === recommended_stock
        },
        then: () =>
          yup
            .object({
              value: yup.number(),
              label: yup.string(),
            })
            .nullable(),
      }),
    other_reason: yup.string().when(['order_reason_id'], {
      is: (option: OptionType) => option?.value === OrderReasonEnum.Others,
      then: () =>
        yup
          .string()
          .required(t('orderDetail:form.other_reason.validation.required')),
    }),
  })
}

export const orderDetailItemEditFormSchema = (
  t: TFunction<['common', 'orderDetail']>,
  language: string,
  orderItemData?: OrderDetailItem
) => {
  return yup.object({
    ordered_qty: yup
      .number()
      .typeError(t('orderDetail:form.ordered_qty.validation.required'))
      .required(t('orderDetail:form.ordered_qty.validation.required'))
      .test({
        name: 'must-multiply-of-multiplier',
        test: function (value) {
          const multiplier =
            orderItemData?.material.consumption_unit_per_distribution_unit

          if (!value || !multiplier) return true

          return Number(value) % Number(multiplier) === 0
            ? true
            : this.createError({
                message: t('orderDetail:form.ordered_qty.validation.multiply', {
                  value: numberFormatter(multiplier, language),
                }),
              })
        },
      }),
    recommended_stock: yup.number().nullable(),
    order_reason_id: yup
      .object({
        value: yup.number(),
        label: yup.string(),
      })
      .required(t('orderDetail:form.reason.validation.required'))
      .when(['ordered_qty', 'recommended_stock'], {
        is: (ordered_qty: number, recommended_stock: number) => {
          return recommended_stock > 0 && ordered_qty === recommended_stock
        },
        then: () =>
          yup
            .object({
              value: yup.number(),
              label: yup.string(),
            })
            .nullable(),
      }),
    other_reason: yup.string().when(['order_reason_id'], {
      is: (option: OptionType) => option?.value === OrderReasonEnum.Others,
      then: () =>
        yup
          .string()
          .required(t('orderDetail:form.other_reason.validation.required')),
    }),
  })
}

export const orderDetailCancelFormSchema = (t: TFunction<'orderDetail'>) => {
  return yup.object({
    cancel_reason_id: yup
      .object({
        value: yup.number(),
        label: yup.string(),
      })
      .required(t('form.reason.validation.required')),
    other_reason: yup.string().when(['cancel_reason_id'], {
      is: (option: OptionType) => {
        return option?.value === OrderCancelReasonEnum.Others
      },
      then: (data) => {
        return yup.string().required(t('form.other_reason.validation.required'))
      },
    }),
    comment: yup.string().required(t('form.comment.validation.required')),
  })
}

export const orderDetailValidateFormSchema = (
  t: TFunction<['common', 'orderDetail']>,
  language: string
) => {
  return yup.object({
    order_items: yup.array().of(
      yup.object({
        id: yup.number().required(),
        validated_qty: yup
          .number()
          .typeError(t('orderDetail:form.confirmed_qty.validation.required'))
          .required(t('orderDetail:form.confirmed_qty.validation.required'))
          .test({
            name: 'must-multiply-of-multiplier',
            test: function (value) {
              const multiplier =
                this.parent?._data?.material
                  .consumption_unit_per_distribution_unit

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
            name: 'must-less-than-stock-on-hand',
            message: t('orderDetail:form.confirmed_qty.validation.max'),
            test: function (value) {
              const stockOnHand =
                this.parent?._data?.stock_vendor?.total_available_qty

              if (stockOnHand && value) {
                return Number(value) <= Number(stockOnHand)
              }

              return true
            },
          }),
      })
    ),
  })
}

export const orderDetailConfirmOrderStocksFormSchema = (
  t: TFunction<['common', 'orderDetail']>,
  language: string
) => {
  return yup.object({
    order_items: yup.array().of(
      yup.object({
        id: yup.number().required(),
        confirmed_qty: yup
          .number()
          .typeError(t('orderDetail:form.confirmed_qty.validation.required'))
          .required(t('orderDetail:form.confirmed_qty.validation.required'))
          .test({
            name: 'must-multiply-of-multiplier',
            test: function (value) {
              const multiplier =
                this.parent?._data?.material
                  .consumption_unit_per_distribution_unit

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
            name: 'must-less-than-stock-on-hand',
            message: t('orderDetail:form.confirmed_qty.validation.max'),
            test: function (value) {
              const stockOnHand =
                this.parent?._data?.stock_vendor?.total_available_qty

              if (stockOnHand && value) {
                return Number(value) <= Number(stockOnHand)
              }

              return true
            },
          }),
      })
    ),
  })
}

export const OrderDetailConfirmHierarchyChildrenModalFormSchema = (
  t: TFunction<['common', 'orderDetail']>,
  language: string,
  orderItemData?: OrderDetailItem
) => {
  return yup.object({
    children: yup.array().of(
      yup.object({
        confirmed_qty: yup
          .number()
          .nullable()
          .typeError(t('orderDetail:form.confirmed_qty.validation.required'))
          .required(t('orderDetail:form.confirmed_qty.validation.required'))
          .test({
            name: 'must_multiply_of_multiplier',
            test: function (value) {
              const multiplier =
                orderItemData?.material.consumption_unit_per_distribution_unit

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
            name: 'must_higher_than_vendor_stock',
            test: function (value) {
              const { parent } = this
              const vendorQty =
                parent?.stock_vendor?.total_available_qty_activity ?? 0
              return Number(value) > Number(vendorQty)
                ? this.createError({
                    message: t(
                      'orderDetail:form.ordered_qty.validation.must_lesser_than_vendor_stock',
                      {
                        value: numberFormatter(vendorQty, language),
                      }
                    ),
                  })
                : true
            },
          }),
      })
    ),
  })
}

export const orderDetailAllocateModalFormSchema = (
  t: TFunction<['common', 'orderDetail']>,
  language: string,
  mappedOrderItem?: OrderDetailMappedOrderItem
) => {
  return yup.object({
    id: yup.number().required(),
    allocations: yup
      .array()
      .of(
        yup.object({
          stock_id: yup.number().required(t('common:validation.required')),
          allocated_qty: yup
            .number()
            .nullable()
            .transform((value, originalValue) => {
              return String(originalValue).trim() === '' ? null : value
            })
            .test({
              name: 'required-if-none-filled',
              message: t('common:validation.required'),
              test: function (value) {
                const formValues: OrderDetailAllocateModalFormValues =
                  this?.from?.[1]?.value

                const hasAnyAllocated = formValues?.allocations?.some(
                  (allocation: any) =>
                    allocation.allocated_qty !== null &&
                    allocation.allocated_qty !== undefined &&
                    allocation.allocated_qty !== ''
                )

                if (hasAnyAllocated) {
                  return true
                }

                return value !== null && value !== undefined
              },
            })
            .test({
              name: 'must-multiply-of-multiplier',
              test: function (value) {
                const multiplier =
                  mappedOrderItem?.order_item?.material
                    .consumption_unit_per_distribution_unit

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
              name: 'must-less-than-stock-on-hand',
              message: t('orderDetail:form.confirmed_qty.validation.max'),
              test: function (value) {
                const stockOnHand = this.parent?.stock_detail?.qty
                const allocatedQty = value

                if (stockOnHand && allocatedQty) {
                  return Number(allocatedQty) <= Number(stockOnHand)
                }

                return true
              },
            }),
          order_stock_status_id: yup
            .object({
              value: yup.number(),
              label: yup.string(),
            })
            .nullable()
            .default(null)
            .when(['allocated_qty'], {
              is: (allocated_qty: number | null) => {
                return (
                  mappedOrderItem?.vendor_stock?.material
                    ?.is_temperature_sensitive && (allocated_qty ?? 0) > 0
                )
              },
              then: (schema) =>
                schema.required(t('common:validation.required')),
              otherwise: (schema) => schema.nullable(),
            }),
        })
      )
      .test({
        name: 'at-least-one-allocated-qty',
        message: t('orderDetail:form.allocations.validation.at_least_one'),
        test: function (allocations) {
          if (!allocations) return false
          return allocations.some(
            (allocation) =>
              allocation.allocated_qty !== null &&
              allocation.allocated_qty !== undefined
          )
        },
      })
      .test({
        name: 'must-match-with-confirmed-qty',
        message: t(
          'orderDetail:form.allocations.validation.is_match_with_confirmed_qty'
        ),
        test: function (allocations) {
          const confirmedQty = mappedOrderItem?.order_item?.confirmed_qty
          const totalAllocatedQty = allocations?.reduce((acc, allocation) => {
            const allocatedQty = allocation.allocated_qty ?? 0
            return acc + Number(allocatedQty)
          }, 0)
          const isMatch = totalAllocatedQty === confirmedQty
          if (totalAllocatedQty === 0 || isMatch) return true
        },
      }),
  })
}

export const orderDetailAllocateFormSchema = (
  t: TFunction<['common', 'orderDetail']>,
  language: string
) => {
  return yup.object({
    order_items: yup
      .array()
      .of(orderDetailAllocateModalFormSchema(t, language))
      .required(t('common:validation.required')),
  })
}

export const orderDetailShipFormSchema = (
  t: TFunction<['common', 'orderDetail']>,
  language: string
) => {
  return yup.object({
    actual_shipment_date: yup
      .string()
      .required(t('orderDetail:form.actual_shipment_date.validation.required'))
      .test({
        name: 'less-than-or-equal-to-today',
        message: t('orderDetail:form.actual_shipment_date.validation.max'),
        test: function (value) {
          const today = new Date()
          const actualShipmentDate = new Date(value)
          actualShipmentDate.setHours(0, 0, 0, 0)
          const isValidDate = !isNaN(actualShipmentDate.getTime())
          const isLessThanOrEqualToToday = actualShipmentDate <= today

          if (isValidDate && isLessThanOrEqualToToday) {
            return true
          }

          return false
        },
      }),
  })
}

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
            .number()
            .typeError(t('orderDetail:form.ordered_qty.validation.required'))
            .notRequired()
            .min(1, t('orderDetail:form.ordered_qty.validation.zero'))
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
      .test({
        name: 'children-validation',
        test: function (children) {
          if (!children) return true

          if (children.length === 0) return true

          return children.some(
            (child) =>
              child.ordered_qty !== undefined &&
              child.ordered_qty !== null &&
              child.ordered_qty > 0
          )
        },
        message: 'At least one child must have a non-zero ordered quantity',
      }),
  })
}

export const orderDetailHierarchyChildrenConfirmOrderSchema = (
  t: TFunction<['common', 'orderDetail']>,
  language: string,
  data?: any
) => {
  return yup.object({
    order_items: yup.array().of(
      yup.object({
        material_id: yup.number().notRequired(),
        confirmed_qty: yup
          .number()
          .required(t('orderDetail:form.confirmed_qty.validation.required'))
          .test({
            name: 'must_multiply_of_multiplier',
            test: function (value) {
              const { parent } = this
              const materialDetail = data?.order_items?.find(
                (item: any) => item.material?.id === parent.material_id
              )
              const multiplier =
                materialDetail?.material?.consumption_unit_per_distribution_unit

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
