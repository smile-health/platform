import dayjs from 'dayjs'
import { TFunction } from 'i18next'
import * as Yup from 'yup'

export const periodOfStockTakingFormValidation = (
  t: TFunction<['common', 'periodOfStockTaking']>
) =>
  Yup.object().shape({
    month_period: Yup.object()
      .shape({
        value: Yup.string(),
        label: Yup.string(),
      })
      .required(t('common:validation.required')),
    year_period: Yup.object()
      .shape({
        value: Yup.string(),
        label: Yup.string(),
      })
      .required(t('common:validation.required')),
    period_range: Yup.object()
      .shape({
        start_date: Yup.mixed(),
        end_date: Yup.mixed(),
      })
      .nullable()
      .test({
        name: 'period-range-required',
        test: function (value) {
          const { path, createError } = this
          if (!!value?.start_date && !!value?.end_date) {
            return true
          }
          return createError({
            path,
            message: t('common:validation.required'),
          })
        },
      })
      .test({
        name: 'start-date-before-end-date',
        test: function (value) {
          const { path, createError } = this
          if (
            dayjs(value?.start_date).isBefore(dayjs(value?.end_date)) ||
            dayjs(value?.start_date).isSame(dayjs(value?.end_date))
          ) {
            return true
          }
          return createError({
            path,
            message: t(
              'periodOfStockTaking:validation.start_date_before_end_date'
            ),
          })
        },
      })
      .test({
        name: 'period-range-includes-cutoff',
        test: function (value) {
          const { path, createError, parent } = this
          const cutoffDate = parent?.cutoff_date
          
          if (!value?.start_date || !value?.end_date || !cutoffDate) return true

          const start = dayjs(value.start_date).startOf('day')
          const end = dayjs(value.end_date).startOf('day')
          const cutoff = dayjs(cutoffDate).startOf('day')

          if (start.isAfter(cutoff) || end.isBefore(cutoff)) {
            return createError({
              path,
              message: t('periodOfStockTaking:validation.period_range_cutoff_validate'),
            })
          }

          return true
        },
      }),
    cutoff_date: Yup.mixed()
      .nullable()
      .required(t('common:validation.required'))
      .test({
        name: 'cutoff-date-within-range',
        test: function (value) {
          const { path, createError, parent } = this
          const startDate = parent?.period_range?.start_date
          const endDate = parent?.period_range?.end_date
          const cutoffTime = parent?.cutoff_time

          if (!value || !cutoffTime || !startDate || !endDate) return true // skip if missing

          const cutoff = dayjs(value).startOf('day')
          const start = dayjs(startDate).startOf('day')
          const end = dayjs(endDate).startOf('day')

          if (
            (cutoff.isAfter(start) || cutoff.isSame(start)) &&
            (cutoff.isBefore(end) || cutoff.isSame(end))
          ) {
            return true
          }

          return createError({
            path,
            message: t('periodOfStockTaking:cut_off_time_validate'),
          })
        },
      }),
    cutoff_time: Yup.string()
      .nullable()
      .required(t('common:validation.required'))
      .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/, t('periodOfStockTaking:invalid_time_format')),
  })

export default {}
