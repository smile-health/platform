import { TFunction } from 'i18next'
import * as yup from 'yup'

import { getTodayDate } from '../helper/util'

export const defaultValuesForm = {
  entity: null,
  periode: null,
  new_opname_items: [],
}

export const formSchema = (t: TFunction<['common', 'stockOpnameCreate']>) =>
  yup.object({
    entity: yup
      .object({
        value: yup.number(),
        label: yup.string(),
      })
      .required(t('common:validation.required')),
    periode: yup
      .object({
        value: yup.number(),
        label: yup.string(),
      })
      .required(t('common:validation.required')),
    new_opname_items: yup.array().of(
      yup.object().shape({
        is_valid: yup
          .boolean()
          .oneOf([true], t('common:validation.required'))
          .required(t('common:validation.required')),
      })
    ),
  })

export const formStocksSchema = (
  t: TFunction<['common', 'stockOpnameCreate']>
) =>
  yup.object({
    new_opname_stocks: yup.array().of(
      yup.object().shape({
        pieces_per_unit: yup.number().notRequired(),
        recorded_qty: yup.number(),
        actual_qty: yup
          .number()
          .typeError(t('common:validation.required'))
          .when('pieces_per_unit', ([pieces_per_unit], schema) => {
            return schema
              .test(
                'qty-unit',
                t('stockOpnameCreate:form.transaction.validation.qty_unit', {
                  amount: pieces_per_unit,
                }),
                (actual_qty) =>
                  !actual_qty ||
                  (actual_qty > 0 && actual_qty % pieces_per_unit === 0)
              )
              .when('recorded_qty', ([recorded_qty], schema) =>
                recorded_qty > 0
                  ? schema.required(t('common:validation.required'))
                  : schema.notRequired()
              )
          }),
      })
    ),
  })

export const formStockBatchSchema = (
  t: TFunction<['common', 'stockOpnameCreate']>
) =>
  yup.object({
    populated_batch: yup.array().of(
      yup.object().shape({
        activity_id: yup.number(),
        batch_code: yup.string(),
      })
    ),
    is_batch: yup.boolean().notRequired(),
    activity: yup
      .object({
        label: yup.string().nullable(),
        value: yup.number(),
      })
      .required(t('common:validation.required'))
      .test(
        'unique-activity-batch',
        t('stockOpnameCreate:form.new_batch.validation.activity_alread_exist'),
        function (value) {
          const { batch_code, populated_batch } = this.parent;
          if (!value?.value || !batch_code) return true;

          return !populated_batch?.some(
            (item: any) =>
              item.activity_id === value.value && item.batch_code === batch_code
          );
        }
      ),
    batch_code: yup
      .string()
      .when('is_batch', ([is_batch], schema) => {
        return is_batch
          ? schema.required(t('common:validation.required'))
          : schema.notRequired()
      })
      .test(
        'unique-activity-batch',
        t('stockOpnameCreate:form.new_batch.validation.batch_code_alread_exist'),
        function (value) {
          const { activity, populated_batch } = this.parent
          if (!value || !activity?.value) return true

          return !populated_batch?.some(
            (item: any) =>
              item.activity_id === activity.value && item.batch_code === value
          )
        }
      ),
    expired_date: yup.date().when('is_batch', ([is_batch], schema) => {
      return is_batch
        ? schema
            .typeError(t('common:validation.message_invalid_date'))
            .required(t('common:validation.required'))
            .typeError(t('common:validation.message_invalid_date'))
            .min(
              getTodayDate(),
              t('stockOpnameCreate:form.new_batch.validation.expired_date')
            )
        : schema.notRequired()
    }),
  })
