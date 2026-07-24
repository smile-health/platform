import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '#components/form-control'
import { InputNumberV2 } from '#components/input-number-v2'
import { Radio, RadioGroup } from '#components/radio'
import { OptionType, ReactSelectAsync } from '#components/react-select'
import { USER_ROLE } from '#constants/roles'
import { loadCoreEntities } from '#services/entity'
import { GetProfileResponse } from '#services/profile'
import { Controller, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import {
  assetOpnameOwnershipStatus,
  OWNERSHIP_STATUS,
} from '../../detail/libs/asset-inventory-detail.constant'
import AssetInventoryBorrowedEntityMoreForm from './AssetInventoryBorrowedEntityMoreForm'

type AssetInventoryOwnershipSectionProps = {
  errors: any
  anotherOption: OptionType[]
  profile?: GetProfileResponse
}

export const AssetInventoryOwnershipSection = ({
  errors,
  profile,
  anotherOption,
}: AssetInventoryOwnershipSectionProps) => {
  const { t } = useTranslation(['common', 'assetInventory'])
  const { control, setValue, trigger, watch, register, clearErrors } =
    useFormContext()

  return (
    <div className="ui-w-full ui-grid ui-grid-cols-1 ui-gap-4 ui-border ui-rounded-md ui-p-6 ui-mb-6">
      <div className="ui-font-bold ui-text-primary ui-text-dark-blue">
        {t('assetInventory:form.title.ownership')}
      </div>
      <FormControl>
        <FormLabel required>{t('assetInventory:columns.own_status')}</FormLabel>
        <RadioGroup className="!ui-mt-5">
          {assetOpnameOwnershipStatus(t).map((option) => (
            <Radio
              {...register('ownership_status')}
              key={option.value}
              id={`radio__is__material__add__remove__stock__${option.value}`}
              value={option.value}
              checked={Number(watch('ownership_status')) === option.value}
              onChange={(e) => {
                setValue('ownership_status', Number(e.target.value))
                clearErrors('borrowed_from')
                if (
                  Number(watch('ownership_status')) === OWNERSHIP_STATUS.OWNED
                ) {
                  setValue('borrowed_from', null)
                }
              }}
              defaultChecked={
                Number(watch('ownership_status')) === option.value
              }
              label={option.label}
            />
          ))}
        </RadioGroup>
        {errors?.ownership_status?.message && (
          <FormErrorMessage>
            {errors?.ownership_status?.message}
          </FormErrorMessage>
        )}
      </FormControl>
      <FormControl className="ui-w-full">
        <FormLabel
          htmlFor="borrowed_from"
          required={
            Number(watch('ownership_status')) === OWNERSHIP_STATUS.BORROWED
          }
        >
          {t('assetInventory:columns.borrowed_from')}
        </FormLabel>
        <Controller
          name="borrowed_from"
          control={control}
          render={({ field: { value, ...field }, fieldState: { error } }) => (
            <ReactSelectAsync
              {...field}
              value={value}
              key={`borrowed_from__${value}`}
              id="borrowed_from"
              isClearable
              disabled={
                Number(watch('ownership_status')) === OWNERSHIP_STATUS.OWNED
              }
              loadOptions={loadCoreEntities}
              placeholder={t('assetInventory:type_to_search')}
              additional={{
                page: 1,
                another_option: anotherOption,
                ...(profile?.role !== USER_ROLE?.SUPERADMIN && {
                  is_asset: 1,
                }),
              }}
              error={!!error?.message}
            />
          )}
        />
        {errors?.borrowed_from?.message && (
          <FormErrorMessage>{errors?.borrowed_from?.message}</FormErrorMessage>
        )}
        {watch('borrowed_from')?.value === 'other' && (
          <AssetInventoryBorrowedEntityMoreForm />
        )}
      </FormControl>
      <FormControl className="ui-w-full">
        <FormLabel htmlFor="ownership_qty" required>
          {t('assetInventory:columns.owned_amount.label', {
            type:
              Number(watch('ownership_status')) === OWNERSHIP_STATUS.OWNED
                ? t('assetInventory:columns.owned_amount.type.owned')
                : t('assetInventory:columns.owned_amount.type.borrowed'),
          })}
        </FormLabel>
        <Controller
          name="ownership_qty"
          control={control}
          render={({ fieldState: { error } }) => (
            <InputNumberV2
              {...register('ownership_qty')}
              id="ownership_qty"
              name="ownership_qty"
              placeholder={t('assetInventory:columns.owned_amount.placeholder')}
              value={watch('ownership_qty') ?? ''}
              onValueChange={(values) => {
                setValue('ownership_qty', values?.floatValue ?? null)
                trigger('ownership_qty')
              }}
              error={!!error?.message}
            />
          )}
        />
        {errors?.ownership_qty?.message && (
          <FormErrorMessage>
            {typeof errors?.ownership_qty?.message === 'string' &&
              errors?.ownership_qty?.message}
          </FormErrorMessage>
        )}
      </FormControl>
    </div>
  )
}
