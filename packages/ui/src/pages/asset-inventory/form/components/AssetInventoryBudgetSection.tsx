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
import { Controller, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { loadBudgetSource } from '../../../budget-source/budget-source.service'
import { generatedYearOptions } from '../libs/asset-inventory-form.common'
import AssetInventoryBudgetSourceMoreForm from './AssetInventoryBudgetSourceMoreForm'

type AssetInventoryBudgetSectionProps = {
  errors: any
  anotherOption: OptionType[]
}

export const AssetInventoryBudgetSection = ({
  errors,
  anotherOption,
}: AssetInventoryBudgetSectionProps) => {
  const { t } = useTranslation(['common', 'assetInventory'])
  const { control, setValue, trigger, watch } = useFormContext()

  return (
    <div className="ui-w-full ui-grid ui-grid-cols-1 ui-gap-4 ui-border ui-rounded-md ui-p-6 ui-mb-6">
      <div className="ui-font-bold ui-text-primary ui-text-dark-blue">
        {t('assetInventory:form.title.budget')}
      </div>
      <div className="ui-w-full ui-grid ui-grid-cols-1 ui-gap-4">
        <FormControl className="ui-w-full">
          <FormLabel htmlFor="production_year" required>
            {t('assetInventory:columns.production_year')}
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
                onChange={(e: OptionType) => {
                  setValue('production_year', e)
                  trigger('production_year')
                  trigger('budget_year')
                }}
                options={generatedYearOptions()}
                placeholder={t('assetInventory:type_to_search')}
                error={!!error?.message}
              />
            )}
          />
          {errors?.production_year?.message && (
            <FormErrorMessage>
              {errors?.production_year?.message}
            </FormErrorMessage>
          )}
        </FormControl>
        <FormControl className="ui-w-full">
          <FormLabel htmlFor="budget_year" required>
            {t('assetInventory:columns.budget_year')}
          </FormLabel>
          <Controller
            name="budget_year"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <ReactSelect
                {...field}
                id="budget_year"
                isClearable
                onChange={(e: OptionType) => {
                  setValue('budget_year', e)
                  trigger('budget_year')
                  trigger('production_year')
                }}
                isSearchable
                disabled={false}
                options={generatedYearOptions()}
                placeholder={t('assetInventory:type_to_search')}
                error={!!error?.message}
              />
            )}
          />
          {errors?.budget_year?.message && (
            <FormErrorMessage>{errors?.budget_year?.message}</FormErrorMessage>
          )}
        </FormControl>
        <FormControl className="ui-w-full">
          <FormLabel htmlFor="budget_source" required>
            {t('assetInventory:columns.budget_source')}
          </FormLabel>
          <Controller
            name="budget_source"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <ReactSelectAsync
                {...field}
                key={`budget_source__${field.value?.value}`}
                id="budget_source"
                isClearable
                disabled={false}
                loadOptions={loadBudgetSource}
                placeholder={t('assetInventory:type_to_search')}
                additional={{
                  page: 1,
                  another_option: anotherOption,
                }}
                error={!!error?.message}
              />
            )}
          />
          {errors?.budget_source?.message && (
            <FormErrorMessage>
              {errors?.budget_source?.message}
            </FormErrorMessage>
          )}
        </FormControl>
        {watch('budget_source')?.value === 'other' && (
          <AssetInventoryBudgetSourceMoreForm />
        )}
      </div>
    </div>
  )
}
