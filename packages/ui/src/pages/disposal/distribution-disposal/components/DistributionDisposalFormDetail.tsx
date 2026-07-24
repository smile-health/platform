import React from 'react'
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '#components/form-control'
import { ReactSelect, ReactSelectAsync } from '#components/react-select'
import { Controller, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import useEntityActivitesOption from '../hooks/useEntityActivitiesOption'
import { loadEntity, loadVendor } from '../services/distribution-disposal'
import { DistributionDisposalForm } from '../types/DistributionDisposal'
import { reValidateQueryFetchInfiniteScroll } from '#components/infinite-scroll-list'

const DistributionDisposalFormDetail = ({
  isSuperAdmin,
}: {
  isSuperAdmin: boolean
}) => {
  const { t } = useTranslation(['common', 'distributionDisposal'])
  const { control, watch, setValue, clearErrors } =
    useFormContext<DistributionDisposalForm>()

  const { sender } = watch()

  const resetReceiver = () => {
    setValue('receiver', undefined)
    clearErrors('receiver')
  }

  const resetActivity = () => {
    setValue('activity', undefined)
    clearErrors('activity')
  }

  const resetOrderItems = () => {
    setValue('order_items', [])
    clearErrors('order_items')
  }

  const { entityActivities } = useEntityActivitesOption(sender?.value)

  return (
    <div className="ui-w-full ui-p-4 ui-pb-4 ui-border ui-border-gray-300 ui-rounded">
      <div className="ui-font-bold">
        {t('distributionDisposal:form.title.detail')}
      </div>
      <div className="ui-mt-6 ui-flex ui-flex-col ui-space-y-6">
        <Controller
          control={control}
          name="sender"
          render={({
            field: { value, onChange, ...field },
            fieldState: { error },
          }) => (
            <FormControl>
              <FormLabel htmlFor="select-sender" required>
                {t('distributionDisposal:form.label.entity_sender')}
              </FormLabel>
              <ReactSelectAsync
                {...field}
                key={`select-sender-${value}`}
                id="select-sender"
                loadOptions={loadEntity as any}
                debounceTimeout={300}
                value={value}
                placeholder={t(
                  'distributionDisposal:form.placeholder.entity_sender'
                )}
                additional={{
                  page: 1,
                  is_vendor: 1,
                }}
                onChange={(option) => {
                  onChange(option)
                  resetReceiver()
                  resetActivity()
                  resetOrderItems()
                }}
                menuPosition="fixed"
                error={!!error?.message}
                disabled={!isSuperAdmin}
              />
              {error?.message && (
                <FormErrorMessage>
                  {t(error?.message as 'common:validation.required')}
                </FormErrorMessage>
              )}
            </FormControl>
          )}
        />
        <Controller
          control={control}
          name="receiver"
          render={({
            field: { value, onChange, ...field },
            fieldState: { error },
          }) => (
            <FormControl>
              <FormLabel htmlFor="select-receiver" required>
                {t('distributionDisposal:form.label.entity_receiver')}
              </FormLabel>
              <ReactSelectAsync
                {...field}
                key={`select-receiver-${sender?.value}`}
                id="select-receiver"
                loadOptions={loadVendor}
                debounceTimeout={300}
                value={value}
                placeholder={t(
                  'distributionDisposal:form.placeholder.entity_receiver'
                )}
                additional={{
                  page: 1,
                  id: sender?.value,
                }}
                onChange={(option) => onChange(option)}
                menuPosition="fixed"
                error={!!error?.message}
              />
              {error?.message && (
                <FormErrorMessage>
                  {t(error?.message as 'common:validation.required')}
                </FormErrorMessage>
              )}
            </FormControl>
          )}
        />
        <Controller
          control={control}
          name="activity"
          render={({
            field: { value, onChange, ...field },
            fieldState: { error },
          }) => (
            <FormControl>
              <FormLabel htmlFor="select-activity" required>
                {t('distributionDisposal:form.label.activity')}
              </FormLabel>
              <ReactSelect
                {...field}
                key={`select-activity-${sender?.value}`}
                id="select-activity"
                options={entityActivities}
                value={value}
                placeholder={t(
                  'distributionDisposal:form.placeholder.activity'
                )}
                onChange={(option) => {
                  onChange(option)
                  resetOrderItems()
                  reValidateQueryFetchInfiniteScroll()
                }}
                menuPosition="fixed"
                error={!!error?.message}
              />
              {error?.message && (
                <FormErrorMessage>
                  {t(error?.message as 'common:validation.required')}
                </FormErrorMessage>
              )}
            </FormControl>
          )}
        />
      </div>
    </div>
  )
}

export default DistributionDisposalFormDetail
