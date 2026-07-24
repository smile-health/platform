import { BOOLEAN } from '#constants/common'
import { TFunction } from 'i18next'
import * as Yup from 'yup'

import { getTodayDate } from '../utils/helper'
import { TRANSACTION_REASON } from './transaction-return-from-facility.constant'

export const transactionReturnFromFacilityValidation = (
  t: TFunction<['transactionCreate', 'common']>
) =>
  Yup.object().shape({
    entity: Yup.object()
      .shape({
        value: Yup.number(),
      })
      .required(t('common:validation.required')),
    activity: Yup.object()
      .shape({
        value: Yup.number(),
      })
      .required(t('common:validation.required')),
    customer: Yup.object()
      .shape({
        value: Yup.number(),
      })
      .required(t('common:validation.required')),
    actual_date: Yup.date()
      .typeError(t('common:validation.message_invalid_date'))
      .required(t('common:validation.required'))
      .max(
        getTodayDate(),
        t(
          'transactionCreate:transaction_return_from_facility.input_table.column.validation.error_actual_date'
        )
      ),
    items: Yup.array().of(
      Yup.object().shape({
        return_qty: Yup.string()
          .nullable()
          .min(0, t('common:validation.numeric_cannot_negative'))
          .test({
            name: 'must-less-than-qty',
            test: function (value) {
              if (!value) return true
              const { parent } = this
              const isOpenVial =
                Number(parent?.material?.is_open_vial) === BOOLEAN.TRUE &&
                parent?.customer_is_open_vial
              const maxReturn = parent?.max_return ?? 0
              if (Number(value) > Number(maxReturn)) {
                return this.createError({
                  message: t(
                    'transactionCreate:transaction_return_from_facility.input_table.column.validation.max_input_qty',
                    {
                      input: isOpenVial
                        ? t(
                            'transactionCreate:transaction_return_from_facility.input_table.detail_column.close_vial'
                          )
                        : t(
                            'transactionCreate:transaction_return_from_facility.input_table.detail_column.return_amount'
                          ),
                      target: t(
                        'transactionCreate:transaction_return_from_facility.input_table.detail_column.max_return'
                      ),
                    }
                  ),
                })
              }
              return true
            },
          })
          .test({
            name: 'cannot-more-than-qty',
            test: function (value) {
              if (!value) return true
              const { parent } = this
              const openVialQty = Number(parent?.open_vial_qty ?? 0)
              const qtyMultiplyer = Number(
                parent?.material?.consumption_unit_per_distribution_unit ?? 0
              )
              const maxReturn = Number(parent?.max_return ?? 0)
              const qtyCanBeReturned = maxReturn - qtyMultiplyer
              if (openVialQty > 0 && Number(value) > qtyCanBeReturned)
                return this.createError({
                  message: t(
                    'transactionCreate:transaction_return_from_facility.input_table.column.validation.cannot_more_than',
                    {
                      max: qtyCanBeReturned,
                    }
                  ),
                })
              return true
            },
          })
          .test({
            name: 'must-multiply-of',
            test: function (value) {
              const { parent } = this

              const piecesPerUnit =
                parent?.material?.consumption_unit_per_distribution_unit
              if (!value || !piecesPerUnit) return true
              return Number(value) % Number(piecesPerUnit) === 0
                ? true
                : this.createError({
                    message: t(
                      'transactionCreate:transaction_return_from_facility.input_table.column.validation.quantity_must_multiply',
                      {
                        number: piecesPerUnit,
                        target: t(
                          'transactionCreate:transaction_return_from_facility.input_table.detail_column.return_amount'
                        ),
                      }
                    ),
                  })
            },
          })
          .test({
            name: 'minimum_1',
            test: function (value) {
              if (!value) return true
              return Number(value) > 0
                ? true
                : this.createError({
                    message: t(
                      'transactionCreate:transaction_return_from_facility.input_table.column.validation.minimum_1'
                    ),
                  })
            },
          })
          .test(
            'determine-required',
            t('common:validation.required'),
            function (value) {
              const { parent } = this
              const isOpenVial =
                Number(parent?.material?.is_open_vial) === BOOLEAN.TRUE &&
                parent?.customer_is_open_vial
              if (isOpenVial) {
                const openVialQty = Number(parent?.open_vial_qty ?? 0)
                if (openVialQty > 0) return true
                return !!value
              }
              return !!value
            }
          ),
        open_vial_qty: Yup.string()
          .nullable()
          .min(0, t('common:validation.numeric_cannot_negative'))
          .test({
            name: 'minimum_1',
            test: function (value) {
              if (!value) return true
              return Number(value) > 0
                ? true
                : this.createError({
                    message: t(
                      'transactionCreate:transaction_return_from_facility.input_table.column.validation.minimum_1'
                    ),
                  })
            },
          })
          .test({
            name: 'must-less-than-qty',
            test: function (value) {
              if (!value) return true
              const { parent } = this
              const piecesPerUnit = Number(
                parent?.material?.consumption_unit_per_distribution_unit ?? 0
              )

              if (Number(value) >= piecesPerUnit) {
                return this.createError({
                  message: t(
                    'transactionCreate:transaction_return_from_facility.input_table.column.validation.must_less_than',
                    {
                      max: piecesPerUnit,
                    }
                  ),
                })
              }
              return true
            },
          })
          .test(
            'determine-required',
            t('common:validation.required'),
            function (value) {
              const { parent } = this
              const isOpenVial =
                Number(parent?.material?.is_open_vial) === BOOLEAN.TRUE &&
                parent?.customer_is_open_vial
              if (isOpenVial) {
                const closeVialQty = Number(parent?.return_qty ?? 0)
                if (closeVialQty > 0) return true
                return !!value
              }
              return true
            }
          ),
      })
    ),
  })

export const transactionReturnFromFacilityDiscardValidation = (
  t: TFunction<['transactionCreate', 'common']>
) =>
  Yup.object().shape({
    discard_reason: Yup.object()
      .shape({
        value: Yup.string().nullable(),
      })
      .nullable()
      .test('is-required', t('common:validation.required'), function (value) {
        const { parent } = this
        const isQtyFilled =
          !!parent?.discard_qty || !!parent?.discard_open_vial_qty
        if (isQtyFilled) {
          return !!value?.value
        }
        return true
      }),
    other_reason: Yup.string()
      .nullable()
      .test('is-required', t('common:validation.required'), function (value) {
        const { discard_reason } = this.parent
        return Number(discard_reason?.value) ===
          TRANSACTION_REASON.OTHER_RETURN_FROM_FACILITY
          ? !!value
          : true
      }),
    discard_qty: Yup.string()
      .nullable()
      .min(0, t('common:validation.numeric_cannot_negative'))
      .test({
        name: 'must-less-than-qty',
        test: function (value) {
          if (!value) return true
          const { parent } = this
          const returnQty = parent?.return_qty ?? 0
          const isOpenVial =
            Number(parent?.material?.is_open_vial) === BOOLEAN.TRUE &&
            parent?.customer_is_open_vial

          if (Number(value) > Number(returnQty))
            return this.createError({
              message: t(
                'transactionCreate:transaction_return_from_facility.input_table.column.validation.max_input_qty',
                {
                  input: isOpenVial
                    ? t(
                        'transactionCreate:transaction_return_from_facility.input_table.detail_column.close_vial_discarded'
                      )
                    : t(
                        'transactionCreate:transaction_return_from_facility.input_table.detail_column.qty_discarded'
                      ),
                  target: isOpenVial
                    ? t(
                        'transactionCreate:transaction_return_from_facility.input_table.detail_column.close_vial'
                      )
                    : t(
                        'transactionCreate:transaction_return_from_facility.input_table.detail_column.return_amount'
                      ),
                }
              ),
            })
          return true
        },
      })
      .test({
        name: 'must-multiply-of',
        test: function (value) {
          const { parent } = this

          const piecesPerUnit =
            parent?.material?.consumption_unit_per_distribution_unit
          if (!value || !piecesPerUnit) return true
          return Number(value) % Number(piecesPerUnit) === 0
            ? true
            : this.createError({
                message: t(
                  'transactionCreate:transaction_return_from_facility.input_table.column.validation.quantity_must_multiply',
                  {
                    number: piecesPerUnit,
                    target: t(
                      'transactionCreate:transaction_return_from_facility.input_table.detail_column.qty_discarded'
                    ),
                  }
                ),
              })
        },
      })
      .test('is-required', t('common:validation.required'), function (value) {
        const { parent } = this
        const isDiscardReasonFilled = !!parent?.discard_reason?.value
        const isOpenVial =
          Number(parent?.material?.is_open_vial) === BOOLEAN.TRUE &&
          parent?.customer_is_open_vial
        const openVialQtyFilled = Number(parent?.open_vial_qty ?? 0) > 0

        if (isOpenVial) {
          const closeVialIsOkay = openVialQtyFilled || !!value
          return isDiscardReasonFilled ? closeVialIsOkay : true
        }

        if (isDiscardReasonFilled) {
          return !!value
        }
        return true
      }),
    discard_open_vial_qty: Yup.string()
      .nullable()
      .min(0, t('common:validation.numeric_cannot_negative'))
      .test({
        name: 'must-equals',
        test: function (value) {
          if (!value) return true
          const { parent } = this
          const returnOpenVialQty = Number(parent?.open_vial_qty ?? 0)
          if (Number(value) !== returnOpenVialQty)
            return this.createError({
              message: t(
                'transactionCreate:transaction_return_from_facility.input_table.column.validation.must_equal_open_vial'
              ),
            })
          return true
        },
      })
      .test('is-required', t('common:validation.required'), function (value) {
        const { parent } = this
        const isDiscardReasonFilled = !!parent?.discard_reason?.value
        const isDiscardCloseVialQtyFilled = !!parent?.discard_qty
        const isOpenVial =
          Number(parent?.material?.is_open_vial) === BOOLEAN.TRUE &&
          parent?.customer_is_open_vial
        const openVialQtyFilled = Number(parent?.open_vial_qty ?? 0) > 0
        if (isOpenVial && openVialQtyFilled) {
          if (isDiscardReasonFilled) {
            return !isDiscardCloseVialQtyFilled ? !!value : true
          }
          return true
        }
        return true
      }),
  })

export default {}
