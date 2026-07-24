import React from 'react'
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '#components/form-control'
import { Input } from '#components/input'
import { Controller, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

const AssetInventoryBudgetSourceMoreForm = () => {
  const { t } = useTranslation(['common', 'assetInventory'])
  const methods = useFormContext()

  const {
    control,
    formState: { errors },
  } = methods
  return (
    <div className="ui-flex ui-flex-col ui-gap-4">
      <FormControl className="ui-w-full">
        <FormLabel htmlFor="other_budget_source_name" required>
          {t('assetInventory:other_inputs.budget_source_name')}
        </FormLabel>
        <Controller
          name="other_budget_source_name"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <Input
              {...field}
              id="other_budget_source_name"
              placeholder={t('assetInventory:other_inputs.budget_source_name')}
              error={!!error?.message}
            />
          )}
        />
        {errors?.other_budget_source_name?.message && (
          <FormErrorMessage>
            {typeof errors?.other_budget_source_name?.message === 'string' &&
              errors?.other_budget_source_name?.message}
          </FormErrorMessage>
        )}
      </FormControl>
    </div>
  )
}

export default AssetInventoryBudgetSourceMoreForm
