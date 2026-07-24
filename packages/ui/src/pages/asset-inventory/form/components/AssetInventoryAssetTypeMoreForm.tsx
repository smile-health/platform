import React from 'react'
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '#components/form-control'
import { Input } from '#components/input'
import { InputNumber } from '#components/input-number'
import { InputNumberV2 } from '#components/input-number-v2'
import { Controller, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

const AssetInventoryAssetTypeMoreForm = () => {
  const { t } = useTranslation(['common', 'assetInventory'])
  const methods = useFormContext()
  const temperatureUnit = process.env.TEMPERATURE_UNIT ?? 'C'
  const {
    control,
    register,
    setValue,
    trigger,
    watch,
    formState: { errors },
  } = methods
  return (
    <div className="ui-flex ui-flex-col ui-gap-4 ui-bg-[#F1F5F9] ui-p-2 ui-rounded-md">
      <FormControl className="ui-w-full">
        <FormLabel htmlFor="other_asset_type_name" required>
          {t('assetInventory:other_inputs.asset_type_name')}
        </FormLabel>
        <Controller
          name="other_asset_type_name"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <Input
              {...field}
              id="other_asset_type_name"
              placeholder={t('assetInventory:other_inputs.asset_type_name')}
              error={!!error?.message}
            />
          )}
        />
        {errors?.other_asset_type_name?.message && (
          <FormErrorMessage>
            {typeof errors?.other_asset_type_name?.message === 'string' &&
              errors?.other_asset_type_name?.message}
          </FormErrorMessage>
        )}
      </FormControl>
      <div className="ui-grid ui-grid-cols-2 ui-gap-4">
        <FormControl className="ui-w-full">
          <FormLabel htmlFor="other_min_temperature" required>
            {`${t('assetInventory:other_inputs.minimum_temperature')} (\u00B0${temperatureUnit})`}
          </FormLabel>
          <Controller
            name="other_min_temperature"
            control={control}
            render={({ fieldState: { error } }) => (
              <InputNumber
                hideStepper
                id="other_min_temperature"
                name="other_min_temperature"
                placeholder={t(
                  'assetInventory:other_inputs.minimum_temperature'
                )}
                value={Number(watch('other_min_temperature')) ?? undefined}
                onChange={(value) => {
                  setValue('other_min_temperature', Number(value) ?? undefined)
                  trigger('other_max_temperature')
                  trigger('other_min_temperature')
                }}
                error={!!error?.message}
              />
            )}
          />
          {errors?.other_min_temperature?.message && (
            <FormErrorMessage>
              {typeof errors?.other_min_temperature?.message === 'string' &&
                errors?.other_min_temperature?.message}
            </FormErrorMessage>
          )}
        </FormControl>
        <FormControl className="ui-w-full">
          <FormLabel htmlFor="other_max_temperature" required>
            {`${t('assetInventory:other_inputs.maximum_temperature')} (\u00B0${temperatureUnit})`}
          </FormLabel>
          <Controller
            name="other_max_temperature"
            control={control}
            render={({ fieldState: { error } }) => (
              <InputNumber
                hideStepper
                id="other_max_temperature"
                name="other_max_temperature"
                placeholder={t(
                  'assetInventory:other_inputs.maximum_temperature'
                )}
                value={Number(watch('other_max_temperature')) ?? undefined}
                onChange={(value) => {
                  setValue('other_max_temperature', Number(value) ?? undefined)
                  trigger('other_max_temperature')
                  trigger('other_min_temperature')
                }}
                error={!!error?.message}
              />
            )}
          />
          {errors?.other_max_temperature?.message && (
            <FormErrorMessage>
              {typeof errors?.other_max_temperature?.message === 'string' &&
                errors?.other_max_temperature?.message}
            </FormErrorMessage>
          )}
        </FormControl>
      </div>
    </div>
  )
}

export default AssetInventoryAssetTypeMoreForm
