import React from 'react'
import { useRouter } from 'next/router'
import { parseDate } from '@internationalized/date'
import { DatePicker } from '#components/date-picker'
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '#components/form-control'
import {
  OptionType,
  ReactSelect,
  ReactSelectAsync,
} from '#components/react-select'
import { TDetailActivityDate, TEntityCustomer } from '#types/entity'
import { handleDateChange, parseValidDate } from '#utils/date'
import dayjs from 'dayjs'
import { Controller, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import useEntityActivitesOption from '../hooks/useEntityActivitesOption'
import { useModalWarningRemoveMaterialStore } from '../store/modal-warning.store'
import { TRANSACTION_TYPE } from '../transaction-create.constant'
import { loadCustomer, loadEntity } from '../transaction-create.service'
import { CreateTransctionForm } from '../transaction-create.type'
import TransactionCreateListProgram from './TransactionCreateListProgram'
import { reValidateQueryFetchInfiniteScroll } from '#components/infinite-scroll-list'

const TransactionCreateTransactionDetailForm = ({
  isSuperAdmin = false,
}: {
  isSuperAdmin: boolean
}) => {
  const { t } = useTranslation(['transactionCreate', 'transaction', 'common'])
  const { watch, setValue, control } = useFormContext<CreateTransctionForm>()
  const { entity, items, activity } = watch()
  const entityActivities = useEntityActivitesOption(entity?.value)
  const { setModalRemove, setCustomFunction, setContent } =
    useModalWarningRemoveMaterialStore()
  const { query } = useRouter()
  const { type } = query

  const resetItems = () =>
    items?.length > 0 ? setValue('items', []) : undefined

  const resetItemsWhenCustomerChange = [
    TRANSACTION_TYPE.RETURN_FROM_HEALTH_FACILITIES,
    TRANSACTION_TYPE.LAST_MILE,
  ].includes(Number(type))

  const handleEntityChange = (
    option: OptionType | null,
    onChange: (value: OptionType | null) => void
  ) => {
    onChange(option)
    setValue('activity', null)
    setValue('entity_activity_id', null)
    setValue('customer', null)
    setValue('destination_program_id', null)
    resetItems()
  }

  const handleActivityChange = (
    option: TDetailActivityDate,
    onChange: (id: TDetailActivityDate | null) => void
  ) => {
    onChange(option)
    setValue('entity_activity_id', option?.entity_activity_id)
    setValue('customer', null)
    setValue('is_open_vial_customer', false)
    if ([
      TRANSACTION_TYPE.ADD_STOCK,
      TRANSACTION_TYPE.REMOVE_STOCK,
      TRANSACTION_TYPE.DISCARD
    ].includes(Number(type))) {
      reValidateQueryFetchInfiniteScroll()
    }
    resetItems()
  }

  const handleCustomerChange = (
    option: (OptionType & TEntityCustomer) | null,
    onChange: (value: (OptionType & TEntityCustomer) | null) => void
  ) => {
    onChange(option)
    setValue('is_open_vial_customer', Boolean(option?.is_open_vial))
    if (Number(type) === TRANSACTION_TYPE.LAST_MILE) {
      reValidateQueryFetchInfiniteScroll()
    }
    if (resetItemsWhenCustomerChange) resetItems()
  }

  return (
    <div className="ui-w-full ui-p-4 ui-pb-4 ui-border ui-border-gray-300 ui-rounded">
      <div className="ui-font-bold">
        {t('transactionCreate:transaction_detail')}
      </div>
      <div className="ui-mt-6 ui-flex ui-flex-col ui-space-y-6">
        <Controller
          control={control}
          name="entity"
          render={({
            field: { value, onChange, ...field },
            fieldState: { error },
          }) => (
            <FormControl>
              <FormLabel htmlFor="select-transaction-entity" required>
                {t('transactionCreate:entity_name')}
              </FormLabel>
              <ReactSelectAsync
                {...field}
                key={`${entity?.value}`}
                id="select-transaction-entity"
                loadOptions={loadEntity}
                debounceTimeout={300}
                isClearable
                value={value}
                placeholder={t('transactionCreate:select_entity')}
                additional={{
                  page: 1,
                  isSuperAdmin,
                  defaultOptions: {
                    value: entity?.value ?? 0,
                    label: entity?.label ?? '',
                  },
                }}
                onChange={(option) => {
                  if (items && items?.length > 0) {
                    setContent({
                      title: t('transactionCreate:reset_dialog.description'),
                    })
                    setModalRemove(true, entity?.value)
                    setCustomFunction(() =>
                      handleEntityChange(option ?? null, onChange)
                    )
                  } else handleEntityChange(option ?? null, onChange)
                }}
                menuPosition="fixed"
                error={!!error?.message}
                disabled={!isSuperAdmin}
              />
              {error?.message && (
                <FormErrorMessage>{error?.message}</FormErrorMessage>
              )}
            </FormControl>
          )}
        />
        {TRANSACTION_TYPE.TRANSFER_STOCK !== Number(type) && (
          <Controller
            control={control}
            name="activity"
            render={({
              field: { value, onChange, ...field },
              fieldState: { error },
            }) => (
              <FormControl>
                <FormLabel htmlFor="select-transaction-activity" required>
                  {t('transactionCreate:select_activity')}
                </FormLabel>
                <ReactSelect
                  {...field}
                  key={`${entity?.value}-${type}`}
                  value={value}
                  id="select-transaction-activity"
                  placeholder={t(
                    'transactionCreate:placeholder_select_activity'
                  )}
                  options={entityActivities}
                  onChange={(option: TDetailActivityDate) => {
                    if (items && items?.length > 0) {
                      setContent({
                        title: t('transactionCreate:reset_dialog.description'),
                      })
                      setModalRemove(true, activity?.value)
                      setCustomFunction(() =>
                        handleActivityChange(option, onChange)
                      )
                    } else handleActivityChange(option, onChange)
                  }}
                  isClearable
                  error={!!error?.message}
                />
                {error?.message && (
                  <FormErrorMessage>{error?.message}</FormErrorMessage>
                )}
                <div className="ui-text-sm ui-italic ui-text-neutral-500">
                  {t('transactionCreate:caption_activity')}
                </div>
              </FormControl>
            )}
          />
        )}
        {[
          TRANSACTION_TYPE.LAST_MILE,
          TRANSACTION_TYPE.RETURN_FROM_HEALTH_FACILITIES,
        ].includes(Number(type)) && (
            <>
              <Controller
                control={control}
                name="customer"
                render={({
                  field: { value, onChange, ...field },
                  fieldState: { error },
                }) => (
                  <FormControl>
                    <FormLabel htmlFor="select-transaction-customer" required>
                      {t('transactionCreate:customer')}
                    </FormLabel>
                    <ReactSelectAsync
                      {...field}
                      key={`${entity?.value}-${activity?.value}`}
                      id="select-transaction-customer"
                      loadOptions={loadCustomer}
                      debounceTimeout={300}
                      value={value}
                      isClearable
                      placeholder={t('transactionCreate:select_customer')}
                      additional={{
                        page: 1,
                        entity_id: entity?.value,
                        activity_id: activity?.value,
                      }}
                      onChange={(option: OptionType & TEntityCustomer) => {
                        if (
                          items &&
                          items?.length > 0 &&
                          resetItemsWhenCustomerChange
                        ) {
                          setContent({
                            title: t(
                              'transactionCreate:reset_dialog.description'
                            ),
                          })
                          setModalRemove(true, value?.value)
                          setCustomFunction(() =>
                            handleCustomerChange(option ?? null, onChange)
                          )
                        } else handleCustomerChange(option ?? null, onChange)
                      }}
                      menuPosition="fixed"
                      error={!!error?.message}
                    />
                    {error?.message && (
                      <FormErrorMessage>{error?.message}</FormErrorMessage>
                    )}
                  </FormControl>
                )}
              />
              <Controller
                control={control}
                name="actual_date"
                render={({
                  field: { value, onChange, ...field },
                  fieldState: { error },
                }) => (
                  <FormControl>
                    <FormLabel htmlFor="select-transaction-actual-date" required>
                      {Number(type) === TRANSACTION_TYPE.LAST_MILE
                        ? t('transactionCreate:actual_last_mile_date')
                        : t('transactionCreate:actual_return_date')}
                    </FormLabel>
                    <DatePicker
                      {...field}
                      id="transaction-actual-date"
                      data-testid="transaction-actual-date"
                      value={parseValidDate(value)}
                      maxValue={parseDate(dayjs(new Date()).format('YYYY-MM-DD'))}
                      onChange={handleDateChange(onChange)}
                      error={!!error?.message}
                    />
                    {error?.message && (
                      <FormErrorMessage>{error?.message}</FormErrorMessage>
                    )}
                  </FormControl>
                )}
              />
            </>
          )}
        {TRANSACTION_TYPE.TRANSFER_STOCK === Number(type) && (
          <TransactionCreateListProgram />
        )}
      </div>
    </div>
  )
}

export default TransactionCreateTransactionDetailForm
