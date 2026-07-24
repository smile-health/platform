import React from 'react'
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '#components/form-control'
import { Input } from '#components/input'
import { Controller, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

const AssetInventoryBorrowedEntityMoreForm = () => {
  const { t } = useTranslation(['common', 'assetInventory'])
  const methods = useFormContext()

  const {
    control,
    formState: { errors },
  } = methods

  return (
    <div className="ui-flex ui-flex-col ui-gap-4 ui-bg-[#F1F5F9] ui-p-2 ui-rounded-md">
      <FormControl className="ui-w-full">
        <FormLabel htmlFor="other_borrowed_from_entity_name" required>
          {t('assetInventory:columns.borrowed_from_others')}
        </FormLabel>
        <Controller
          name="other_borrowed_from_entity_name"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <Input
              {...field}
              id="other_borrowed_from_entity_name"
              placeholder={t('assetInventory:columns.borrowed_from_others')}
              error={!!error?.message}
            />
          )}
        />
        {errors?.other_borrowed_from_entity_name?.message && (
          <FormErrorMessage>
            {typeof errors?.other_borrowed_from_entity_name?.message ===
              'string' && errors?.other_borrowed_from_entity_name?.message}
          </FormErrorMessage>
        )}
      </FormControl>
    </div>
  )
}

export default AssetInventoryBorrowedEntityMoreForm
