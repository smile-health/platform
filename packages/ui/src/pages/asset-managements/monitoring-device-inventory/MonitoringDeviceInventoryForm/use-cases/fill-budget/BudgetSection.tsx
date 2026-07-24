import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '#components/form-control'
import { ReactSelect, ReactSelectAsync } from '#components/react-select'
import { Controller, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { generatedYearOptions } from '../../../../../asset-inventory/form/libs/asset-inventory-form.common'
import { loadBudgetSource } from '../../../../../transaction/TransactionCreate/TransactionAddStock/transaction-add-stock.service'
import { useMonitoringDeviceInventoryForm } from '../../MonitoringDeviceInventoryFormContext'

export const BudgetSection = () => {
  const { t } = useTranslation(['common', 'monitoringDeviceInventoryForm'])
  const { isGlobal } = useMonitoringDeviceInventoryForm()
  const {
    control,
    trigger,
    formState: { errors },
  } = useFormContext()

  return (
    <div className="ui-w-full ui-grid ui-grid-cols-1 ui-gap-4 ui-border ui-rounded-md ui-p-6 ui-mb-6">
      <div className="ui-font-bold ui-text-primary ui-text-dark-blue">
        {t('monitoringDeviceInventoryForm:section.budget.title')}
      </div>

      <FormControl className="ui-w-full">
        <FormLabel htmlFor="production_year" required>
          {t('monitoringDeviceInventoryForm:field.production_year.label')}
        </FormLabel>
        <Controller
          name="production_year"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <ReactSelect
              {...field}
              id="production_year"
              isClearable
              isSearchable
              options={generatedYearOptions()}
              placeholder={t(
                'monitoringDeviceInventoryForm:field.production_year.placeholder'
              )}
              onChange={(newValue) => {
                field.onChange(newValue)
                trigger('production_year')
                trigger('budget_year')
              }}
              error={!!error?.message}
            />
          )}
        />
        {errors?.production_year?.message && (
          <FormErrorMessage>
            {String(errors?.production_year?.message)}
          </FormErrorMessage>
        )}
      </FormControl>

      <FormControl className="ui-w-full">
        <FormLabel htmlFor="budget_year" required>
          {t('monitoringDeviceInventoryForm:field.budget_year.label')}
        </FormLabel>
        <Controller
          name="budget_year"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <ReactSelect
              {...field}
              id="budget_year"
              isClearable
              isSearchable
              options={generatedYearOptions()}
              onChange={(newValue) => {
                field.onChange(newValue)
                trigger('production_year')
                trigger('budget_year')
              }}
              placeholder={t(
                'monitoringDeviceInventoryForm:field.budget_year.placeholder'
              )}
              error={!!error?.message}
            />
          )}
        />
        {errors?.budget_year?.message && (
          <FormErrorMessage>
            {String(errors?.budget_year?.message)}
          </FormErrorMessage>
        )}
      </FormControl>

      <FormControl className="ui-w-full">
        <FormLabel htmlFor="budget_source_id" required>
          {t('monitoringDeviceInventoryForm:field.budget_source.label')}
        </FormLabel>
        <Controller
          name="budget_source_id"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <ReactSelectAsync
              {...field}
              key={`budget_source_id__${field.value?.value}`}
              id="budget_source_id"
              isClearable
              loadOptions={loadBudgetSource}
              placeholder={t(
                'monitoringDeviceInventoryForm:field.budget_source.placeholder'
              )}
              additional={{
                page: 1,
                isGlobal,
                isSelectableRestricted: true,
              }}
              error={!!error?.message}
            />
          )}
        />
        {errors?.budget_source_id?.message && (
          <FormErrorMessage>
            {String(errors?.budget_source_id?.message)}
          </FormErrorMessage>
        )}
      </FormControl>
    </div>
  )
}
