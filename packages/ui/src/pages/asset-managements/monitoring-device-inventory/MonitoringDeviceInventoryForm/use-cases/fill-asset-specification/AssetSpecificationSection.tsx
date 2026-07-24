import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '#components/form-control'
import { Input } from '#components/input'
import { ReactSelectAsync } from '#components/react-select'
import { loadAssetModelWithData } from '#services/asset-model'
import { loadAssetType } from '#services/asset-type'
import { loadPlatformManufacturers } from '#services/manufacturer'
import { Controller, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { loadVendor } from '../../../../../asset-inventory/services/asset-inventory.services'
import { ASSET_TYPE_RTMD_ID } from '../../../monitoring-device-inventory.constants'
import { useMonitoringDeviceInventoryForm } from '../../MonitoringDeviceInventoryFormContext'

export const AssetSpecificationSection = () => {
  const { t } = useTranslation(['common', 'monitoringDeviceInventoryForm'])
  const { isGlobal } = useMonitoringDeviceInventoryForm()
  const {
    control,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useFormContext()

  return (
    <div className="ui-w-full ui-grid ui-grid-cols-1 ui-gap-4 ui-border ui-rounded-md ui-p-6 ui-mb-6">
      <div className="ui-font-bold ui-text-primary ui-text-dark-blue">
        {t('monitoringDeviceInventoryForm:section.asset_specification.title')}
      </div>

      <FormControl className="ui-w-full">
        <FormLabel htmlFor="asset_type_id" required>
          {t('monitoringDeviceInventoryForm:field.asset_type.label')}
        </FormLabel>
        <Controller
          name="asset_type_id"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <ReactSelectAsync
              {...field}
              id="asset_type_id"
              isClearable
              isDisabled
              loadOptions={loadAssetType}
              placeholder={t(
                'monitoringDeviceInventoryForm:field.asset_type.placeholder'
              )}
              additional={{
                page: 1,
                status: 1,
              }}
              disabled
              error={!!error?.message}
            />
          )}
        />
        {errors?.asset_type_id?.message && (
          <FormErrorMessage>
            {String(errors?.asset_type_id?.message)}
          </FormErrorMessage>
        )}
      </FormControl>

      <FormControl className="ui-w-full">
        <FormLabel htmlFor="asset_model_id" required>
          {t('monitoringDeviceInventoryForm:field.asset_model.label')}
        </FormLabel>
        <Controller
          name="asset_model_id"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <ReactSelectAsync
              {...field}
              key={`asset_model_id__${watch('asset_type_id')?.value}`}
              id="asset_model_id"
              isClearable
              disabled={!watch('asset_type_id')}
              loadOptions={loadAssetModelWithData}
              placeholder={t(
                'monitoringDeviceInventoryForm:field.asset_model.placeholder'
              )}
              onChange={(selectedOption) => {
                field.onChange(selectedOption)
                setValue(
                  'manufacture_id',
                  selectedOption?.data
                    ? {
                        value: selectedOption?.data?.manufacture_id ?? null,
                        label: selectedOption?.data?.manufacture_name ?? null,
                      }
                    : null
                )
                trigger('manufacture_id')
              }}
              additional={{
                page: 1,
                asset_type_ids:
                  watch('asset_type_id')?.value ?? ASSET_TYPE_RTMD_ID,
                manufacture_id: watch('manufacture_id')?.value ?? null,
              }}
              error={!!error?.message}
            />
          )}
        />
        {errors?.asset_model_id?.message && (
          <FormErrorMessage>
            {String(errors?.asset_model_id?.message)}
          </FormErrorMessage>
        )}
      </FormControl>

      <FormControl className="ui-w-full">
        <FormLabel htmlFor="manufacture_id" required>
          {t('monitoringDeviceInventoryForm:field.manufacturer.label')}
        </FormLabel>
        <Controller
          name="manufacture_id"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <ReactSelectAsync
              {...field}
              key={`manufacture_id__${watch('asset_type_id')?.value}`}
              id="manufacture_id"
              isClearable
              disabled
              loadOptions={loadPlatformManufacturers}
              placeholder={t(
                'monitoringDeviceInventoryForm:field.manufacturer.placeholder'
              )}
              additional={{
                page: 1,
                status: 1,
                asset_type_id:
                  watch('asset_type_id')?.value ?? ASSET_TYPE_RTMD_ID,
                isGlobal,
              }}
              error={!!error?.message}
            />
          )}
        />
        {errors?.manufacture_id?.message && (
          <FormErrorMessage>
            {String(errors?.manufacture_id?.message)}
          </FormErrorMessage>
        )}
      </FormControl>

      <FormControl className="ui-w-full">
        <FormLabel htmlFor="asset_vendor_id" required>
          {t('monitoringDeviceInventoryForm:field.vendor.label')}
        </FormLabel>
        <Controller
          name="asset_vendor_id"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <ReactSelectAsync
              {...field}
              id="asset_vendor_id"
              isClearable
              loadOptions={loadVendor}
              placeholder={t(
                'monitoringDeviceInventoryForm:field.vendor.placeholder'
              )}
              additional={{
                page: 1,
                status: 1,
                isGlobal,
                is_provider: 0,
              }}
              error={!!error?.message}
            />
          )}
        />
        {errors?.asset_vendor_id?.message && (
          <FormErrorMessage>
            {String(errors?.asset_vendor_id?.message)}
          </FormErrorMessage>
        )}
      </FormControl>

      <FormControl className="ui-w-full">
        <FormLabel htmlFor="asset_communication_provider" required>
          {t(
            'monitoringDeviceInventoryForm:field.communication_provider.label'
          )}
        </FormLabel>
        <Controller
          name="asset_communication_provider"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <ReactSelectAsync
              {...field}
              id="asset_communication_provider"
              isClearable
              loadOptions={loadVendor}
              placeholder={t(
                'monitoringDeviceInventoryForm:field.communication_provider.placeholder'
              )}
              additional={{
                page: 1,
                status: 1,
                is_provider: 1,
                isGlobal,
              }}
              error={!!error?.message}
            />
          )}
        />
        {errors?.asset_communication_provider?.message && (
          <FormErrorMessage>
            {String(errors?.asset_communication_provider?.message)}
          </FormErrorMessage>
        )}
      </FormControl>

      <FormControl className="ui-w-full">
        <FormLabel htmlFor="serial_number" required>
          {t('monitoringDeviceInventoryForm:field.serial_number.label')}
        </FormLabel>
        <Controller
          name="serial_number"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <Input
              {...field}
              id="serial_number"
              placeholder={t(
                'monitoringDeviceInventoryForm:field.serial_number.placeholder'
              )}
              error={!!error?.message}
            />
          )}
        />
        {errors?.serial_number?.message && (
          <FormErrorMessage>
            {String(errors?.serial_number?.message)}
          </FormErrorMessage>
        )}
      </FormControl>
    </div>
  )
}
