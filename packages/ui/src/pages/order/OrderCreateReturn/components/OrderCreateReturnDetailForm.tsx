import React, { Fragment } from 'react'
import { parseDate } from '@internationalized/date'
import { DatePicker } from '#components/date-picker'
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '#components/form-control'
import { Input } from '#components/input'
import {
  OptionType,
  ReactSelect,
  ReactSelectAsync,
} from '#components/react-select'
import { TDetailActivityDate } from '#types/entity'
import { isValidDate } from '#utils/date'
import dayjs from 'dayjs'
import {
  Controller,
  UseFieldArrayRemove,
  useFormContext,
} from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import useEntityActivitesOption from '../hooks/useEntityActivitiesOption'
import { loadEntity, loadVendor } from '../order-create-return.service'
import { TOrderCreateReturnForm } from '../order-create-return.type'

export type OrderCreateReturnDetailFormProps = {
  isSuperAdmin?: boolean
  removeOrderItems: UseFieldArrayRemove
}

export default function OrderCreateReturnDetailForm({
  isSuperAdmin,
  removeOrderItems,
}: Readonly<OrderCreateReturnDetailFormProps>) {
  const { t } = useTranslation(['common', 'orderCreateReturn'])
  const {
    watch,
    formState: { errors },
    register,
    resetField,
    control,
  } = useFormContext<TOrderCreateReturnForm>()

  const { customer_id, activity_id } = watch()

  const entityActivities = useEntityActivitesOption(customer_id?.value)

  return (
    <div className="ui-border ui-border-[#d2d2d2] ui-w-1/2 ui-p-6 !ui-h-[32 rem]">
      <div className="ui-mb-4 ui-font-bold !ui-text-[#0C3045]">
        {t('orderCreateReturn:title.form')}
      </div>
      <FormControl className="ui-mb-4">
        <FormLabel required>
          {t('orderCreateReturn:form.vendor_id.label')}
        </FormLabel>
        <Controller
          name="customer_id"
          control={control}
          render={({
            field: { onChange, value, ...field },
            fieldState: { error },
          }) => {
            return (
              <Fragment>
                <ReactSelectAsync
                  {...field}
                  className="!ui-text-[#0C3045]"
                  id="select-customer_id"
                  key={customer_id?.value}
                  loadOptions={loadEntity}
                  disabled={!isSuperAdmin}
                  value={value as OptionType}
                  debounceTimeout={300}
                  placeholder={t(
                    'orderCreateReturn:form.vendor_id.placeholder'
                  )}
                  additional={{
                    page: 1,
                    is_vendor: 1,
                    isSuperAdmin,
                    defaultOptions: {
                      value: customer_id?.value || 0,
                      label: customer_id?.label || '',
                    },
                  }}
                  onChange={(option: OptionType) => {
                    onChange(option)
                    resetField('vendor_id')
                    resetField('activity_id')
                    removeOrderItems()
                  }}
                  menuPosition="fixed"
                  error={!!error?.message}
                />
                {error?.message && (
                  <FormErrorMessage>{error?.message}</FormErrorMessage>
                )}
              </Fragment>
            )
          }}
        />
      </FormControl>

      <FormControl className="ui-mb-4">
        <Controller
          control={control}
          name="activity_id"
          render={({
            field: { value, onChange, ...field },
            fieldState: { error },
          }) => (
            <FormControl>
              <FormLabel required>
                {t('orderCreateReturn:form.activity_id.label')}
              </FormLabel>
              <ReactSelect
                {...field}
                key={`${customer_id?.value}`}
                id="select-transaction-activity"
                className="!ui-text-[#0C3045]"
                placeholder={t(
                  'orderCreateReturn:form.activity_id.placeholder'
                )}
                options={entityActivities}
                onChange={(option: TDetailActivityDate) => {
                  onChange(option)
                  resetField('vendor_id')
                  resetField('order_items')
                  removeOrderItems()
                }}
                error={!!error?.message}
              />
              {error?.message && (
                <FormErrorMessage>{error?.message}</FormErrorMessage>
              )}
              <div className="mb-2 text-sm italic text-gray-500">
                {t(
                  'orderCreateReturn:form.activity_id.activity_entity_relation_info'
                )}
              </div>
            </FormControl>
          )}
        />
      </FormControl>

      <FormControl className="ui-mb-4">
        <FormLabel required>
          {t('orderCreateReturn:form.customer_id.label')}
        </FormLabel>
        <Controller
          name="vendor_id"
          control={control}
          render={({
            field: { value, onChange, ...field },
            fieldState: { error },
          }) => {
            return (
              <Fragment>
                <ReactSelectAsync
                  {...field}
                  className="!ui-text-[#0C3045]"
                  id="select-vendor_id"
                  key={`${customer_id?.value}-${activity_id?.value}`}
                  loadOptions={loadVendor}
                  debounceTimeout={300}
                  value={value as OptionType}
                  placeholder={t(
                    'orderCreateReturn:form.customer_id.placeholder'
                  )}
                  additional={{
                    page: 1,
                    id: customer_id?.value,
                  }}
                  onChange={(option: OptionType) => {
                    onChange(option)
                    resetField('order_items')
                    removeOrderItems()
                  }}
                  menuPosition="fixed"
                  error={!!error?.message}
                />
                {error?.message && (
                  <FormErrorMessage>{error?.message}</FormErrorMessage>
                )}
              </Fragment>
            )
          }}
        />
      </FormControl>

      <FormControl className="ui-mb-4">
        <FormLabel>{t('orderCreateReturn:form.required_date.label')}</FormLabel>
        <Controller
          name="required_date"
          control={control}
          render={({
            field: { onChange, value, ...field },
            fieldState: { error },
          }) => {
            return (
              <Fragment>
                <DatePicker
                  {...field}
                  id="datepicker-required_date"
                  value={value && isValidDate(value) ? parseDate(value) : null}
                  minValue={parseDate(dayjs(new Date()).format('YYYY-MM-DD'))}
                  onChange={(date) => {
                    const newDate = new Date(date?.toString())
                    onChange(dayjs(newDate).format('YYYY-MM-DD'))
                  }}
                  error={!!error?.message}
                />
                {error?.message && (
                  <FormErrorMessage>{error?.message}</FormErrorMessage>
                )}
              </Fragment>
            )
          }}
        />
      </FormControl>

      <FormControl className="ui-mb-4">
        <FormLabel>{t('orderCreateReturn:form.order_comment.label')}</FormLabel>
        <Input
          {...register('order_comment')}
          id="order_comment"
          type="text"
          placeholder={t('orderCreateReturn:form.order_comment.placeholder')}
          error={!!errors?.order_comment}
        />
      </FormControl>
    </div>
  )
}
