import { TFunction } from 'i18next'
import * as yup from 'yup'

export default function orderCreateCentralDistributionBatchSchema(
  t: TFunction<'orderCentralDistribution'>
) {
  return yup.object().shape({
    populated_batch: yup.array().of(
      yup.object().shape({
        manufacturer_id: yup.string(),
        batch_code: yup.string(),
      })
    ),
    manufacturer: yup
      .object({
        value: yup.string(),
        label: yup.string(),
      })
      .nullable()
      .when('$is_managed_in_batch', ([is_managed_in_batch], schema) => {
        return is_managed_in_batch
          ? schema.required(t('form.manufacturer.validation.required'))
          : schema
      })
      .test(
        'unique-manufacturer-batch',
        t('validation.manufacturer_alread_exist'),
        function (value) {
          const { batch_code, populated_batch } = this.parent
          if (!value?.value || !batch_code) return true

          return !populated_batch?.some(
            (item: any) =>
              item.activity_id == value.value && item.batch_code == batch_code
          )
        }
      ),
    batch_code: yup
      .string()
      .nullable()
      .when('$is_managed_in_batch', ([is_managed_in_batch], schema) => {
        return is_managed_in_batch
          ? schema.required(t('form.batch.id.validation.required'))
          : schema
      })
      .test(
        'unique-manufacturer-batch',
        t('validation.batch_code_alread_exist'),
        function (value) {
          const { manufacturer, populated_batch } = this.parent
          if (!value || !manufacturer?.value) return true

          return !populated_batch?.some(
            (item: any) =>
              item.manufacturer_id == manufacturer.value &&
              item.batch_code == value
          )
        }
      ),

    budget_source: yup
      .object({
        value: yup.string(),
        label: yup.string(),
      })
      .required(t('form.plan.source.validation.required')),

    budget_year: yup.string().required(t('form.plan.year.validation.required')),

    expired_date: yup
      .string()
      .nullable()
      .when('$is_managed_in_batch', ([is_managed_in_batch], schema) => {
        return is_managed_in_batch
          ? schema.required(t('form.date.expired.validation.required'))
          : schema
      })
      .test(
        'is-future-date',
        t('form.date.expired.validation.expired_date_can_not_be_in_past'),
        (value) => {
          if (!value) return true

          const [day, month, year] = value.split('-').reverse().map(Number)
          if (!day || !month || !year) return false

          const inputDate = new Date(year, month - 1, day)
          const today = new Date()
          today.setHours(0, 0, 0, 0)

          return inputDate > today
        }
      ),
    production_date: yup.string().nullable().notRequired(),
  })
}
