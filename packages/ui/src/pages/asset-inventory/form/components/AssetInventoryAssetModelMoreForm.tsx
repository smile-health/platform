import React from 'react'
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '#components/form-control'
import { Input } from '#components/input'
import { InputNumber } from '#components/input-number'
import { Controller, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

const AssetInventoryAssetTypeMoreForm = () => {
  const { t } = useTranslation(['common', 'assetInventory'])
  const methods = useFormContext()

  const {
    control,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = methods
  return (
    <div className="ui-flex ui-flex-col ui-gap-4 ui-bg-[#F1F5F9] ui-p-2 ui-rounded-md">
      <FormControl className="ui-w-full">
        <FormLabel htmlFor="other_asset_model_name" required>
          {t('assetInventory:other_inputs.asset_model_name')}
        </FormLabel>
        <Controller
          name="other_asset_model_name"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <Input
              {...field}
              id="other_asset_model_name"
              placeholder={t('assetInventory:other_inputs.asset_model_name')}
              error={!!error?.message}
            />
          )}
        />
        {errors?.other_asset_model_name?.message && (
          <FormErrorMessage>
            {typeof errors?.other_asset_model_name?.message === 'string' &&
              errors?.other_asset_model_name?.message}
          </FormErrorMessage>
        )}
      </FormControl>
      <div className="ui-grid ui-grid-cols-2 ui-gap-4">
        <FormControl className="ui-w-full">
          <FormLabel htmlFor="other_gross_capacity" required>
            {t('assetInventory:other_inputs.gross_capacity')}
          </FormLabel>
          <Controller
            name="other_gross_capacity"
            control={control}
            render={({ fieldState: { error } }) => (
              <InputNumber
                hideStepper
                id="other_gross_capacity"
                name="other_gross_capacity"
                placeholder={`${t('assetInventory:other_inputs.gross_capacity')} (${t('assetInventory:capacity.litres')})`}
                value={Number(watch('other_gross_capacity'))}
                onChange={(value) => {
                  setValue('other_gross_capacity', Number(value))
                  trigger('other_gross_capacity')
                  trigger('other_net_capacity')
                }}
                error={!!error?.message}
              />
            )}
          />
          {errors?.other_gross_capacity?.message && (
            <FormErrorMessage>
              {typeof errors?.other_gross_capacity?.message === 'string' &&
                errors?.other_gross_capacity?.message}
            </FormErrorMessage>
          )}
        </FormControl>
        <FormControl className="ui-w-full">
          <FormLabel htmlFor="other_net_capacity" required>
            {t('assetInventory:other_inputs.netto_capacity')}
          </FormLabel>
          <Controller
            name="other_net_capacity"
            control={control}
            render={({ fieldState: { error } }) => (
              <InputNumber
                hideStepper
                id="other_net_capacity"
                name="other_net_capacity"
                placeholder={`${t('assetInventory:other_inputs.netto_capacity')} (${t('assetInventory:capacity.litres')})`}
                value={Number(watch('other_net_capacity'))}
                onChange={(value) => {
                  setValue('other_net_capacity', Number(value))
                  trigger('other_net_capacity')
                  trigger('other_gross_capacity')
                }}
                error={!!error?.message}
              />
            )}
          />
          {errors?.other_net_capacity?.message && (
            <FormErrorMessage>
              {typeof errors?.other_net_capacity?.message === 'string' &&
                errors?.other_net_capacity?.message}
            </FormErrorMessage>
          )}
        </FormControl>
      </div>
    </div>
  )
}

export default AssetInventoryAssetTypeMoreForm
