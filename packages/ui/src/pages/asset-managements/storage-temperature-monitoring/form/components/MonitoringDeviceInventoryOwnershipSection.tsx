import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '#components/form-control'
import { InputNumberV2 } from '#components/input-number-v2'
import { Radio, RadioGroup } from '#components/radio'
import { OptionType, ReactSelectAsync } from '#components/react-select'
import { BOOLEAN } from '#constants/common'
import { loadEntities } from '#services/entity'
import { GetProfileResponse } from '#services/profile'
import { Controller, useFormContext, UseFormRegister } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import {
  assetOpnameOwnershipStatus,
  OWNERSHIP_STATUS,
} from '../../StorageTemperatureMonitoringDetail/libs/storage-temperature-monitoring-detail.constant'
import MonitoringDeviceInventoryBorrowedEntityMoreForm from './MonitoringDeviceInventoryBorrowedEntityMoreForm'

type MonitoringDeviceInventoryOwnershipSectionProps = {
  errors: any
  isSuperAdmin: boolean
  anotherOption: OptionType[]
  profile?: GetProfileResponse
}

export const MonitoringDeviceInventoryOwnershipSection = ({
  errors,
  profile,
  isSuperAdmin,
  anotherOption,
}: MonitoringDeviceInventoryOwnershipSectionProps) => {
  const { t } = useTranslation(['common', 'monitoringDeviceInventory'])
  const { control, setValue, trigger, watch, register, clearErrors } =
    useFormContext()

  return (
    <div className="ui-w-full ui-grid ui-grid-cols-1 ui-gap-4 ui-border ui-rounded-md ui-p-6 ui-mb-6">
      <div className="ui-font-bold ui-text-primary ui-text-dark-blue">
        {t('monitoringDeviceInventory:form.title.ownership')}
      </div>
      <div className="ui-w-full ui-grid ui-grid-cols-2 ui-gap-4">
        <FormControl>
          <FormLabel required>
            {t('monitoringDeviceInventory:columns.own_status')}
          </FormLabel>
          <RadioGroup className="!ui-mt-5">
            {assetOpnameOwnershipStatus(t).map((option) => (
              <Radio
                {...register('ownership_status')}
                key={option.value}
                id={`radio__is__ownership__status__${option.value}`}
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
        <FormControl>
          <FormLabel
            htmlFor="borrowed_from"
            required={
              Number(watch('ownership_status')) === OWNERSHIP_STATUS.BORROWED
            }
          >
            {t('monitoringDeviceInventory:columns.borrowed_from')}
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
                loadOptions={loadEntities}
                placeholder={t('monitoringDeviceInventory:type_to_search')}
                additional={{
                  page: 1,
                  is_asset: BOOLEAN.TRUE,
                  province_id: !isSuperAdmin
                    ? profile?.entity?.province_id
                    : watch('entity')?.province_id,
                  regency_id: !isSuperAdmin
                    ? profile?.entity?.regency_id
                    : watch('entity')?.regency_id,
                  sub_district_id: !isSuperAdmin
                    ? profile?.entity?.sub_district_id
                    : watch('entity')?.sub_district_id,
                  another_option: anotherOption,
                }}
                error={!!error?.message}
              />
            )}
          />
          {errors?.borrowed_from?.message && (
            <FormErrorMessage>
              {errors?.borrowed_from?.message}
            </FormErrorMessage>
          )}
          {watch('borrowed_from')?.value === 'other' && (
            <MonitoringDeviceInventoryBorrowedEntityMoreForm />
          )}
        </FormControl>
      </div>
      <FormControl className="ui-w-full">
        <FormLabel htmlFor="ownership_qty" required>
          {t('monitoringDeviceInventory:columns.owned_amount.label', {
            type:
              Number(watch('ownership_status')) === OWNERSHIP_STATUS.OWNED
                ? t('monitoringDeviceInventory:columns.owned_amount.type.owned')
                : t(
                    'monitoringDeviceInventory:columns.owned_amount.type.borrowed'
                  ),
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
              placeholder={t(
                'monitoringDeviceInventory:columns.owned_amount.placeholder'
              )}
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
