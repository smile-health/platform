import React, { useState } from 'react'
import { useFeatureIsOn } from '@growthbook/growthbook-react'
import { yupResolver } from '@hookform/resolvers/yup'
import { CalendarDate, DateValue, parseDate } from '@internationalized/date'
import { Checkbox } from '@repo/ui/components/checkbox'
import { Button } from '#components/button'
import { DatePicker, DateRangePicker } from '#components/date-picker'
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '#components/form-control'
import { Input } from '#components/input'
import { OptionType, ReactSelect } from '#components/react-select'
import { BOOLEAN } from '#constants/common'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import useSmileRouter from '#hooks/useSmileRouter'
import dayjs from 'dayjs'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { PatternFormat } from 'react-number-format'

import { MONTH } from '../../list/libs/period-of-stock-taking-list.constants'
import { TPeriodOfStockTakingData } from '../../list/libs/period-of-stock-taking-list.type'
import { useSubmitPeriodOfStockTaking } from '../hooks/useSubmitPeriodOfStockTaking'
import {
  generatedMonthOptions,
  generatedYearOptions,
  internationalizedDateFromISO,
  processingForm,
} from '../libs/period-of-stock-taking-form.common'
import {
  PeriodOfStockTakingFormData,
  PeriodOfStockTakingSubmitData,
} from '../libs/period-of-stock-taking-form.type'
import { periodOfStockTakingFormValidation } from '../libs/period-of-stock-taking-form.validation-schema'
import PeriodOfStockTakingSubmitAndActivateConfirmation from './PeriodOfStockTakingSubmitAndActivateConfirmation'

type PeriodOfStockTakingFormProps = {
  data?: TPeriodOfStockTakingData | null
}

const PeriodOfStockTakingForm: React.FC<PeriodOfStockTakingFormProps> = ({
  data,
}) => {
  const {
    t,
    i18n: { language },
  } = useTranslation(['common', 'periodOfStockTaking'])
  const isHideTime = useFeatureIsOn('msdso.hide.time')
  const router = useSmileRouter()
  const { action } = router.query
  const methods = useForm<PeriodOfStockTakingFormData>({
    mode: 'onChange',
    defaultValues: {
      id: data?.id ? Number(data?.id) : null,
      month_period: data?.month_period
        ? generatedMonthOptions(language).find(
            (option) => Number(option.value) === Number(data?.month_period)
          )
        : null,
      year_period: data?.year_period
        ? generatedYearOptions().find(
            (option) => Number(option.value) === Number(data?.year_period)
          )
        : null,
      status: data?.status ?? 0,
      period_range: {
        start_date: data?.start_date
          ? internationalizedDateFromISO(dayjs(data?.start_date).toISOString())
          : null,
        end_date: data?.end_date
          ? internationalizedDateFromISO(dayjs(data?.end_date).toISOString())
          : null,
      },
      cutoff_date: data?.cutoff_date
        ? parseDate(data?.cutoff_date.substring(0, 10))
        : null,
      cutoff_time: data?.cutoff_date
        ? data.cutoff_date.substring(11, 16)
        : isHideTime
          ? '23:59:59'
          : null,
    },
    resolver: yupResolver(periodOfStockTakingFormValidation(t)) as any,
  })
  const {
    control,
    watch,
    setValue,
    handleSubmit,
    setError,
    trigger,
    formState: { errors },
  } = methods

  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false)

  const { submitPeriodOfStockTaking, pendingPeriodOfStockTaking } =
    useSubmitPeriodOfStockTaking({ t, language, setError: setError as any })

  const onSubmit = (data: PeriodOfStockTakingFormData) => {
    const processedData = processingForm(data)
    submitPeriodOfStockTaking(processedData as PeriodOfStockTakingSubmitData)
  }

  const shouldConfirm =
    (action === 'edit' && watch('status') === BOOLEAN.FALSE) ||
    (action !== 'edit' && watch('status') === BOOLEAN.TRUE)

  useSetLoadingPopupStore(pendingPeriodOfStockTaking)

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit as any)}>
        <PeriodOfStockTakingSubmitAndActivateConfirmation
          open={isConfirmationOpen}
          setOpen={setIsConfirmationOpen}
          onSubmit={handleSubmit(onSubmit as any)}
        />
        <div className="ui-w-full ui-space-y-6 ui-max-w-form ui-mx-auto ui-border ui-border-neutral-300 ui-rounded-md ui-p-6">
          <h2 className="ui-text-lg ui-font-semibold ui-text-dark-teal ui-mb-6 ui-block">
            {t('periodOfStockTaking:form.stock_taking_period_details')}
          </h2>
          <FormControl className="ui-w-full ui-mb-6">
            <FormLabel htmlFor="month_period" required={action !== 'edit'}>
              {t('periodOfStockTaking:form.month')}
            </FormLabel>
            <Controller
              name="month_period"
              control={control}
              render={({ field }) => (
                <ReactSelect
                  {...field}
                  id="month_period"
                  isClearable
                  isSearchable
                  disabled={action === 'edit'}
                  value={
                    field.value
                      ? {
                          value: field.value?.value ?? null,
                          label:
                            generatedMonthOptions(language).find(
                              (option) =>
                                Number(option.value) ===
                                Number(field.value?.value)
                            )?.label ?? '',
                        }
                      : null
                  }
                  options={generatedMonthOptions(language)}
                  onChange={(option: OptionType) => {
                    field.onChange(option)
                    if (watch('year_period')?.value && option?.value) {
                      setValue(
                        'period_range.start_date',
                        internationalizedDateFromISO(
                          dayjs(
                            `${watch('year_period')?.value}-${option?.value}-25`
                          ).toISOString()
                        )
                      )
                      setValue(
                        'period_range.end_date',
                        internationalizedDateFromISO(
                          dayjs(
                            `${watch('year_period')?.value}-${Number(option?.value) + 1}-10`
                          ).toISOString()
                        )
                      )
                    }
                  }}
                  placeholder={t('periodOfStockTaking:form.select_month')}
                />
              )}
            />
            {errors?.month_period?.message && (
              <FormErrorMessage>
                {errors?.month_period?.message}
              </FormErrorMessage>
            )}
          </FormControl>
          <FormControl className="ui-w-full ui-mb-6">
            <FormLabel htmlFor="year_period" required={action !== 'edit'}>
              {t('periodOfStockTaking:form.year')}
            </FormLabel>
            <Controller
              name="year_period"
              control={control}
              render={({ field }) => (
                <ReactSelect
                  {...field}
                  id="year_period"
                  isClearable
                  isSearchable
                  disabled={action === 'edit'}
                  options={generatedYearOptions()}
                  onChange={(option: OptionType) => {
                    field.onChange(option)
                    if (watch('month_period')?.value && option?.value) {
                      setValue(
                        'period_range.start_date',
                        internationalizedDateFromISO(
                          dayjs(
                            `${option?.value}-${watch('month_period')?.value}-25`
                          ).toISOString()
                        )
                      )
                      setValue(
                        'period_range.end_date',
                        internationalizedDateFromISO(
                          dayjs(
                            `${option?.value}-${Number(watch('month_period')?.value) + 1}-10`
                          ).toISOString()
                        )
                      )
                    }
                  }}
                  placeholder={t('periodOfStockTaking:form.select_year')}
                />
              )}
            />
            {errors?.year_period?.message && (
              <FormErrorMessage>
                {errors?.year_period?.message}
              </FormErrorMessage>
            )}
          </FormControl>
          <FormControl className="ui-w-full ui-mb-6">
            <FormLabel htmlFor="period_range" required>
              {t('periodOfStockTaking:form.period_range')}
            </FormLabel>
            <DateRangePicker
              id="period_range_period"
              isDisabled={
                !watch('month_period')?.value || !watch('year_period')?.value
              }
              minValue={
                watch('year_period')?.value && watch('month_period')?.value
                  ? (() => {
                      const monthValue =
                        action === 'edit'
                          ? MONTH.JANUARY
                          : watch('month_period')?.value
                      return parseDate(
                        `${watch('year_period')?.value}-${String(monthValue).padStart(2, '0')}-01`
                      )
                    })()
                  : undefined
              }
              maxValue={
                watch('year_period')?.value && watch('month_period')?.value
                  ? parseDate(`${watch('year_period')?.value + 1}-12-31`)
                  : undefined
              }
              value={
                watch('period_range.start_date') &&
                watch('period_range.end_date')
                  ? {
                      start: watch('period_range.start_date') as DateValue,
                      end: watch('period_range.end_date') as DateValue,
                    }
                  : null
              }
              onChange={(value) => {
                setValue(
                  'period_range.start_date',
                  (value?.start as CalendarDate) ?? null
                )
                setValue(
                  'period_range.end_date',
                  (value?.end as CalendarDate) ?? null
                )
                trigger('period_range')
              }}
              onBlur={() => trigger('period_range')}
            />
            {errors?.period_range?.message && (
              <FormErrorMessage>
                {errors?.period_range?.message}
              </FormErrorMessage>
            )}
          </FormControl>
          <FormControl className="ui-w-full ui-mb-6">
            <FormLabel htmlFor="cutoff_date" required>
              {t('periodOfStockTaking:cut_off_time')}
            </FormLabel>
            <div className="ui-flex ui-items-center ui-gap-4">
              <div className="ui-flex-1">
                <Controller
                  name="cutoff_date"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      id="cutoff_date"
                      value={field.value}
                      isDisabled={
                        !watch('period_range.start_date') ||
                        !watch('period_range.end_date') ||
                        !!data?.id
                      }
                      onChange={(value) => {
                        field.onChange(value)
                        trigger('cutoff_date')
                      }}
                      error={!!errors?.cutoff_date}
                    />
                  )}
                />
              </div>
              {!isHideTime && (
                <>
                  <span className="ui-text-sm ui-text-gray-500">
                    {' '}
                    {t('periodOfStockTaking:at')}
                  </span>
                  <div className="ui-w-32">
                    <Controller
                      name="cutoff_time"
                      control={control}
                      render={({ field }) => (
                        <PatternFormat
                          format="##:##"
                          mask="_"
                          customInput={Input}
                          id="cutoff_time"
                          placeholder="hh:mm"
                          disabled={
                            !watch('period_range.start_date') ||
                            !watch('period_range.end_date') ||
                            !!data?.id
                          }
                          value={field.value ?? ''}
                          onValueChange={(values) => {
                            field.onChange(values.formattedValue)
                            trigger('cutoff_time')
                          }}
                          error={!!errors?.cutoff_time}
                        />
                      )}
                    />
                  </div>
                </>
              )}
            </div>
            {(errors?.cutoff_date?.message || errors?.cutoff_time?.message) && (
              <FormErrorMessage>
                {String(
                  errors?.cutoff_date?.message || errors?.cutoff_time?.message
                )}
              </FormErrorMessage>
            )}
          </FormControl>
          <FormControl className="ui-w-full ui-mb-6">
            <FormLabel htmlFor="status">
              {t('periodOfStockTaking:form.period_activation')}
            </FormLabel>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Checkbox
                  {...field}
                  id="status_period"
                  checked={field.value === BOOLEAN.TRUE}
                  onChange={(e) => {
                    field.onChange(
                      e.target.checked ? BOOLEAN.TRUE : BOOLEAN.FALSE
                    )
                  }}
                  className="ui-text-sm ui-font-normal"
                  label={t(
                    'periodOfStockTaking:form.activate_period_automatically'
                  )}
                />
              )}
            />
            {errors?.status?.message && (
              <FormErrorMessage>{errors?.status?.message}</FormErrorMessage>
            )}
          </FormControl>
        </div>
        <div className="ui-mt-2 ui-flex ui-justify-end ui-items-end ui-max-w-form ui-mx-auto ui-gap-4">
          <Button
            type="button"
            variant="outline"
            className="ui-mt-4 ui-w-40 ui-text-primary-500 hover:!ui-bg-gray-100"
            onClick={() => {
              router.push('/v5/period-of-stock-taking')
            }}
          >
            {t('common:back')}
          </Button>
          <Button
            type={shouldConfirm ? 'button' : 'submit'}
            variant="solid"
            className="ui-mt-4 ui-w-40 ui-bg-primary-500 ui-text-white hover:ui-bg-primary-600"
            onClick={() => {
              if (shouldConfirm) {
                setIsConfirmationOpen(true)
              }
            }}
          >
            {t('common:save')}
          </Button>
        </div>
      </form>
    </FormProvider>
  )
}

export default PeriodOfStockTakingForm
