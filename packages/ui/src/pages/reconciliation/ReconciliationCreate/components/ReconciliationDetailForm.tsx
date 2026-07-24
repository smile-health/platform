import React from 'react'
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '#components/form-control'
import { reValidateQueryFetchInfiniteScroll } from '#components/infinite-scroll-list'
import {
  OptionType,
  ReactSelect,
  ReactSelectAsync,
} from '#components/react-select'
import { Controller, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import useEntityActivitesOption from '../hooks/useEntityActivitesOption'
import { loadEntity } from '../reconciliation-create.services'
import { ReconciliationCreateForm } from '../reconciliation-create.type'
import { useModalWarningItemStore } from '../store/modal-warning.store'

const ReconciliationDetailForm = ({
  isSuperAdmin,
}: {
  isSuperAdmin: boolean
}) => {
  const { t } = useTranslation('reconciliation')
  const { watch, setValue, control } =
    useFormContext<ReconciliationCreateForm>()
  const { entity, opname_stock_items } = watch()
  const entityActivities = useEntityActivitesOption(entity?.value)
  const handleEntityChange = (
    option: OptionType | null,
    onChange: (value: OptionType | null) => void
  ) => {
    onChange(option)
    setValue('activity', null)
    setValue('material', null)
    setValue('opname_stock_items', [])
    reValidateQueryFetchInfiniteScroll()
  }
  const handleActivityChange = (
    option: OptionType | null,
    onChange: (value: OptionType | null) => void
  ) => {
    onChange(option)
    setValue('material', null)
    setValue('opname_stock_items', [])
    reValidateQueryFetchInfiniteScroll()
  }
  const { setModalRemove, setCustomFunction } = useModalWarningItemStore()
  return (
    <div className="ui-w-full ui-p-4 ui-pb-4 ui-border ui-border-gray-300 ui-rounded">
      <div className="ui-font-bold">{t('create.reconciliation_detail')}</div>
      <div className="ui-mt-6 ui-flex ui-flex-col ui-space-y-6">
        <Controller
          control={control}
          name="entity"
          render={({
            field: { value, onChange, ...field },
            fieldState: { error },
          }) => (
            <FormControl>
              <FormLabel htmlFor="select-reconciliation-entity" required>
                {t('create.entity.label')}
              </FormLabel>
              <ReactSelectAsync
                {...field}
                key={`${entity?.value}`}
                id="select-reconciliation-entity"
                loadOptions={loadEntity}
                debounceTimeout={300}
                value={value}
                placeholder={t('create.entity.placeholder')}
                additional={{
                  page: 1,
                  isSuperAdmin,
                  defaultOptions: {
                    value: entity?.value ?? 0,
                    label: entity?.label ?? '',
                  },
                }}
                onChange={(option) => {
                  if (opname_stock_items?.length > 0) {
                    setModalRemove(true)
                    setCustomFunction(() =>
                      handleEntityChange(option, onChange)
                    )
                  } else handleEntityChange(option, onChange)
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
        <Controller
          control={control}
          name="activity"
          render={({
            field: { value, onChange, ...field },
            fieldState: { error },
          }) => (
            <FormControl>
              <FormLabel htmlFor="select-reconciliation-activity" required>
                {t('create.activity.label')}
              </FormLabel>
              <ReactSelect
                {...field}
                key={`${entity?.value}`}
                value={value}
                id="select-reconciliation-activity"
                placeholder={t('create.activity.placeholder')}
                options={entityActivities}
                onChange={(option: OptionType) => {
                  if (opname_stock_items?.length > 0) {
                    setModalRemove(true)
                    setCustomFunction(() =>
                      handleActivityChange(option, onChange)
                    )
                  } else handleActivityChange(option, onChange)
                }}
                error={!!error?.message}
              />
              {error?.message && (
                <FormErrorMessage>{error?.message}</FormErrorMessage>
              )}
            </FormControl>
          )}
        />
      </div>
    </div>
  )
}

export default ReconciliationDetailForm
