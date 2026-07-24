import { numberFormatter } from '#utils/formatter'
import { TFunction } from 'i18next'
import * as yup from 'yup'

export function receiveItemSchema(
  t: TFunction<['common', 'orderDetail']>,
  language: string
) {
  return yup.object({
    id: yup.mixed().optional(),
    receives: yup.array().of(
      yup.object({
        received_qty: yup
          .number()
          .required(t('common:validation.required'))
          .test({
            name: 'must-equal-to-shipped-qty',
            test: function (value, context) {
              const formValues = context?.from?.[0].value
              const shippedQty =
                formValues?._order_item_stock?.allocated_qty ?? 0

              return value === shippedQty
                ? true
                : this.createError({
                    message: t(
                      'orderDetail:form.receive_qty.validation.equal',
                      {
                        value: numberFormatter(shippedQty, language),
                      }
                    ),
                  })
            },
          }),
        fulfill_stock_status_id: yup
          .object({
            label: yup.string(),
            value: yup.mixed(),
          })
          .nullable()
          .test({
            name: 'required',
            message: t('common:validation.required'),
            test: function (value, context) {
              const isTemperatureSensitive =
                context?.from?.[2]?.value?._order_item?.material
                  ?.is_temperature_sensitive

              if (!isTemperatureSensitive) return true

              return value && isTemperatureSensitive
            },
          }),
        _order_item_stock: yup.object().shape({
          allocated_qty: yup.number().optional(),
        }),
      })
    ),
  })
}

export function receiveSchema(
  t: TFunction<['common', 'orderDetail']>,
  language: string,
  actualShipmentDate: string
) {
  return yup.object({
    order_items: yup
      .array()
      .of(receiveItemSchema(t, language))
      .required(t('common:validation.required')),
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
}
