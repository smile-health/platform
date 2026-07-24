import React from 'react'
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '#components/form-control'
import { Input } from '#components/input'
import { Controller, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

const AssetInventoryManufactureMoreForm = () => {
  const { t } = useTranslation(['common', 'assetInventory'])
  const methods = useFormContext()

  const {
    control,
    formState: { errors },
  } = methods
  return (
    <div className="ui-flex ui-flex-col ui-gap-4 ui-bg-[#F1F5F9] ui-p-2 ui-rounded-md">
      <FormControl className="ui-w-full">
        <FormLabel htmlFor="other_manufacture_name" required>
          {t('assetInventory:other_inputs.manufacture_name')}
        </FormLabel>
        <Controller
          name="other_manufacture_name"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <Input
              {...field}
              id="other_manufacture_name"
              placeholder={t('assetInventory:other_inputs.manufacture_name')}
              error={!!error?.message}
            />
          )}
        />
        {errors?.other_manufacture_name?.message && (
          <FormErrorMessage>
            {typeof errors?.other_manufacture_name?.message === 'string' &&
              errors?.other_manufacture_name?.message}
          </FormErrorMessage>
        )}
      </FormControl>
    </div>
  )
}

export default AssetInventoryManufactureMoreForm
