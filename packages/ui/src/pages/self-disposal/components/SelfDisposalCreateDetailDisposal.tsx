import React from 'react'
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '#components/form-control'
import {
  OptionType,
  ReactSelectAsync,
  ReactSelectWithQuery,
} from '#components/react-select'
import { Controller, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { FormData } from '../schema/SelfDisposalFormSchema'
import { loadActivity, loadEntity, loadMethod } from '../self-disposal.service'
import { ValueChange } from '../self-disposal.type'
import { reValidateQueryFetchInfiniteScroll } from '#components/infinite-scroll-list'

const SelfDisposalCreateDetailDisposal = ({
  isSuperAdmin = false,
  setOpenConfirmationChange,
}: {
  isSuperAdmin: boolean,
  setOpenConfirmationChange: (values: ValueChange) => void
}) => {
  const { t } = useTranslation('selfDisposal')
  const { control, setValue, watch } = useFormContext<FormData>()
  const { entity, materials } = watch()

  const materialsExist = (materials ?? []).length > 0

  return (
    <div className="ui-w-full ui-p-4 ui-pb-4 ui-border ui-border-gray-300 ui-rounded">
      <div className="ui-font-bold">{t('create.disposal_detail')}</div>
      <div className="ui-mt-6 ui-flex ui-flex-col ui-space-y-6">
        <Controller
          control={control}
          name="entity"
          render={({
            field: { value, onChange, ...field },
            fieldState: { error },
          }) => (
            <FormControl>
              <FormLabel htmlFor="select-entity" required>{t('create.entity.label')}</FormLabel>
              <ReactSelectAsync
                {...field}
                key="entity"
                id="select-self-disposal-entity"
                loadOptions={loadEntity}
                debounceTimeout={300}
                isClearable
                value={value}
                placeholder={t('create.entity.placeholder')}
                additional={{
                  page: 1,
                  is_vendor: 1,
                  isSuperAdmin,
                  defaultOptions: {
                    value: 1,
                    label: 'test',
                  },
                }}
                onChange={(option) => {
                  if (option?.value !== value?.value) {
                    if (materialsExist) {
                      setOpenConfirmationChange({
                        type: 'entity',
                        value: option as OptionType,
                      })
                    } else if (option?.value !== value?.value) {
                      onChange(option)
                      //@ts-ignore
                      setValue('activity', null)
                      //@ts-ignore
                      setValue('disposal_method', null)
                      setValue('materials', [])
                    }
                  }
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
              <FormLabel htmlFor="select-activity" required>{t('create.activity.label')}</FormLabel>
              <ReactSelectAsync
                {...field}
                id="select-self-disposal-activity"
                loadOptions={loadActivity}
                debounceTimeout={300}
                value={value}
                placeholder={t('create.activity.placeholder')}
                additional={{
                  page: 1,
                  id: entity?.value,
                }}
                onChange={(option) => {
                  if (option?.value !== value?.value) {
                    if (materialsExist) {
                      setOpenConfirmationChange({
                        type: 'activity',
                        value: option as OptionType,
                      })
                    } else if (option?.value !== value?.value) {
                      onChange(option)
                      //@ts-ignore
                      setValue('disposal_method', null)
                      setValue('materials', [])
                    }
                  }
                }}
                key={`activity-${entity?.value}`}
                disabled={!entity?.value}
                menuPosition="fixed"
                error={!!error?.message}
              />
              {error?.message && (
                <FormErrorMessage>{error?.message}</FormErrorMessage>
              )}
              <div className="ui-text-sm ui-italic ui-text-neutral-500">
                {t('create.activity.note')}
              </div>
            </FormControl>
          )}
        />
        <Controller
          control={control}
          name="disposal_method"
          render={({
            field: { value, onChange, ...field },
            fieldState: { error },
          }) => (
            <FormControl>
              <FormLabel htmlFor="select-disposal-method" required>{t('create.flow.label')}</FormLabel>
              <ReactSelectWithQuery
                name="disposal_method"
                id="select-self-disposal-flow"
                loadOptions={loadMethod}
                isClearable
                value={value}
                placeholder={t('create.flow.placeholder')}
                onChange={(newValue: any) => {
                  if (materialsExist) {
                    setOpenConfirmationChange({
                      type: 'flow',
                      value: newValue,
                    })
                  } else if (newValue?.value !== value?.value) {
                    onChange(newValue)
                    setValue('materials', [])
                    reValidateQueryFetchInfiniteScroll()
                  }
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
      </div>
    </div>
  )
}

export default SelfDisposalCreateDetailDisposal
