import { parseDate } from '@internationalized/date'
import { DatePicker } from '#components/date-picker'
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '#components/form-control'
import { H5 } from '#components/heading'
import { Input } from '#components/input'
import { ReactSelect, ReactSelectAsync } from '#components/react-select'
import { loadEntities, loadEntityCustomer } from '#services/entity'
import { hasPermission } from '#shared/permission/index'
import { isValidDate, parseDateTime } from '#utils/date'
import { clearField } from '#utils/form'
import { Controller, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import useEntityActivites from '../../hooks/useEntityActivities'
import { TOrderFormValues } from '../order-create-distribution.type'

export default function OrderCreateDistributionInput() {
  const { t } = useTranslation('orderDistribution')

  const {
    control,
    watch,
    register,
    setValue,
    clearErrors,
    formState: { errors },
  } = useFormContext<TOrderFormValues>()

  const { vendor, activity, order_items } = watch()

  const { data: entityActivities, isLoading } = useEntityActivites(
    vendor?.value,
    'distribution'
  )

  const today = new Date()

  return (
    <div className="ui-p-6 ui-border ui-border-neutral-300 ui-rounded ui-space-y-6">
      <H5>{t('section.detail')}</H5>
      <Controller
        name="vendor"
        control={control}
        render={({
          field: { ref, onChange, ...field },
          fieldState: { error },
        }) => (
          <FormControl className="ui-space-y-1">
            <FormLabel htmlFor="select-vendor" required>
              {t('form.vendor.label')}
            </FormLabel>
            <ReactSelectAsync
              {...field}
              id="select-vendor"
              data-testid="select-vendor"
              selectRef={ref}
              disabled={!hasPermission('order-enable-select-vendor')}
              placeholder={t('form.vendor.placeholder')}
              error={Boolean(error)}
              loadOptions={loadEntities}
              onChange={(value) => {
                onChange(value)
                clearField({
                  setValue,
                  name: ['activity', 'customer'],
                })
                if (order_items?.length) {
                  clearErrors('order_items')
                  clearField({
                    setValue,
                    name: ['order_items'],
                    resetValue: [],
                  })
                }
              }}
              isClearable
              additional={{
                page: 1,
                is_vendor: 1,
              }}
            />
            {error && <FormErrorMessage>{error?.message}</FormErrorMessage>}
          </FormControl>
        )}
      />

      <Controller
        name="activity"
        control={control}
        render={({
          field: { onChange, value, ...field },
          fieldState: { error },
        }) => (
          <FormControl className="ui-space-y-1">
            <FormLabel htmlFor="select-activity" required>
              {t('form.activity.label')}
            </FormLabel>
            <ReactSelect
              {...field}
              id="select-activity"
              data-testid="select-activity"
              placeholder={t('form.activity.placeholder')}
              error={Boolean(error)}
              options={entityActivities}
              value={value ?? null}
              isLoading={isLoading}
              onChange={(value) => {
                onChange(value)
                clearField({
                  setValue,
                  name: ['customer'],
                })
                if (order_items?.length) {
                  clearErrors('order_items')
                  clearField({
                    setValue,
                    name: ['order_items'],
                    resetValue: [],
                  })
                }
              }}
              isClearable
            />
            {error && <FormErrorMessage>{error?.message}</FormErrorMessage>}
            <p className="ui-text-neutral-500 ui-text-sm ui-italic">
              {t('form.activity.info')}
            </p>
          </FormControl>
        )}
      />

      <Controller
        name="customer"
        control={control}
        render={({
          field: { ref, onChange, ...field },
          fieldState: { error },
        }) => (
          <FormControl className="ui-space-y-1">
            <FormLabel htmlFor="select-customer" required>
              {t('form.customer.label')}
            </FormLabel>
            <ReactSelectAsync
              {...field}
              key={vendor?.value + activity?.value}
              id="select-customer"
              data-testid="select-customer"
              selectRef={ref}
              placeholder={t('form.customer.placeholder')}
              error={Boolean(error)}
              loadOptions={loadEntityCustomer}
              isClearable
              onChange={(value) => {
                onChange(value)
                if (order_items?.length) {
                  clearErrors('order_items')
                  clearField({
                    setValue,
                    name: ['order_items'],
                    resetValue: [],
                  })
                }
              }}
              additional={{
                id: vendor?.value,
                page: 1,
                is_consumption: 0,
                activity_id: activity?.value,
              }}
            />
            {error && <FormErrorMessage>{error?.message}</FormErrorMessage>}
          </FormControl>
        )}
      />

      <Controller
        name="required_date"
        control={control}
        render={({
          field: { value, onChange, ...field },
          fieldState: { error },
        }) => (
          <FormControl className="ui-space-y-1">
            <FormLabel htmlFor="date-picker">{t('form.date.label')}</FormLabel>
            <DatePicker
              {...field}
              id="date-picker"
              data-testid="date-picker"
              minValue={parseDate(
                parseDateTime(today.toString(), 'YYYY-MM-DD')
              )}
              value={value && isValidDate(value) ? parseDate(value) : null}
              onChange={(date) => {
                const newDate = date as unknown as string
                onChange(parseDateTime(newDate, 'YYYY-MM-DD'))
              }}
            />
            {error && <FormErrorMessage>{error?.message}</FormErrorMessage>}
          </FormControl>
        )}
      />
      <FormControl className="ui-space-y-1">
        <FormLabel htmlFor="input-comment">{t('form.comment.label')}</FormLabel>
        <Input
          {...register('order_comment')}
          id="input-comment"
          data-testid="input-comment"
          placeholder={t('form.comment.placeholder')}
          error={Boolean(errors?.order_comment)}
        />
        {errors?.order_comment && (
          <FormErrorMessage>{errors?.order_comment?.message}</FormErrorMessage>
        )}
      </FormControl>
    </div>
  )
}
