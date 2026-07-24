import { useState } from 'react'
import { parseDate } from '@internationalized/date'
import { useQuery } from '@tanstack/react-query'
import { DatePicker } from '#components/date-picker'
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '#components/form-control'
import { H5 } from '#components/heading'
import { Input } from '#components/input'
import {
  OptionType,
  ReactSelect,
  ReactSelectAsync,
} from '#components/react-select'
import { useProgram } from '#hooks/program/useProgram'
import { loadEntities, loadEntityCustomer } from '#services/entity'
import { hasPermission } from '#shared/permission/index'
import { isValidDate, parseDateTime } from '#utils/date'
import { clearField } from '#utils/form'
import { Controller, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import useEntityActivites from '../../hooks/useEntityActivities'
import { listOrderDeliveryTypes } from '../../order.service'
import { loadContractNumbers } from '../order-create-central-distribution.service'
import { TOrderFormValues } from '../order-create-central-distribution.type'

export default function OrderCreateCentralDistributionInput() {
  const { t } = useTranslation('orderCentralDistribution')
  const { activeProgram } = useProgram()
  const isHierarchyEnabled =
    activeProgram?.config?.material?.is_hierarchy_enabled

  const {
    control,
    watch,
    register,
    setValue,
    clearErrors,
    formState: { errors },
  } = useFormContext<TOrderFormValues>()

  const { vendor, activity, order_items } = watch()

  const {
    data: deliveryTypes,
    isLoading: isLoadingDeliveryTypes,
    isFetching: isFetchingDeliveryTypes,
  } = useQuery({
    queryKey: ['delivery-type'],
    queryFn: () => listOrderDeliveryTypes(),
    select: (res) => {
      return res?.data?.map((item) => ({
        label: item?.name,
        value: item?.id,
      }))
    },
  })

  const { data: entityActivities, isLoading } = useEntityActivites(
    vendor?.value,
    'central_distribution'
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
                clearErrors(['activity', 'customer', 'order_items'])
                clearField({
                  setValue,
                  name: ['activity', 'customer', 'order_items'],
                  resetValue: [null, null, []],
                })
              }}
              isClearable
              additional={{
                page: 1,
                is_vendor: 1,
                ...(isHierarchyEnabled && { type_ids: 5 }),
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
          field: { value, onChange, ...field },
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
              isLoading={isLoading}
              value={value || null}
              onChange={(value) => {
                onChange(value)
                clearErrors(['customer', 'order_items'])
                clearField({
                  setValue,
                  name: ['customer', 'order_items'],
                  resetValue: [null, []],
                })
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
                    name: 'order_items',
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
        name="delivery_type_id"
        control={control}
        render={({
          field: { value, onChange, ...field },
          fieldState: { error },
        }) => (
          <FormControl className="ui-space-y-1">
            <FormLabel htmlFor="select-delivery-type" required>
              {t('form.delivery.label')}
            </FormLabel>
            <ReactSelect
              {...field}
              data-testid="select-delivery-type"
              placeholder={t('form.delivery.placeholder')}
              options={deliveryTypes}
              isLoading={isLoadingDeliveryTypes || isFetchingDeliveryTypes}
              value={deliveryTypes?.find((role) => role?.value === value)}
              onChange={(option: OptionType) => onChange(option?.value)}
            />

            {error?.message && (
              <FormErrorMessage>{error?.message}</FormErrorMessage>
            )}
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
            <FormLabel htmlFor="required-date">
              {t('form.date.required.label')}
            </FormLabel>
            <DatePicker
              {...field}
              id="required-date"
              data-testid="required-date"
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
        <FormLabel htmlFor="input-do" required>
          {t('form.do.label')}
        </FormLabel>
        <Input
          {...register('do_number')}
          id="input-do"
          data-testid="input-do"
          placeholder={t('form.do.placeholder')}
          error={Boolean(errors?.do_number)}
        />
        {errors?.do_number && (
          <FormErrorMessage>{errors?.do_number?.message}</FormErrorMessage>
        )}
      </FormControl>

      <Controller
        name="po_number"
        control={control}
        render={({ field: { ref, ...field }, fieldState: { error } }) => {
          const [newPoNumber, setNewPoNumber] = useState<string | undefined>(
            undefined
          )
          return (
            <FormControl className="ui-space-y-1">
              <FormLabel htmlFor="select-po-number">
                {t('form.po.label')}
              </FormLabel>
              <ReactSelectAsync
                {...field}
                onChange={(value) => {
                  if (
                    value?.label?.includes(
                      t('label.option.create', {
                        value: newPoNumber,
                      }) as string
                    )
                  ) {
                    field.onChange({
                      label: value?.value,
                      value: value?.value,
                    })
                  } else {
                    field.onChange(value)
                  }
                }}
                key={vendor?.value + activity?.value}
                id="select-po-number"
                data-testid="select-po-number"
                selectRef={ref}
                onInputChange={(value: string) => {
                  setNewPoNumber(value)
                }}
                placeholder={t('form.po.placeholder')}
                error={Boolean(error)}
                loadOptions={loadContractNumbers}
                isClearable
                additional={{
                  page: 1,
                  ...(newPoNumber && {
                    po_number: newPoNumber,
                    label: t('label.option.create', {
                      value: newPoNumber,
                    }) as string,
                  }),
                }}
              />
              {error && <FormErrorMessage>{error?.message}</FormErrorMessage>}
            </FormControl>
          )
        }}
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
