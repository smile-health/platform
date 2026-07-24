import { STATUS } from '#constants/common'
import { TFunction } from 'i18next'
import * as yup from 'yup'

import { getTodayDate } from '../../utils/helper'

const requiredObject = (
  t: TFunction<['transactionCreate', 'common', 'transactionCreateAddStock']>
) =>
  yup
    .object({
      label: yup.string().required(t('common:validation.required')),
      value: yup.number().required(t('common:validation.required')),
    })
    .required(t('common:validation.required'))

export const formSchemaAddStock = (
  t: TFunction<['transactionCreate', 'common', 'transactionCreateAddStock']>
) =>
  yup.object({
    entity: requiredObject(t),
    activity: requiredObject(t),
    transactionType: requiredObject(t),
    items: yup
      .array()
      .of(
        yup.object().shape({
          batches: yup
            .array()
            .of(
              yup.object().shape({
                change_qty: yup.number().nullable(),
              })
            )
            .test(
              'at-least-one-change_qty',
              t('common:validation.required'),
              (batches) => {
                if (!batches) return false
                return batches.some(
                  (batch) =>
                    batch.change_qty !== null && batch.change_qty !== undefined
                )
              }
            ),
        })
      )
      .required(t('common:validation.required'))
      .min(1, t('transactionCreateAddStock:validation.required_materials')),
  })

export const formSchemaAddStockBatch = (
  t: TFunction<['transactionCreateAddStock', 'common']>
) =>
  yup.object({
    batches: yup
      .array()
      .of(
        yup.object().shape({
          managed_in_batch: yup.number().nullable(),
          temperature_sensitive: yup.number().nullable(),
          batch_id: yup.number().nullable(),
          available_qty: yup.number().nullable(),
          pieces_per_unit: yup.number().nullable(),
          transaction_reason: yup
            .object({
              label: yup.string().nullable(),
              value: yup.object({
                id: yup.number(),
                is_purchase: yup.number().oneOf([0, 1]), // Must be 0 or 1
              }),
            })
            .when(['change_qty'], {
              is: (change_qty: number) => change_qty,
              then: (schema) =>
                schema.required(t('common:validation.required')),
              otherwise: (schema) => schema.notRequired(),
            }),
          other_reason_required: yup.bool(),
          other_reason: yup.string().when(['other_reason_required'], {
            is: (other_reason_required: boolean) => other_reason_required,
            then: (schema) => schema.required(t('common:validation.required')),
            otherwise: (schema) => schema.notRequired(),
          }),
          code: yup.string().when(['batch_id', 'managed_in_batch'], {
            is: (batch_id: number, managed_in_batch: number) =>
              !batch_id && managed_in_batch,
            then: (schema) => schema.required(t('common:validation.required')),
            otherwise: (schema) => schema.notRequired(),
          }),
          expired_date: yup
            .date()
            .typeError(t('common:validation.message_invalid_date'))
            .when(['batch_id', 'managed_in_batch'], {
              is: (batch_id: number, managed_in_batch: number) =>
                !batch_id && managed_in_batch,
              then: (schema) =>
                schema
                  .required(t('common:validation.required'))
                  .min(
                    getTodayDate(),
                    t('transactionCreateAddStock:error_expired_date')
                  ),
              otherwise: (schema) => schema.notRequired(),
            }),
          production_date: yup
            .date()
            .nullable()
            .typeError(t('common:validation.message_invalid_date'))
            .when(['batch_id'], {
              is: (batch_id: number) => !batch_id,
              then: (schema) =>
                schema.max(
                  new Date(),
                  t('transactionCreateAddStock:error_production_date')
                ),
            }),
          manufacturer: yup
            .object({
              label: yup.string().nullable(),
              value: yup.number(),
            })
            .when(['batch_id', 'managed_in_batch'], {
              is: (batch_id: number, managed_in_batch: number) =>
                !batch_id && managed_in_batch,
              then: (schema) =>
                schema.required(t('common:validation.required')),
              otherwise: (schema) => schema.notRequired(),
            }),
          change_qty: yup
            .number()
            .nullable()
            .typeError(t('common:validation.numeric_only'))
            .min(0, t('common:validation.numeric_cannot_negative'))
            .when(['pieces_per_unit'], (pieces_per_unit, schema) =>
              schema.test({
                test: (change_qty) =>
                  !change_qty ||
                  (Number(change_qty) > 0 &&
                    Number(change_qty) % Number(pieces_per_unit) === 0),
                message: t(
                  'transactionCreateAddStock:validation.quantity_must_multiply',
                  { number: pieces_per_unit }
                ),
              })
            ),
          status_material: yup
            .object({
              value: yup.number(),
              label: yup.string().nullable(),
            })
            .when(['temperature_sensitive', 'change_qty'], {
              is: (temperature_sensitive: number, change_qty: number) =>
                change_qty && Number(temperature_sensitive) === STATUS.ACTIVE,
              then: (schema) =>
                schema.required(t('common:validation.required')),
              otherwise: (schema) => schema.notRequired(),
            }),
          budget_source: yup
            .object({
              value: yup.number(),
              label: yup.string(),
            })
            .nullable()
            .when(
              ['transaction_reason'],
              (transaction_reason, schema, context: any) => {
                return schema.test({
                  test: (budget_source) => {
                    const batch = context.from[1].value

                    const transactionReason = transaction_reason?.[0]?.value

                    const isOthersBudgetSourceField = !batch.change_qty
                    const transactionReasonIsPurchase =
                      transactionReason &&
                      transactionReason?.is_purchase === STATUS.INACTIVE
                    const condition =
                      !transactionReason ||
                      transactionReasonIsPurchase ||
                      isOthersBudgetSourceField ||
                      !!budget_source

                    return condition
                  },
                  message: `${t('common:validation.required')}`,
                })
              }
            ),
          budget_source_year: yup
            .object({
              value: yup.number(),
              label: yup.string(),
            })
            .when(['budget_source', 'transaction_reason'], {
              is: (budget_source: string, transaction_reason: any) =>
                !!budget_source &&
                transaction_reason?.[0]?.value?.is_purchase === STATUS.ACTIVE,
              then: (schema) =>
                schema.required(t('common:validation.required')),
              otherwise: (schema) => schema.notRequired(),
            }),
          budget_source_price: yup
            .number()
            .typeError(t('common:validation.numeric_only'))
            .min(0, t('common:validation.numeric_cannot_negative'))
            .when(['budget_source', 'transaction_reason'], {
              is: (budget_source: string, transaction_reason: any) =>
                !!budget_source &&
                transaction_reason?.[0]?.value?.is_purchase === STATUS.ACTIVE,
              then: (schema) =>
                schema.required(t('common:validation.required')),
              otherwise: (schema) => schema.notRequired(),
            }),
        })
      )
      .test(
        'at-least-one-change_qty',
        t('common:validation.required'),
        (batches) => {
          if (!batches) return false
          return batches.some(
            (batch) =>
              batch.change_qty !== null && batch.change_qty !== undefined
          )
        }
      ),
  })

export const formSchemaAddStockNewBatch = (
  t: TFunction<['transactionCreateAddStock', 'common']>
) =>
  yup.object().shape({
    code: yup.string().required(t('common:validation.required')),
    production_date: yup
      .date()
      .nullable()
      .typeError(t('common:validation.message_invalid_date'))
      .max(new Date(), t('transactionCreateAddStock:error_production_date')),
    expired_date: yup
      .date()
      .required(t('common:validation.required'))
      .typeError(t('common:validation.message_invalid_date'))
      .min(getTodayDate(), t('transactionCreateAddStock:error_expired_date')),
    manufacturer: yup
      .object({
        label: yup.string().nullable(),
        value: yup.number(),
      })
      .required(t('common:validation.required')),
  })

export const formSchemaAddStockBudgetSource = (t: TFunction<'common'>) =>
  yup.object().shape({
    is_purchase: yup.bool().nullable(),
    budget_source: yup
      .object({
        value: yup.number(),
        label: yup.string(),
      })
      .nullable()
      .when('is_purchase', {
        is: true,
        then: (schema) => schema.required(t('validation.required')),
        otherwise: (schema) => schema.notRequired(),
      }),
    budget_source_year: yup
      .object({
        value: yup.number(),
        label: yup.string(),
      })
      .nullable()
      .when('is_purchase', {
        is: true,
        then: (schema) => schema.required(t('validation.required')),
        otherwise: (schema) => schema.notRequired(),
      }),
    budget_source_price: yup
      .number()
      .transform((value, originalValue) => {
        return originalValue === '' || originalValue === null
          ? undefined
          : Number(originalValue)
      })
      .typeError(t('validation.numeric_only'))
      .min(0, t('validation.numeric_cannot_negative'))
      .when('is_purchase', {
        is: (val: boolean | string | null) => val === true || val === 'true',
        then: (schema) => schema.required(t('validation.required')),
        otherwise: (schema) => schema.notRequired(),
      }),
  })
